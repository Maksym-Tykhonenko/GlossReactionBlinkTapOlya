import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  TextInput,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

export type HistoryPush = { level: number; points: number; counts: Partial<Counts>; sessionId: number };
type Props = NativeStackScreenProps<RootStackParamList, 'CloseAwards'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 720 || W < 360;
const TOP_OFFSET = 60;

const C = {
  white: '#fff',
  stroke: '#6C0051',
  nameCard: '#6C0051',
  plum: 'rgba(108,0,81,0.82)',
  green: '#31D354',
  darkBar: 'rgba(0,0,0,0.25)',
};

let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const IMAGES = {
  bg: require('../assets/background.png'),
  btnBack: require('../assets/btn_go_home.png'),
  heart: require('../assets/icon_heart_yellow.png'),
  star: require('../assets/icon_star_green.png'),
  drop: require('../assets/icon_drop_purple.png'),
  bear: require('../assets/icon_bear_keychain.png'),
  sweetActive: require('../assets/sweet_spark_active.png'),
  sweetPassive: require('../assets/sweet_spark_passive.png'),
  creamActive: require('../assets/cream_reflex_active.png'),
  creamPassive: require('../assets/cream_reflex_passive.png'),
  cookieActive: require('../assets/cookie_star_active.png'),
  cookiePassive: require('../assets/cookie_star_passive.png'),
  luckyActive: require('../assets/lucky_bear_active.png'),
  luckyPassive: require('../assets/lucky_bear_passive.png'),
  glossActive: require('../assets/gloss_master_active.png'),
  glossPassive: require('../assets/gloss_master_passive.png'),
  shareBtn: require('../assets/share_app.png'),
};

type SweetKey = 'heart' | 'star' | 'drop' | 'bear';
type Counts = { [key in SweetKey]: number };
const zeroCounts: Counts = { heart: 0, star: 0, drop: 0, bear: 0 };

const THRESHOLDS = [
  { min: 180, key: 'gloss',  title: 'Gloss Master Medal (Lv. 75)', desc: 'The final award, the pinnacle of skill.' },
  { min: 120, key: 'lucky',  title: 'Lucky Bear (Lv. 60)',         desc: 'For endurance and concentration.' },
  { min: 90,  key: 'cookie', title: 'Cookie Star (Lv. 45)',        desc: 'A symbol of balance and rhythm of the game.' },
  { min: 60,  key: 'cream',  title: 'Cream Reflex (Lv. 30)',       desc: 'For stable reaction and accuracy.' },
  { min: 0,   key: 'sweet',  title: 'Sweet Spark (Lv. 15)',        desc: 'The first award, a symbol of starting progress.' },
] as const;

type AwardKey = (typeof THRESHOLDS)[number]['key'];
const AWARD_IMG: Record<AwardKey, { active: any; passive: any }> = {
  sweet:  { active: IMAGES.sweetActive,  passive: IMAGES.sweetPassive },
  cream:  { active: IMAGES.creamActive,  passive: IMAGES.creamPassive },
  cookie: { active: IMAGES.cookieActive, passive: IMAGES.cookiePassive },
  lucky:  { active: IMAGES.luckyActive,  passive: IMAGES.luckyPassive },
  gloss:  { active: IMAGES.glossActive,  passive: IMAGES.glossPassive },
};

const KEY_NAME = 'grbt:userName';
const KEY_HISTORY = 'grbt:history';
const KEY_SESSION_ID = 'grbt:session_id';

type HistoryItem = { level: number; points: number; counts?: Partial<Counts>; sessionId: number };

