import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  Share,
  Platform,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

const BASE_CARD_W = 355;
const BASE_CARD_H = 570;
const BASE_BTN_W = 215;
const BASE_BTN_H = 75;

const { width: W, height: H } = Dimensions.get('window');
const isSmallH = H < 720;
const isTinyH = H < 640;
const baseScale = isTinyH ? 0.82 : isSmallH ? 0.9 : 1;

const widthGuard = Math.min(1, (W * 0.92) / (BASE_CARD_W * baseScale));
const SCALE = baseScale * widthGuard;

const CARD_W = Math.round(BASE_CARD_W * SCALE);
const CARD_H = Math.round(BASE_CARD_H * SCALE);
const BTN_W = Math.round(BASE_BTN_W * SCALE);
const BTN_H = Math.round(BASE_BTN_H * SCALE);

const SHARE_BOTTOM = 48 * SCALE; 

const IMAGES = {
  bg: require('../assets/background_RULES.png'), 
  card: require('../assets/About_app.png'),     
  share: require('../assets/share_app.png'),    
  close: require('../assets/bt_close.png'),     
};

export default function AboutScreen({ navigation }: Props) {
  const ease = Easing.out(Easing.cubic);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(40)).current;

  const shareOpacity = useRef(new Animated.Value(0)).current;
  const shareY = useRef(new Animated.Value(24)).current;

  const closeOpacity = useRef(new Animated.Value(0)).current;
  const closeY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 260, easing: ease, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 0, duration: 480, easing: ease, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(shareOpacity, { toValue: 1, duration: 220, easing: ease, useNativeDriver: true }),
        Animated.timing(shareY, { toValue: 0, duration: 360, easing: ease, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(closeOpacity, { toValue: 1, duration: 220, easing: ease, useNativeDriver: true }),
        Animated.timing(closeY, { toValue: 0, duration: 360, easing: ease, useNativeDriver: true }),
      ]),
    ]).start();
  }, [cardOpacity, cardY, shareOpacity, shareY, closeOpacity, closeY]);

  const shareScale = useRef(new Animated.Value(1)).current;
  const closeScale = useRef(new Animated.Value(1)).current;
  const pressIn = (v: Animated.Value) =>
    Animated.spring(v, { toValue: 0.96, friction: 6, useNativeDriver: true }).start();
  const pressOut = (v: Animated.Value) =>
    Animated.spring(v, { toValue: 1, friction: 6, useNativeDriver: true }).start();

  const onShare = async () => {
    try {
      await Share.share({
        message: 'Try this app! 🎮\n\nDownload: https://example.com',
        url: Platform.OS === 'ios' ? 'https://example.com' : undefined,
        title: 'Share the app',
      });
    } catch {
    }
  };

  const goHome = () => navigation.navigate('Home');

  return (
    <ImageBackground source={IMAGES.bg} style={s.bg} resizeMode="cover">
      <View style={s.center}>
        <Animated.View
          style={[
            s.cardWrap,
            {
              width: CARD_W,
              height: CARD_H,
              opacity: cardOpacity,
              transform: [{ translateY: cardY }],
            },
          ]}
        >
          <Image source={IMAGES.card} style={s.cardImg} resizeMode="contain" />
          <Animated.View
            style={[
              s.btnInside,
              {
                width: BTN_W,
                height: BTN_H,
                bottom: SHARE_BOTTOM,
                opacity: shareOpacity,
                transform: [{ translateY: shareY }, { scale: shareScale }],
              },
            ]}
          >
            <Pressable
              onPress={onShare}
              onPressIn={() => pressIn(shareScale)}
              onPressOut={() => pressOut(shareScale)}
              hitSlop={12}
              style={s.hit}
              android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
            >
              <Image source={IMAGES.share} style={s.btnImg} resizeMode="stretch" />
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: closeOpacity,
            transform: [{ translateY: closeY }, { scale: closeScale }],
            marginTop: 22 * SCALE,
          }}
        >
          <Pressable
            onPress={goHome}
            onPressIn={() => pressIn(closeScale)}
            onPressOut={() => pressOut(closeScale)}
            hitSlop={12}
            style={[s.btnBelow, { width: BTN_W, height: BTN_H }]}
            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          >
            <Image source={IMAGES.close} style={s.btnImg} resizeMode="stretch" />
          </Pressable>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 8, android: 0 }),
    paddingBottom: 12,
  },

  cardWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardImg: {
    width: '100%',
    height: '100%',
  },

  btnInside: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 5,
    borderRadius: 16,
    overflow: Platform.select({ android: 'hidden', ios: 'visible' }),
  },

  btnBelow: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: Platform.select({ android: 'hidden', ios: 'visible' }),
  },

  btnImg: {
    width: '100%',
    height: '100%',
  },
  hit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
