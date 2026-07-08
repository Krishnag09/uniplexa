import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Theme';
import axios from 'axios';
import { getApiBaseUrl } from '@/lib/api';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

const { width, height } = Dimensions.get('window');

export default function BuildingsScreen() {
  const router = useRouter();
  const canShow = useRequireAdmin(router);
  const [fontsLoaded] = useFonts({
    RedHatText_400Regular,
    RedHatText_700Bold,
  });
  const [buildings, setBuildings] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const base = getApiBaseUrl();
      const { data } = await axios.get(`${base}/buildings`);
      setBuildings(Array.isArray(data) ? data : []);
    } catch (e) {
      setBuildings([]);
      setError(e.response?.data?.detail || e.message || 'Failed to load buildings');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (canShow) load();
    }, [canShow, load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!fontsLoaded || !canShow) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Manage buildings</Text>
        <Button
          title="Add building"
          onPress={() => router.push('/building-create')}
          variant="primary"
          fullWidth
          style={styles.addBtn}
        />
        {error ? <Text style={styles.error}>{String(error)}</Text> : null}
        {buildings.length === 0 && !error ? (
          <Text style={styles.empty}>No buildings yet. Create one to get started.</Text>
        ) : null}
        {buildings.map((b) => (
          <TouchableOpacity
            key={b.building_id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/building-detail',
                params: {
                  id: String(b.building_id),
                  name: b.building_name || '',
                },
              })
            }
          >
            <Text style={styles.cardTitle}>{b.building_name || `Building #${b.building_id}`}</Text>
            <Text style={styles.cardSub}>
              {[b.building_city, b.building_state].filter(Boolean).join(', ') || b.building_address}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgb(28, 32, 31)' },
  headerRow: { paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { color: '#fff', fontSize: 16, fontFamily: 'RedHatText_400Regular' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, width, minHeight: height * 0.5 },
  title: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'RedHatText_700Bold',
    marginBottom: 16,
    marginTop: 8,
  },
  addBtn: { marginBottom: 20 },
  error: { color: '#f44', marginBottom: 12, fontFamily: 'RedHatText_400Regular' },
  empty: { color: Colors.textSecondary, fontFamily: 'RedHatText_400Regular', marginTop: 8 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: '#fff', fontSize: 18, fontFamily: 'RedHatText_700Bold', marginBottom: 4 },
  cardSub: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'RedHatText_400Regular' },
});
