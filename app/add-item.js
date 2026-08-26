import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddItemScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', location: '', purchasePrice: '', warrantyUntil: '', notes: '' });

  const handleSave = () => {
    // Database insert action goes here
    router.back();
  };

  return (
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

      <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
        <Text style={styles.submitBtnText}>Save Asset</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { color: '#E4E4E7', fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1E1E22', color: '#FFF', padding: 14, borderRadius: 8, fontSize: 16 },
  submitBtn: { backgroundColor: '#6366F1', padding: 16, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});