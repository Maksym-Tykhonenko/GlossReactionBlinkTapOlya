import React, { useEffect, useRef } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

export default function LoaderScreen({ navigation }: Props) {
  const { width: W, height: H } = Dimensions.get('window');
  const IS_SMALL = H < 720 || W < 360;

  const stagePadding = IS_SMALL ? 28 : 40;
  const maxW = W - stagePadding * 2;
  const maxH = H - stagePadding * 2;
  const ratio = 1 / 3.8;
  let candyW = Math.min(maxW, maxH * ratio);
  let candyH = candyW / ratio;

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(IS_SMALL ? 0.82 : 0.85)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: IS_SMALL ? 300 : 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 12,
        stiffness: 140,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: IS_SMALL ? 1100 : 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: IS_SMALL ? 1100 : 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    const t = setTimeout(() => navigation.replace('Onboarding'), 3000);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [navigation, opacity, scale, rotate, IS_SMALL]);

  const amplitude = IS_SMALL ? 5 : 6;
  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${amplitude}deg`, `${amplitude}deg`],
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ImageBackground
        source={require('../assets/background.png')}
        resizeMode="cover"
        style={styles.bg}
      >
        <View style={styles.stage}>
          <Animated.Image
            source={require('../assets/candy.png')}
            resizeMode="contain"
            style={{
              width: candyW,
              height: candyH,
              opacity,
              transform: [{ scale }, { rotate: rotateDeg }],
              ...(Platform.OS === 'android'
                ? { borderRadius: 1, overflow: 'hidden' as const }
                : null),
            }}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, width: '100%', height: '100%' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
