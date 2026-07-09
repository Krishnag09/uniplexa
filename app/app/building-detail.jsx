import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Theme';
import axios from 'axios';
import { authHeaders, getApiBaseUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

const { width } = Dimensions.get('window');

export default function BuildingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id ? String(params.id) : '';
  const canShow = useRequireAdmin(router);
  const { accessToken } = useAuth();
  const [fontsLoaded] = useFonts({
    RedHatText_400Regular,
    RedHatText_700Bold,
  });
  const [building, setBuilding] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const base = getApiBaseUrl();
      const { data } = await axios.get(`${base}/buildings/${id}`);
      setBuilding(data);
    } catch (e) {
      setBuilding(null);
      setError(e.response?.data?.detail || e.message || 'Failed to load building');
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (canShow && id) load();
    }, [canShow, id, load])
  );

  const confirmDelete = () => {
    Alert.alert('Delete building', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            const base = getApiBaseUrl();
            await axios.delete(`${base}/buildings/${id}`, {
              headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
            });
            router.replace('/buildings');
          } catch (e) {
            Alert.alert(
              'Delete failed',
              e.response?.data?.detail ? String(e.response.data.detail) : String(e.message)
            );
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (!fontsLoaded || !canShow) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Missing building id.</Text>
        <Button title="Back" onPress={() => router.back()} variant="primary" />
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
      <ScrollView contentContainerStyle={styles.scroll}>
        {!building && !error ? <ActivityIndicator color={Colors.primary} /> : null}
        {error ? <Text style={styles.error}>{String(error)}</Text> : null}
        {building ? (
          <>
            <Text style={styles.title}>{building.building_name || `Building #${building.building_id}`}</Text>
            <Text style={styles.line}>{building.building_address}</Text>
            <Text style={styles.line}>
              {[building.building_city, building.building_state, building.building_zip]
                .filter(Boolean)
                .join(', ')}
            </Text>
            <Text style={styles.line}>{building.building_country}</Text>
            <Button
              title="Edit building"
              onPress={() =>
                router.push({
                  pathname: '/building-edit',
                  params: { id: String(building.building_id) },
                })
              }
              variant="primary"
              fullWidth
              style={styles.btn}
            />
            <Button
              title="Invite resident"
              onPress={() =>
                router.push({
                  pathname: '/add-user',
                  params: {
                    buildingId: String(building.building_id),
                    buildingName: building.building_name || '',
                  },
                })
              }
              variant="primary"
              fullWidth
              style={styles.btn}
            />
            <Button
              title={deleting ? 'Deleting…' : 'Delete building'}
              onPress={confirmDelete}
              variant="primary"
              fullWidth
              style={styles.btn}
              loading={deleting}
              disabled={deleting}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgb(28, 32, 31)' },
  headerRow: { paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { color: '#fff', fontSize: 16, fontFamily: 'RedHatText_400Regular' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, width },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'RedHatText_700Bold',
    marginBottom: 16,
    marginTop: 8,
  },
  line: { color: Colors.textSecondary, fontSize: 15, fontFamily: 'RedHatText_400Regular', marginBottom: 8 },
  error: { color: '#f44', marginBottom: 12, fontFamily: 'RedHatText_400Regular' },
  btn: { marginTop: 12 },
});
