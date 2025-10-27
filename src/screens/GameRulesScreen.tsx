import React from 'react';
import { View, StyleSheet, ImageBackground, Image, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'GameRules'>;

const IMG_W = 350;
const IMG_H = 530;
const BTN_W = 215;
const BTN_H = 75;

const IMAGES = {
  bg: require('../assets/background_RULES.png'), 
  card: require('../assets/Group10.png'),        
  close: require('../assets/bt_close.png'),    
};

export default function GameRulesScreen({ navigation }: Props) {
  const goHome = () => navigation.navigate('Home');

  return (
    <ImageBackground source={IMAGES.bg} style={s.bg} resizeMode="cover">
      <View style={s.center}>
        <View style={[s.cardWrap, { width: IMG_W, height: IMG_H }]}>
          <Image source={IMAGES.card} style={s.cardImg} resizeMode="contain" />
          <Pressable
            onPress={goHome}
            style={[s.btnWrap, { width: BTN_W, height: BTN_H, bottom: -BTN_H / 2 }]}
            hitSlop={12}
          >
            <Image source={IMAGES.close} style={s.btnImg} resizeMode="stretch" />
          </Pressable>
        </View>
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
    padding: 20,
  },

  cardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  cardImg: {
    width: '100%',
    height: '100%',
  },

  btnWrap: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 5,
  },

  btnImg: {
    width: '100%',
    height: '100%',
  },
});
