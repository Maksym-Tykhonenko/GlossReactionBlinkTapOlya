import React, { useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width: W, height: H } = Dimensions.get('window');
const isVerySmallH = H < 680;
const isSmallH = H < 720;

const IMAGES = {
  bg: require('../assets/background.png'),
  top: require('../assets/onb_top_1.png'),
  star: require('../assets/icon_star_green.png'),
  drop: require('../assets/icon_drop_purple.png'),
  bear: require('../assets/icon_bear_keychain.png'),
  heart: require('../assets/icon_heart_yellow.png'),
  btnPlay: require('../assets/btn_play_now.png'),
  btnRules: require('../assets/btn_rules.png'),
  btnProfile: require('../assets/btn_profile.png'),
  btnAbout: require('../assets/btn_about.png'),
};

const ROUTES: {
  play: keyof RootStackParamList;
  rules: keyof RootStackParamList;
  profile: keyof RootStackParamList;
  about: keyof RootStackParamList;
} = {
  play: 'GamePlay',
  rules: 'GameRules',
  profile: 'CloseAwards', 
  about: 'About',
};

const SCALE = isVerySmallH ? 0.85 : isSmallH ? 0.9 : 1;
const TOP_SIZE = Math.round(240 * SCALE);
const BTN_H = Math.round(90 * SCALE);
const BTN_W_TOP = Math.round(255 * SCALE);
const BTN_W = Math.round(240 * SCALE);
const GAP = isVerySmallH ? 8 : 12;

const CONTENT_PADDING_TOP = isVerySmallH ? 20 : 40;
const BUTTONS_MARGIN_TOP = isVerySmallH ? 12 : 28;
const DECO_TOP_BASE = isVerySmallH ? 140 : 160;

