import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import storage from './storage';

export default function AddItemScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', location: '', purchasePrice: '', warrantyUntil: '', notes: '' });

  const handleSave = async () => {
    if (!form.name || !form.name.trim()) {
      Alert.alert('Validation', 'Please provide an item name.');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: form.name.trim(),
      location: form.location || 'Unknown',
      purchasePrice: form.purchasePrice || '',
      warrantyUntil: form.warrantyUntil || 'N/A',
      notes: form.notes || '',
      repairsCount: 0,
    };

    try {
      await storage.saveItem(newItem);
      router.push({ pathname: '/', params: { refresh: Date.now() } });
    } catch (err) {
      Alert.alert('Error', 'Failed to save item.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121214' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container}>
      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Sony Headphones"
        placeholderTextColor="#71717A"
        value={form.name}
        onChangeText={(val) => setForm({ ...form, name: val })}
      />

      <Text style={styles.label}>Location Path</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Bedroom > Closet > Box 2"
        placeholderTextColor="#71717A"
        value={form.location}
        onChangeText={(val) => setForm({ ...form, location: val })}
      />

      <Text style={styles.label}>Purchase Price ($)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g. 299.99"
        placeholderTextColor="#71717A"
        value={form.purchasePrice}
        onChangeText={(val) => setForm({ ...form, purchasePrice: val })}
      />

      <Text style={styles.label}>Warranty End Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#71717A"
        value={form.warrantyUntil}
        onChangeText={(val) => setForm({ ...form, warrantyUntil: val })}
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
        placeholder="Optional notes about the item"
        placeholderTextColor="#71717A"
        value={form.notes}
        onChangeText={(val) => setForm({ ...form, notes: val })}
        multiline
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
        <Text style={styles.submitBtnText}>Save Asset</Text>
      </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { color: '#E4E4E7', fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1E1E22', color: '#FFF', padding: 14, borderRadius: 8, fontSize: 16 },
  submitBtn: { backgroundColor: '#6366F1', padding: 16, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});