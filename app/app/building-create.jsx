import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Theme';
import axios from 'axios';
import { authHeaders, getApiBaseUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

const { width } = Dimensions.get('window');

const emptyForm = {
  place_id: '',
  building_name: '',
  building_address: '',
  building_city: '',
  building_state: '',
  building_zip: '',
  building_country: 'USA',
  building_latitude: '',
  building_longitude: '',
};

export default function BuildingCreateScreen() {
  const router = useRouter();
  const canShow = useRequireAdmin(router);
  const { accessToken } = useAuth();
  const [fontsLoaded] = useFonts({
    RedHatText_400Regular,
    RedHatText_700Bold,
  });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const submit = async () => {
    setError(null);
    const placeId = form.place_id.trim();
    let body;
    if (placeId) {
      body = { place_id: placeId };
    } else {
      const lat = parseFloat(form.building_latitude);
      const lng = parseFloat(form.building_longitude);
      if (
        !form.building_name.trim() ||
        !form.building_address.trim() ||
        !form.building_city.trim() ||
        !form.building_state.trim() ||
        !form.building_zip.trim() ||
        Number.isNaN(lat) ||
        Number.isNaN(lng)
      ) {
        setError('Fill all fields (or enter a Google Place ID only). Lat/lng must be numbers.');
        return;
      }
      body = {
        building_name: form.building_name.trim(),
        building_address: form.building_address.trim(),
        building_city: form.building_city.trim(),
        building_state: form.building_state.trim(),
        building_zip: form.building_zip.trim(),
        building_country: form.building_country.trim() || 'USA',
        building_latitude: lat,
        building_longitude: lng,
      };
    }

    setLoading(true);
    try {
      const base = getApiBaseUrl();
      await axios.post(`${base}/buildings`, body, {
        headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
      });
      router.replace('/buildings');
    } catch (e) {
      setError(e.response?.data?.detail ? String(e.response.data.detail) : e.message || 'Create failed');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Add building</Text>
        <Text style={styles.hint}>
          Either enter a Google Place ID (backend fetches details), or fill all address fields including
          latitude and longitude.
        </Text>
        <Input
          placeholder="Google Place ID (optional)"
          value={form.place_id}
          onChangeText={(t) => setField('place_id', t)}
          style={styles.input}
        />
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
          placeholder="Country (default USA)"
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Create" onPress={submit} variant="primary" fullWidth loading={loading} style={styles.btn} />
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
    marginBottom: 8,
    marginTop: 8,
  },
  hint: { color: Colors.textSecondary, fontSize: 13, fontFamily: 'RedHatText_400Regular', marginBottom: 16 },
  input: { marginBottom: 12, width: width - 40, maxWidth: 335, alignSelf: 'center' },
  error: { color: '#f44', marginBottom: 12, fontFamily: 'RedHatText_400Regular' },
  btn: { marginTop: 8 },
});
