import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const ANDROID_OFFSET = Platform.OS === 'android' ? -40 : 0; 

const isSmallH = height < 720;
const isTinyH = height < 640;
const SCALE = isTinyH ? 0.82 : isSmallH ? 0.9 : 1; 
const CARD_MAX_W = Math.min(420, width * 0.9) * SCALE;
const TOP_MAX_W = Math.min(380, width * 0.86) * SCALE;
const LIFT_AMOUNT = -40 * SCALE; 
const BASE_TOP_PADDING = height * 0.06 * SCALE;
const TOP_SECTION_PADDING = BASE_TOP_PADDING - LIFT_AMOUNT; 
const BASE_BOTTOM_LIFT = -60 * SCALE; 
const BOTTOM_LIFT = BASE_BOTTOM_LIFT + LIFT_AMOUNT; 

const BOTTOM_PADDING = 40 * SCALE;    
const BTN_WIDTH = 168 * SCALE;
const BTN_HEIGHT = 64 * SCALE;
const BTN_BOTTOM_ON_CARD = 58 * SCALE; 

export default function OnboardingScreen({ navigation }: Props) {
  const [page, setPage] = useState(0);
  const screens = useMemo(
    () => [
      {
        top: require('../assets/onb_top_1.png'),
        bottom: require('../assets/onb_card_1.png'),
        button: require('../assets/onb_btn_1_hello.png'),
      },
      {
        top: require('../assets/onb_top_2.png'),
        bottom: require('../assets/onb_card_2.png'),
        button: require('../assets/onb_btn_2_next.png'),
      },
      {
        top: require('../assets/onb_top_3.png'),
        bottom: require('../assets/onb_card_3.png'),
        button: require('../assets/onb_btn_3_start.png'),
      },
    ],
    []
  );

  const cur = screens[page];
  const ease = Easing.out(Easing.cubic);

  const topOpacity = useRef(new Animated.Value(0)).current;
  const topY = useRef(new Animated.Value(40)).current;         

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(60)).current;     

  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnY = useRef(new Animated.Value(80)).current;        
  
  const runIn = () => {
    topOpacity.setValue(0);
    topY.setValue(40);
    cardOpacity.setValue(0);
    cardY.setValue(60);
    btnOpacity.setValue(0);
    btnY.setValue(80);

    Animated.sequence([
    
      Animated.parallel([
        Animated.timing(topOpacity, { toValue: 1, duration: 260, easing: ease, useNativeDriver: true }),
        Animated.timing(topY, { toValue: 0, duration: 420, easing: ease, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 240, easing: ease, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 0, duration: 420, easing: ease, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 220, easing: ease, useNativeDriver: true }),
        Animated.timing(btnY, { toValue: 0, duration: 380, easing: ease, useNativeDriver: true }),
      ]),
    ]).start();
  };

  useEffect(() => {
    runIn();
  }, [page]); 

  const goNext = () => {
    if (page < 2) {
      Animated.parallel([
        Animated.timing(topOpacity, { toValue: 0, duration: 180, easing: ease, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0, duration: 180, easing: ease, useNativeDriver: true }),
        Animated.timing(btnOpacity, { toValue: 0, duration: 180, easing: ease, useNativeDriver: true }),
        Animated.timing(topY, { toValue: 20, duration: 180, easing: ease, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 30, duration: 180, easing: ease, useNativeDriver: true }),
        Animated.timing(btnY, { toValue: 40, duration: 180, easing: ease, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) {
          setPage((p) => p + 1);
        }
      });
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      resizeMode="cover"
      style={s.bg} 
      imageStyle={s.bgImage}
    >
      <Animated.View 
        style={[
            s.contentContainer,
            { transform: [{ translateY: ANDROID_OFFSET }] } 
        ]}
      >
        <View style={[s.topWrap, { paddingTop: TOP_SECTION_PADDING }]}>
          <Animated.Image
            source={cur.top}
            style={[
              s.topImg,
              {
                opacity: topOpacity,
                transform: [{ translateY: topY }, { scale: SCALE }],
              },
            ]}
            resizeMode="contain"
          />
        </View>
        <View style={[s.bottomWrap, { marginTop: BOTTOM_LIFT, paddingBottom: BOTTOM_PADDING }]}>
          <Animated.Image
            source={cur.bottom}
            style={[
              s.bottomCard,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardY }],
              },
            ]}
            resizeMode="contain"
          />
          <Animated.View
            style={[
              s.btnWrap,
              {
                bottom: BTN_BOTTOM_ON_CARD,
                opacity: btnOpacity,
                transform: [{ translateY: btnY }],
              },
            ]}
          >
            <Pressable onPress={goNext} hitSlop={12}>
              <Image
                source={cur.button}
                style={[s.btnImg, { width: BTN_WIDTH, height: BTN_HEIGHT }]}
                resizeMode="contain"
              />
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#9FD3FF', 
  },
  bgImage: {
  },
  contentContainer: { 
    flex: 1,
  },

  topWrap: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  topImg: {
    width: TOP_MAX_W,
    height: TOP_MAX_W,
  },

  bottomWrap: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bottomCard: {
    width: CARD_MAX_W,
    height: CARD_MAX_W * (384 / 253), 
  },

  btnWrap: {
    position: 'absolute',
    alignSelf: 'center',
  },
  btnImg: {
    width: BTN_WIDTH, 
    height: BTN_HEIGHT, 
  },
});