export default function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const go = (route: keyof RootStackParamList) => () => navigation.navigate(route);

  const topOpacity = useRef(new Animated.Value(0)).current;
  const topTranslate = useRef(new Animated.Value(-40)).current; 

  const btn1Opacity = useRef(new Animated.Value(0)).current;
  const btn1Translate = useRef(new Animated.Value(30)).current; 

  const btn2Opacity = useRef(new Animated.Value(0)).current;
  const btn2Translate = useRef(new Animated.Value(30)).current;

  const btn3Opacity = useRef(new Animated.Value(0)).current;
  const btn3Translate = useRef(new Animated.Value(30)).current;

  const btn4Opacity = useRef(new Animated.Value(0)).current;
  const btn4Translate = useRef(new Animated.Value(30)).current;

  const heartO = useRef(new Animated.Value(0)).current;
  const heartX = useRef(new Animated.Value(-40)).current;

  const bearO = useRef(new Animated.Value(0)).current;
  const bearX = useRef(new Animated.Value(40)).current;

  const starO = useRef(new Animated.Value(0)).current;
  const starY = useRef(new Animated.Value(40)).current; 

  const dropO = useRef(new Animated.Value(0)).current;
  const dropY = useRef(new Animated.Value(-40)).current; 

  useEffect(() => {
    const durationMultiplier = isVerySmallH ? 0.8 : 1;
    
    const easeOut = Easing.out(Easing.cubic);
    const springy = isSmallH
      ? Easing.out(Easing.cubic) 
      : Easing.bezier(0.2, 0.9, 0.2, 1);

    const topAnim = Animated.timing(topTranslate, {
      toValue: 0,
      duration: Math.round(520 * durationMultiplier),
      easing: springy,
      useNativeDriver: true,
    });

    const topFade = Animated.timing(topOpacity, {
      toValue: 1,
      duration: Math.round(420 * durationMultiplier),
      easing: easeOut,
      useNativeDriver: true,
    });

    const btnIn = (o: Animated.Value, t: Animated.Value, delay: number) =>
      Animated.parallel([
        Animated.timing(o, { toValue: 1, duration: Math.round(360 * durationMultiplier), delay, easing: easeOut, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: Math.round(420 * durationMultiplier), delay, easing: springy, useNativeDriver: true }),
      ]);
      
    const decoIn = (o: Animated.Value, axis: Animated.Value, delay: number) =>
      Animated.parallel([
        Animated.timing(o, { toValue: 1, duration: Math.round(380 * durationMultiplier), delay, easing: easeOut, useNativeDriver: true }),
        Animated.timing(axis, { toValue: 0, duration: Math.round(460 * durationMultiplier), delay, easing: springy, useNativeDriver: true }),
      ]);

    Animated.sequence([
      Animated.parallel([topAnim, topFade]),
      Animated.stagger(Math.round(110 * durationMultiplier), [
        decoIn(heartO, heartX, 0),
        decoIn(bearO, bearX, 40),
        decoIn(starO, starY, 60),
        decoIn(dropO, dropY, 80),
      ]),
      Animated.stagger(Math.round(90 * durationMultiplier), [
        btnIn(btn1Opacity, btn1Translate, 0),
        btnIn(btn2Opacity, btn2Translate, 0),
        btnIn(btn3Opacity, btn3Translate, 0),
        btnIn(btn4Opacity, btn4Translate, 0),
      ]),
    ]).start();
  }, [
    bearO,
    bearX,
    heartO,
    heartX,
    starO,
    starY,
    dropO,
    dropY,
    btn1Opacity,
    btn1Translate,
    btn2Opacity,
    btn2Translate,
    btn3Opacity,
    btn3Translate,
    btn4Opacity,
    btn4Translate,
    topOpacity,
    topTranslate,
  ]);

  return (
    <ImageBackground source={IMAGES.bg} style={s.bg} resizeMode="cover">
      <View style={[s.content, { paddingTop: CONTENT_PADDING_TOP + (Platform.OS === 'ios' ? 16 : 0) }]}>
   
        <Animated.Image
          source={IMAGES.heart}
          style={[
            s.deco,
            {
              width: clamp(Math.round(W * 0.14), 46 * SCALE, 72 * SCALE),
              height: clamp(Math.round(W * 0.14), 46 * SCALE, 72 * SCALE),
              left: 14,
              top: 110 * SCALE, 
              opacity: heartO,
              transform: [{ translateX: heartX }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.Image
          source={IMAGES.bear}
          style={[
            s.deco,
            {
              width: clamp(Math.round(W * 0.18), 60 * SCALE, 86 * SCALE),
              height: clamp(Math.round(W * 0.18), 60 * SCALE, 86 * SCALE),
              right: 14,
              top: 66 * SCALE,
              opacity: bearO,
              transform: [{ translateX: bearX }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.Image
          source={IMAGES.star}
          style={[
            s.deco,
            {
              width: clamp(Math.round(W * 0.16), 54 * SCALE, 80 * SCALE),
              height: clamp(Math.round(W * 0.16), 54 * SCALE, 80 * SCALE),
              left: 18,
              top: Math.max(DECO_TOP_BASE * SCALE, TOP_SIZE + 80 * SCALE), 
              opacity: starO,
              transform: [{ translateY: starY }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.Image
          source={IMAGES.drop}
          style={[
            s.deco,
            {
              width: clamp(Math.round(W * 0.15), 50 * SCALE, 76 * SCALE),
              height: clamp(Math.round(W * 0.15), 50 * SCALE, 76 * SCALE),
              right: 18,
              top: Math.max(DECO_TOP_BASE * SCALE, TOP_SIZE + 60 * SCALE), 
              opacity: dropO,
              transform: [{ translateY: dropY }],
            },
          ]}
          resizeMode="contain"
        />
        
        <Animated.View
          style={[
            s.topWrap,
            {
              opacity: topOpacity,
              transform: [{ translateY: topTranslate }, { scale: SCALE }],
            },
          ]}
        >
          <Image
            source={IMAGES.top}
            style={{ width: TOP_SIZE, height: TOP_SIZE, borderRadius: 26 }}
            resizeMode="contain"
          />
        </Animated.View>
       
        <View style={[s.buttons, { marginTop: BUTTONS_MARGIN_TOP, gap: GAP }]}>
          <Animated.View
            style={{ opacity: btn1Opacity, transform: [{ translateY: btn1Translate }] }}
          >
            <Pressable onPress={go(ROUTES.play)} style={[s.btn, { width: BTN_W_TOP, height: BTN_H }]}>
              <Image source={IMAGES.btnPlay} style={s.btnImg} resizeMode="stretch" />
            </Pressable>
          </Animated.View>

          <Animated.View
            style={{ opacity: btn2Opacity, transform: [{ translateY: btn2Translate }] }}
          >
            <Pressable onPress={go(ROUTES.rules)} style={[s.btn, { width: BTN_W, height: BTN_H }]}>
              <Image source={IMAGES.btnRules} style={s.btnImg} resizeMode="stretch" />
            </Pressable>
          </Animated.View>

          <Animated.View
            style={{ opacity: btn3Opacity, transform: [{ translateY: btn3Translate }] }}
          >
            <Pressable onPress={go(ROUTES.profile)} style={[s.btn, { width: BTN_W, height: BTN_H }]}>
              <Image source={IMAGES.btnProfile} style={s.btnImg} resizeMode="stretch" />
            </Pressable>
          </Animated.View>

          <Animated.View
            style={{ opacity: btn4Opacity, transform: [{ translateY: btn4Translate }] }}
          >
            <Pressable onPress={go(ROUTES.about)} style={[s.btn, { width: BTN_W, height: BTN_H }]}>
              <Image source={IMAGES.btnAbout} style={s.btnImg} resizeMode="stretch" />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  deco: {
    position: 'absolute',
    zIndex: 2,
  },
  topWrap: {
    zIndex: 3,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: {
    zIndex: 3,
    width: '100%',
    alignItems: 'center',
  },
  btn: {
    overflow: 'hidden',
    borderRadius: 18,
  },
  btnImg: { width: '100%', height: '100%' },
});