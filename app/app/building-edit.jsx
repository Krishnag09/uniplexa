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
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Theme';
import axios from 'axios';
import { authHeaders, getApiBaseUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

const { width } = Dimensions.get('window');

export default function BuildingEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id ? String(params.id) : '';
  const canShow = useRequireAdmin(router);
  const { accessToken } = useAuth();
  const [fontsLoaded] = useFonts({
    RedHatText_400Regular,
    RedHatText_700Bold,
  });
  const [form, setForm] = useState({
    building_name: '',
    building_address: '',
    building_city: '',
    building_state: '',
    building_zip: '',
    building_country: '',
    building_latitude: '',
    building_longitude: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const load = useCallback(async () => {
    if (!id) return;
    setInitialLoading(true);
    setError(null);
    try {
      const base = getApiBaseUrl();
      const { data } = await axios.get(`${base}/buildings/${id}`);
      setForm({
        building_name: data.building_name || '',
        building_address: data.building_address || '',
        building_city: data.building_city || '',
        building_state: data.building_state || '',
        building_zip: data.building_zip || '',
        building_country: data.building_country || '',
        building_latitude: data.building_latitude != null ? String(data.building_latitude) : '',
        building_longitude: data.building_longitude != null ? String(data.building_longitude) : '',
      });
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Failed to load');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (canShow && id) load();
    }, [canShow, id, load])
  );

  const submit = async () => {
    setError(null);
    const lat = parseFloat(form.building_latitude);
    const lng = parseFloat(form.building_longitude);
    const body = {};
    if (form.building_name.trim()) body.building_name = form.building_name.trim();
    if (form.building_address.trim()) body.building_address = form.building_address.trim();
    if (form.building_city.trim()) body.building_city = form.building_city.trim();
    if (form.building_state.trim()) body.building_state = form.building_state.trim();
    if (form.building_zip.trim()) body.building_zip = form.building_zip.trim();
    if (form.building_country.trim()) body.building_country = form.building_country.trim();
    if (!Number.isNaN(lat)) body.building_latitude = lat;
    if (!Number.isNaN(lng)) body.building_longitude = lng;

    if (Object.keys(body).length === 0) {
      setError('Change at least one field.');
      return;
    }

    setLoading(true);
    try {
      const base = getApiBaseUrl();
      await axios.patch(`${base}/buildings/${id}`, body, {
        headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
      });
      router.replace({
        pathname: '/building-detail',
        params: { id },
      });
    } catch (e) {
      setError(e.response?.data?.detail ? String(e.response.data.detail) : e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.title}>Edit building</Text>
        {initialLoading ? <ActivityIndicator color={Colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!initialLoading ? (
          <>
            <Input
              placeholder="Building name"
              value={form.building_name}
              onChangeText={(t) => setField('building_name', t)}
              style={styles.input}
            />
            <Input
              placeholder="Street address"
              value={form.building_address}
              onChangeText={(t) => setField('building_address', t)}
              style={styles.input}
            />
            <Input
              placeholder="City"
              value={form.building_city}
              onChangeText={(t) => setField('building_city', t)}
              style={styles.input}
            />
            <Input
              placeholder="State"
              value={form.building_state}
              onChangeText={(t) => setField('building_state', t)}
              style={styles.input}
            />
            <Input
              placeholder="ZIP"
              value={form.building_zip}
              onChangeText={(t) => setField('building_zip', t)}
              style={styles.input}
            />
            <Input
              placeholder="Country"
              value={form.building_country}
              onChangeText={(t) => setField('building_country', t)}
              style={styles.input}
            />
            <Input
              placeholder="Latitude"
              value={form.building_latitude}
              onChangeText={(t) => setField('building_latitude', t)}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Input
              placeholder="Longitude"
              value={form.building_longitude}
              onChangeText={(t) => setField('building_longitude', t)}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Button title="Save changes" onPress={submit} variant="primary" fullWidth loading={loading} style={styles.btn} />
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
  input: { marginBottom: 12, width: width - 40, maxWidth: 335, alignSelf: 'center' },
  error: { color: '#f44', marginBottom: 12, fontFamily: 'RedHatText_400Regular' },
  btn: { marginTop: 8 },
});
