import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
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

type SweetKey = 'heart' | 'bear' | 'drop' | 'star';
type Counts = { [key in SweetKey]: number };

export type HistoryItem = { 
  level: number; 
  points: number; 
  counts: Counts; 
  sessionId: number; 
};

type Props = NativeStackScreenProps<RootStackParamList, 'GamePlay'>;

const { width: W, height: H } = Dimensions.get('window');

const IS_SMALL = H < 720 || W < 360;
const OFFSET_Y = 40; 
const FLY_STOP_Y = IS_SMALL ? 110 : 130;

const HOME_W = IS_SMALL ? 110 : 120;
const HOME_H = IS_SMALL ? 52  : 56; 

const PILL_W = IS_SMALL ? 140 : 160;
const PILL_H = IS_SMALL ? 50  : 54;
const PILL_ICON = IS_SMALL ? 24 : 28;

const PROGRESS_H = IS_SMALL ? 12 : 16;
const FONT_12 = IS_SMALL ? 11 : 12;

const SPAWN_INTERVAL_MS = 1500;
const FLY_DURATION_MS   = 1850;
const LEVEL_DURATION_SEC = 15;

const FLY_IMG = IS_SMALL ? 56 : 64;

let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}
const KEY_HISTORY = 'grbt:history';
const KEY_SESSION_ID = 'grbt:session_id';

const IMAGES = {
  bg: require('../assets/background.png'),
  btnHome: require('../assets/btn_go_home.png'),
  hudPill: require('../assets/hud_pill.png'),
  heart: require('../assets/icon_heart_yellow.png'),
  bear: require('../assets/icon_bear_keychain.png'),
  drop: require('../assets/icon_drop_purple.png'),
  star: require('../assets/icon_star_green.png'),
  popup: require('../assets/popup_card.png'),

  sweet: require('../assets/sweet_spark_active.png'),
  cream: require('../assets/cream_reflex_active.png'),
  cookie: require('../assets/cookie_star_active.png'),
  lucky: require('../assets/lucky_bear_active.png'),
  gloss: require('../assets/gloss_master_active.png'),
};

const SWEETS: SweetKey[] = ['heart', 'bear', 'drop', 'star'];
const SWEET_POINTS: Record<SweetKey, number> = {
  heart: 10,
  drop: 20,
  star: 30,
  bear: 50,
};

const RESULT_THRESHOLDS = [
  { min: 180, title: 'Gloss Master Medal', img: IMAGES.gloss,  desc: 'The final award, the pinnacle of skill.' },
  { min: 120, title: 'Lucky Bear',         img: IMAGES.lucky,  desc: 'For endurance and concentration.' },
  { min: 90,  title: 'Cookie Star',        img: IMAGES.cookie, desc: 'A symbol of balance and rhythm of the game.' },
  { min: 60,  title: 'Cream Reflex',       img: IMAGES.cream,  desc: 'For stable reaction and accuracy.' },
  { min: 0,   title: 'Sweet Spark',        img: IMAGES.sweet,  desc: 'The first award, a symbol of starting progress.' },
];

const zeroCounts: Counts = { heart: 0, star: 0, drop: 0, bear: 0 };