export default function CloseAwardsScreen({ navigation }: Props) {
  const [name, setName] = useState(''); 
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentSessionRounds, setCurrentSessionRounds] = useState<HistoryItem[]>([]);
  const [sel, setSel] = useState(1);
  const [lastSessionId, setLastSessionId] = useState<number | null>(null);

  const load = async () => {
    try {
      if (!AsyncStorage) return;
      
      const [savedName, savedHistory] = await Promise.all([
        AsyncStorage.getItem(KEY_NAME),
        AsyncStorage.getItem(KEY_HISTORY),
      ]);
      
      if (savedName !== null) setName(savedName);
      
      const allHistory: HistoryItem[] = savedHistory ? JSON.parse(savedHistory) : [];
      setHistory(allHistory);
      const maxSessionId = allHistory.reduce((maxId, item) => Math.max(maxId, item.sessionId ?? 0), 0);
      setLastSessionId(maxSessionId);
      const rounds = allHistory
        .filter(h => h.sessionId === maxSessionId)
        .sort((a,b)=>a.level-b.level);
        
      setCurrentSessionRounds(rounds);
      const maxLevel = rounds.at(-1)?.level ?? 1;
      setSel(maxLevel);
      
    } catch {
    }
  };

  useFocusEffect(React.useCallback(() => { 
    const newSessionId = Date.now();
    AsyncStorage?.setItem(KEY_SESSION_ID, newSessionId.toString()).catch(()=>{});
    load();
  }, []));

  const saveName = (v: string) => {
    setName(v);
    if (AsyncStorage) AsyncStorage.setItem(KEY_NAME, v).catch(() => {});
  };
  const selected = useMemo(() => {
    return currentSessionRounds.find(h => h.level === sel) ?? currentSessionRounds.at(-1) ?? undefined;
  }, [currentSessionRounds, sel]);

  const counts: Counts = { ...zeroCounts, ...(selected?.counts as Counts || {}) } as Counts;
  const pts = selected?.points ?? 0;
  
  const LEVELS_TOTAL = currentSessionRounds.length; 

  const tier =
    THRESHOLDS.find((t) => pts >= t.min) ?? THRESHOLDS[THRESHOLDS.length - 1];
  const tierImg = pts >= tier.min ? AWARD_IMG[tier.key].active : AWARD_IMG[tier.key].passive;

  const isDone = (lvl: number) => !!currentSessionRounds.find((h) => h.level === lvl);

  const onShare = async () => {
    try {
      await Share.share({
        title: 'My award',
        message: `Round ${sel} result: I scored ${pts} pts and unlocked: ${tier.title}!`,
        url: Platform.OS === 'ios' ? 'https://example.com' : undefined,
      });
    } catch {}
  };

  return (
    <ImageBackground source={IMAGES.bg} style={s.bg} resizeMode="cover">
      <View style={{ paddingTop: TOP_OFFSET }}>
        <View style={s.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={s.backBtn}>
            <Image
              source={IMAGES.btnBack}
              style={{ width: IS_SMALL ? 108 : 120, height: IS_SMALL ? 40 : 46 }}
              resizeMode="stretch"
            />
          </Pressable>
          <Text numberOfLines={1} allowFontScaling={false} style={s.title}>
            PROFILE
          </Text>
        </View>
        <View style={s.nameCard}>
          <Text style={s.nameLabel}>Your name:</Text>
          <View style={s.nameInputWrap}>
            <TextInput
              value={name}
              onChangeText={saveName}
              placeholder="Enter your name"
              placeholderTextColor="#d6cde0"
              style={s.nameInput}
            />
            <Text style={s.editIcon}>✎</Text>
          </View>
        </View>
        <View style={s.levelCard}>
          <Text style={s.levelTitle}>Rounds in Last Session: {LEVELS_TOTAL}</Text>
          <View style={s.levelBar}>
          </View>
          <View style={s.levelChips}>
            {Array.from({ length: LEVELS_TOTAL }, (_, i) => i + 1).map((lvl) => {
              const done = isDone(lvl);
              const selectedLvl = sel === lvl;
              return (
                <Pressable
                  key={lvl}
                  onPress={() => setSel(lvl)}
                  style={[
                    s.chip,
                    done && { backgroundColor: C.green },
                    selectedLvl && { borderColor: C.white, borderWidth: 2 },
                  ]}
                  hitSlop={8}
                  disabled={!done} 
                >
                  <Text style={[s.chipText, { color: done ? '#0b3d16' : C.white }]}>{lvl}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={s.caughtCard}>
          <Text style={s.cardTitle}>Caught:</Text>
          <View style={s.caughtRow}>
            <View style={s.caughtCol}>
              <Image source={IMAGES.heart} style={s.caughtIcon} resizeMode="contain" />
              <Text style={s.caughtNum}>{counts.heart}</Text>
            </View>
            <View style={s.caughtCol}>
              <Image source={IMAGES.star} style={s.caughtIcon} resizeMode="contain" />
              <Text style={s.caughtNum}>{counts.star}</Text>
            </View>
            <View style={s.caughtCol}>
              <Image source={IMAGES.drop} style={s.caughtIcon} resizeMode="contain" />
              <Text style={s.caughtNum}>{counts.drop}</Text>
            </View>
            <View style={s.caughtCol}>
              <Image source={IMAGES.bear} style={s.caughtIcon} resizeMode="contain" />
              <Text style={s.caughtNum}>{counts.bear}</Text>
            </View>
          </View>
        </View>

        <View style={s.awardsCard}>
          <Text style={s.cardTitle}>Awards:</Text>
          <View style={s.awardLine}>
            <Image source={tierImg} style={s.awardIcon} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={s.awardTitle}>{tier.title}</Text>
              <Text style={s.awardDesc}>— {tier.desc}</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>{pts > 0 ? `${pts} pts` : `${tier.min}+ pts`}</Text>
            </View>
          </View>
          <Pressable onPress={onShare} hitSlop={12} style={s.shareBtn}>
            <Image source={IMAGES.shareBtn} style={s.shareImg} resizeMode="stretch" />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const P = 16;
const CARD_W = Math.min(W - P * 2, 380);
const ICON = IS_SMALL ? 40 : 46;

const s = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },

  headerRow: {
    paddingHorizontal: P,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: { paddingRight: 6 },
  title: {
    flex: 1,
    textAlign: 'left',
    color: C.white,
    fontWeight: '900',
    fontSize: 32,
    textShadowColor: C.stroke,
    textShadowRadius: 3,
    textShadowOffset: { width: 1.5, height: 1.5 },
  },

  nameCard: {
    width: CARD_W,
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: C.nameCard,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  nameLabel: { color: C.white, fontWeight: '900', fontSize: IS_SMALL ? 14 : 16, marginBottom: 8 },
  nameInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingHorizontal: 12,
    height: IS_SMALL ? 40 : 46,
  },
  nameInput: { flex: 1, color: C.white, fontWeight: '800' },
  editIcon: { color: C.white, opacity: 0.95, marginLeft: 8 },

  levelCard: { width: CARD_W, alignSelf: 'center', marginTop: 14 },
  levelTitle: { color: C.white, opacity: 0.95, marginBottom: 8, fontSize: IS_SMALL ? 13 : 14, fontWeight: '700' },
  levelBar: { height: IS_SMALL ? 14 : 16, backgroundColor: C.darkBar, borderRadius: 999, overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: C.green, borderRadius: 999 },
  levelChips: { marginTop: 8, flexDirection: 'row', gap: 8 },
  chip: {
    width: IS_SMALL ? 30 : 34,
    height: IS_SMALL ? 26 : 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipText: { fontWeight: '900', color: C.white },

  caughtCard: {
    width: CARD_W,
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: C.plum,
    borderRadius: 24,
    padding: 14,
  },
  cardTitle: { color: C.white, fontWeight: '900', marginBottom: 8 },
  caughtRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6 },
  caughtCol: { alignItems: 'center', minWidth: 60 },
  caughtIcon: { width: ICON, height: ICON, marginBottom: 6 },
  caughtNum: { color: C.white, fontWeight: '900' },

  awardsCard: {
    width: CARD_W,
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: C.plum,
    borderRadius: 24,
    padding: 14,
    marginBottom: 24,
  },
  awardLine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: 12,
  },
  awardIcon: { width: IS_SMALL ? 54 : 60, height: IS_SMALL ? 54 : 60, marginRight: 12 },
  awardTitle: { color: '#000', fontWeight: '900', fontSize: IS_SMALL ? 15 : 17 },
  awardDesc: { color: '#333', opacity: 0.95, fontSize: IS_SMALL ? 11 : 12, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.8)', marginLeft: 10 },
  badgeText: { color: '#222', fontWeight: '900' },

  shareBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 16,
    overflow: Platform.select({ android: 'hidden', ios: 'visible' }),
  },
  shareImg: { width: 120, height: 48 },
});