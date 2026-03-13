import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Ionicons } from '@expo/vector-icons';

// Lazy-load expo-av so the route loads even when native module isn't available (e.g. Expo Go / web).
const getAudio = () => {
  try {
    return require('expo-av').Audio;
  } catch {
    return null;
  }
};

const SCREEN_COLORS = {
  background: '#1A1A1A',
  bubbleUser: '#2D2D2D',
  bubbleAssistant: '#2D2D2D',
  bubblePrompt: 'rgba(1, 198, 157, 0.9)',
  text: '#FFFFFF',
  navIconBg: '#2D2D2D',
  micButton: '#FF9800',
  waveform: '#00C853',
  waveformLine: 'rgba(255,255,255,0.2)',
};

const WAVEFORM_BARS = 24;
const METER_POLL_MS = 80;

const formatTime = (ms) => {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  return `${min}:${String(sec % 60).padStart(2, '0')}`;
};

const VoiceRecordScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ RedHatText_400Regular, RedHatText_700Bold });
  const [recording, setRecording] = useState(null);
  const [durationMs, setDurationMs] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState(Array(WAVEFORM_BARS).fill(0.2));
  const [phase, setPhase] = useState('idle'); // 'idle' | 'recording' | 'processing' | 'done'
  const [recordUri, setRecordUri] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const waveformRef = useRef([]);

  const requestPermissions = async () => {
    const Audio = getAudio();
    if (!Audio) {
      setError('Voice recording requires a development build. Run: npx expo run:ios or npx expo run:android');
      return false;
    }
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone', 'Permission is required to record voice.');
        return false;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      return true;
    } catch (e) {
      const msg = e?.message || String(e);
      if (msg.includes('native module') || msg.includes('ExponentAV')) {
        setError('Voice recording requires a development build. Run: npx expo run:ios or npx expo run:android');
      } else {
        setError(msg);
      }
      return false;
    }
  };

  const startRecording = async () => {
    setError(null);
    if (!(await requestPermissions())) return;
    const Audio = getAudio();
    if (!Audio) return;
    try {
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setPhase('recording');
      setDurationMs(0);
      waveformRef.current = [];
      setWaveformLevels(Array(WAVEFORM_BARS).fill(0.2));
    } catch (e) {
      const msg = e?.message || String(e);
      if (msg.includes('native module') || msg.includes('ExponentAV')) {
        setError('Voice recording requires a development build. Run: npx expo run:ios or npx expo run:android');
      } else {
        setError(msg || 'Failed to start recording');
      }
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordUri(uri);
      setPhase('processing');
      // Optional: send upstream here (e.g. POST multipart or WebSocket chunks)
      setPhase('done');
    } catch (e) {
      setError(e.message || 'Failed to stop recording');
      setRecording(null);
      setPhase('idle');
    }
  };

  useEffect(() => {
    if (phase !== 'recording' || !recording) return;
    let cancelled = false;
    const poll = async () => {
      while (!cancelled && recording) {
        try {
          const status = await recording.getStatusAsync();
          if (!status.isRecording) break;
          setDurationMs(status.durationMillis ?? 0);
          const meter = status.metering;
          if (typeof meter === 'number' && meter > -160) {
            const normalized = Math.min(1, Math.max(0, (meter + 60) / 60));
            waveformRef.current = [...waveformRef.current.slice(-(WAVEFORM_BARS - 1)), normalized];
            const pad = Array(Math.max(0, WAVEFORM_BARS - waveformRef.current.length)).fill(0.2);
            setWaveformLevels([...pad, ...waveformRef.current.map((v) => 0.2 + 0.8 * v)]);
          }
        } catch (_) {}
        await new Promise((r) => setTimeout(r, METER_POLL_MS));
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [phase, recording]);

  const cancelRecording = () => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => {});
      setRecording(null);
    }
    setPhase('idle');
    setDurationMs(0);
    setRecordUri(null);
    setWaveformLevels(Array(WAVEFORM_BARS).fill(0.2));
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chat bubbles */}
        <View style={styles.bubbleRow}>
          <View style={[styles.bubble, styles.bubbleLeft, styles.bubbleUser]}>
            <Text style={styles.bubbleText}>What would you like to do today?</Text>
          </View>
        </View>
        <View style={styles.bubbleRow}>
          <View style={[styles.bubble, styles.bubbleRight, styles.bubbleAssistant]}>
            <Text style={styles.bubbleText}>Raise a service request</Text>
          </View>
        </View>
        <View style={styles.bubbleRow}>
          <View style={[styles.bubble, styles.bubbleLeft, styles.bubblePrompt]}>
            <Text style={styles.bubbleText}>
              Please, talk into the voice or write to describe your issue you are facing.
            </Text>
          </View>
        </View>

        {phase === 'processing' && (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={SCREEN_COLORS.micButton} />
            <Text style={styles.statusText}>Processing...</Text>
          </View>
        )}
        {phase === 'done' && recordUri && (
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color={SCREEN_COLORS.waveform} />
            <Text style={styles.statusText}>Recording saved</Text>
          </View>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      {/* Voice recorder bar */}
      <View style={styles.recorderBar}>
        <TouchableOpacity
          style={styles.recorderBtn}
          onPress={phase === 'recording' ? cancelRecording : () => router.back()}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.keyboardBtn}>
          <Ionicons name="keypad-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.waveformArea}>
          {phase === 'recording' && (
            <Text style={styles.timer}>{formatTime(durationMs)}</Text>
          )}
          <View style={styles.waveform}>
            {waveformLevels.map((level, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: phase === 'recording' ? 4 + level * 16 : 4,
                    backgroundColor: phase === 'recording' ? SCREEN_COLORS.waveform : SCREEN_COLORS.waveformLine,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.micBtn, phase === 'recording' && styles.micBtnActive]}
          onPress={
            phase === 'recording'
              ? stopRecording
              : phase === 'done'
                ? () => { setPhase('idle'); setRecordUri(null); startRecording(); }
                : startRecording
          }
        >
          <Ionicons name="mic" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {__DEV__ && (
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCREEN_COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 140 },
  bubbleRow: { marginBottom: 12 },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end' },
  bubbleUser: { backgroundColor: SCREEN_COLORS.bubbleUser },
  bubbleAssistant: { backgroundColor: SCREEN_COLORS.bubbleAssistant },
  bubblePrompt: { backgroundColor: SCREEN_COLORS.bubblePrompt },
  bubbleText: { color: SCREEN_COLORS.text, fontSize: 15, fontFamily: 'RedHatText_400Regular' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  statusText: { color: SCREEN_COLORS.text, fontSize: 14 },
  errorText: { color: '#ff6b6b', marginTop: 8, fontSize: 14 },
  recorderBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    backgroundColor: SCREEN_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  recorderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SCREEN_COLORS.navIconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  keyboardBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SCREEN_COLORS.navIconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveformArea: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  timer: { color: SCREEN_COLORS.text, fontSize: 14, marginRight: 10, minWidth: 36 },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    gap: 3,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  micBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SCREEN_COLORS.micButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: {
    borderWidth: 2,
    borderColor: 'rgba(255,152,0,0.6)',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  backBtnText: { color: '#FFF', fontSize: 14 },
});

export default VoiceRecordScreen;