export default function GamePlayScreen({ navigation }: Props) {
  const [timeLeft, setTimeLeft] = useState(LEVEL_DURATION_SEC);
  const [totalPoints, setTotalPoints] = useState(0);
  const [counts, setCounts] = useState<Counts>(zeroCounts);  
  const [lastCaught, setLastCaught] = useState<SweetKey>('heart');

  const flyY = useRef(new Animated.Value(H + 40)).current;
  const flyX = useRef(new Animated.Value(W / 2)).current;
  const flyScale = useRef(new Animated.Value(1)).current;
  const [flyKey, setFlyKey] = useState<SweetKey>('heart');
  const flyTapDisabled = useRef(false);
  const totalPointsRef = useRef(0);
  const countsRef = useRef<Counts>(zeroCounts);

  const popOpacity = useRef(new Animated.Value(0)).current;
  const popY = useRef(new Animated.Value(0)).current;
  const [popXY, setPopXY] = useState({ x: W * 0.7, y: H * 0.25 + OFFSET_Y });
  const [popText, setPopText] = useState('+0');

  const [result, setResult] = useState<null | { title: string; desc: string; img: any }>(null);
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const popupScale = useRef(new Animated.Value(0.9)).current;

  const spawnerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerId   = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionId = useRef<number>(Date.now()); 

  const randomX = () => {
    const margin = IS_SMALL ? 38 : 50;
    return Math.random() * (W - margin * 2) + margin;
  };

  const spawn = () => {
    flyTapDisabled.current = false;
    const nextKey: SweetKey = SWEETS[Math.floor(Math.random() * SWEETS.length)];
    setFlyKey(nextKey);
    flyX.setValue(randomX());
    flyY.setValue(H + 60);
    flyScale.setValue(IS_SMALL ? 0.9 : 1);

    Animated.timing(flyY, {
      toValue: FLY_STOP_Y,
      duration: FLY_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };
  
  useEffect(() => { totalPointsRef.current = totalPoints; }, [totalPoints]);
  useEffect(() => { countsRef.current = counts; }, [counts]);

  useEffect(() => {
    AsyncStorage?.getItem(KEY_SESSION_ID)
      .then((id: string | null) => { 
        if (id) sessionId.current = parseInt(id, 10);
      })
      .finally(() => {
        startRound();
      });
      
    return () => stopAll();
  }, []);

  const startRound = () => {
    setTotalPoints(0);
    setCounts(zeroCounts);
    setTimeLeft(LEVEL_DURATION_SEC);
    setResult(null);
    popupOpacity.setValue(0);
    popupScale.setValue(0.9);

    spawn();
    spawnerId.current && clearInterval(spawnerId.current);
    timerId.current && clearInterval(timerId.current);

    spawnerId.current = setInterval(spawn, SPAWN_INTERVAL_MS);
    timerId.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endRound();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stopAll = () => {
    spawnerId.current && clearInterval(spawnerId.current);
    timerId.current && clearInterval(timerId.current);
  };

  const persistHistory = async (roundPoints: number, roundCounts: Counts) => {
    try {
      if (!AsyncStorage) return;
      const raw = await AsyncStorage.getItem(KEY_HISTORY);
      let arr: HistoryItem[] = raw ? JSON.parse(raw) : [];
      
      let currentSessionRounds = arr.filter(item => item.sessionId === sessionId.current);
      const nextLevel = (currentSessionRounds.at(-1)?.level ?? 0) + 1;

      const newRound: HistoryItem = { 
          level: nextLevel, 
          points: roundPoints, 
          counts: roundCounts, 
          sessionId: sessionId.current 
      };

      const next = [...arr, newRound];
      await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(next));
    } catch {}
  };

  const endRound = () => {
    stopAll();
    
    const finalPoints = totalPointsRef.current;
    const finalCounts = countsRef.current;
    
    const res =
      RESULT_THRESHOLDS.find((t) => finalPoints >= t.min) ??
      RESULT_THRESHOLDS[RESULT_THRESHOLDS.length - 1];
    setResult({ title: res.title, desc: res.desc, img: res.img });
    persistHistory(finalPoints, finalCounts);

    Animated.parallel([
      Animated.timing(popupOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(popupScale, { toValue: 1, damping: 12, stiffness: 140, useNativeDriver: true }),
    ]).start();
  };

  const onTapFly = () => {
    if (result || flyTapDisabled.current) return;
    flyTapDisabled.current = true;

    flyY.stopAnimation((currentY) => {
      const y = currentY as number;
      const xNow = (flyX as any)._value as number;

      const delta = SWEET_POINTS[flyKey];
      setLastCaught(flyKey);
      setTotalPoints((p) => p + delta);
      setCounts((c) => ({ ...c, [flyKey]: c[flyKey] + 1 }));

      setPopXY({ x: Math.min(Math.max(12, xNow), W - 72), y: Math.max(46, y) + OFFSET_Y });
      setPopText(`+${delta}`);

      Animated.sequence([
        Animated.timing(flyScale, { toValue: 0.86, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(flyScale, { toValue: IS_SMALL ? 0.9 : 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();

      popOpacity.setValue(0);
      popY.setValue(0);
      Animated.parallel([
        Animated.timing(popOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(popY, { toValue: -22, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(popOpacity, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
            flyTapDisabled.current = false;
        });
      });
    });
  };

  const curFlyImg = useMemo(() => IMAGES[flyKey], [flyKey]);

  return (
    <ImageBackground source={IMAGES.bg} style={s.bg} resizeMode="cover">
      <View style={[s.headerOverlay, { paddingTop: OFFSET_Y }]}>
        <View style={s.hudRow}>
          <Pressable onPress={() => navigation.navigate('Home')} hitSlop={12} style={s.homeBtn}>
            <Image source={IMAGES.btnHome} style={{ width: HOME_W, height: HOME_H }} resizeMode="stretch" />
          </Pressable>
          <View style={[s.catchWrap, { height: PILL_H, minWidth: PILL_W }]}>
            <Image source={IMAGES.hudPill} style={[s.catchBg, { width: PILL_W, height: PILL_H }]} resizeMode="stretch" />
            <Image source={IMAGES[lastCaught]} style={[s.catchIcon, { width: PILL_ICON, height: PILL_ICON }]} resizeMode="contain" />
          </View>
        </View>

        <View style={s.progressWrap}>
          <Text style={[s.progressLabel, { fontSize: FONT_12 }]}>Level reaction</Text>
          
          <View style={[s.progressBar, { height: PROGRESS_H }]}>
            <View
              style={[
                s.progressFill,
                { width: `${Math.min(100, ((LEVEL_DURATION_SEC - timeLeft) / LEVEL_DURATION_SEC) * 100)}%` },
              ]}
            />
            <Text style={[s.progressTimerText, { fontSize: FONT_12 }]}>{timeLeft}s</Text>
            <Text style={[s.progressScoreText, { fontSize: FONT_12 }]}>{totalPoints} pts</Text>
          </View>
        </View>
      </View>
      <Animated.View
        pointerEvents={flyTapDisabled.current ? "none" : "box-none"}
        style={[
          s.fly,
          {
            transform: [
              { translateX: Animated.subtract(flyX, FLY_IMG / 2) },
              { translateY: Animated.add(flyY, new Animated.Value(OFFSET_Y)) },
              { scale: flyScale },
            ],
          },
        ]}
      >
        <Pressable onPress={onTapFly} hitSlop={8}>
          <Image source={curFlyImg} style={{ width: FLY_IMG, height: FLY_IMG }} resizeMode="contain" />
        </Pressable>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[s.pointsPop, { left: popXY.x, top: popXY.y, opacity: popOpacity, transform: [{ translateY: popY }] }]}
      >
        <Text style={[s.pointsText, { fontSize: FONT_12 }]}>{popText}</Text>
      </Animated.View>
      {result && (
        <Animated.View style={[s.centerOverlay, { opacity: popupOpacity }]}>
          <Animated.View style={[s.resultCard, { transform: [{ scale: popupScale }] }]}>
            <Image source={IMAGES.popup} style={s.resultBg} resizeMode="stretch" />
            <View style={s.resultInner}>
              <Image source={result.img} style={{ width: IS_SMALL ? 50 : 56, height: IS_SMALL ? 50 : 56 }} resizeMode="contain" />
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={[s.resultTitle, { fontSize: IS_SMALL ? 14 : 16 }]}>ROUND RESULT</Text>
                <Text style={[s.resultDesc, { fontSize: FONT_12 }]}>
                  {result.title}
                  {'\n'}— {result.desc}
                  {'\n'}Total: {totalPoints} pts
                </Text>
              </View>
            </View>

            <Pressable style={s.resultBtn} onPress={startRound}>
              <Text style={s.resultBtnText}>Close & Play again</Text>
            </Pressable>
            
            <Pressable 
                style={[s.resultBtn, {marginBottom: 14}]} 
                onPress={() => navigation.replace('CloseAwards')}
            >
                <Text style={s.resultBtnText}>Go to profile</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },

  headerOverlay: { zIndex: 20, elevation: 20 },

  hudRow: {
    paddingTop: Platform.select({ ios: 14, android: 8 }),
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeBtn: { paddingVertical: 6, paddingRight: 6 }, 

  catchWrap: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchBg: { position: 'absolute', top: 0, left: 0, right: 0 },
  catchIcon: { position: 'absolute', right: 8 },

  progressWrap: { 
    marginTop: 10, 
    marginHorizontal: 16, 
    alignItems: 'center',
    position: 'relative',
  },
  progressLabel: { alignSelf: 'flex-start', marginLeft: 2, color: '#fff', opacity: 0.9, marginBottom: 6 },
  
  progressBar: {
    width: W - 32,
    maxWidth: 520,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative', 
    justifyContent: 'center',
  },
  progressFill: { height: '100%', backgroundColor: '#31D354' },
  
  progressTimerText: { 
    position: 'absolute', 
    left: 6, 
    color: '#31D354', 
    fontWeight: '900',
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    lineHeight: PROGRESS_H,
  },
  progressScoreText: { 
    position: 'absolute', 
    right: 6, 
    color: '#fff', 
    fontWeight: '900',
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    lineHeight: PROGRESS_H,
  },

  fly: { position: 'absolute', left: 0, top: 0, zIndex: 1 },

  pointsPop: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
  },
  pointsText: { color: '#fff', fontWeight: '800' },

  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  resultCard: {
    width: Math.min(W - 32, 520),
    borderRadius: 22,
    overflow: 'hidden',
  },
  resultBg: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  resultInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, gap: 10 },
  resultTitle: { color: '#fff', fontWeight: '900', marginBottom: 4 },
  resultDesc: { color: '#fff', opacity: 0.95, lineHeight: 16 },

  resultBtn: {
    alignSelf: 'center',
    marginBottom: 4, 
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  resultBtnText: { color: '#fff', fontWeight: '800' },
});