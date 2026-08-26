import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import storage from './storage';

export default function AddItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: '',
    location: '',
    purchasePrice: '',
    warrantyUntil: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.name.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name.');
      return;
    }

    setIsSaving(true);

    const newItem = {
      id: Date.now().toString(),
      name: form.name.trim(),
      location: form.location.trim() || 'Unassigned',
      purchasePrice: form.purchasePrice.trim() || '',
      warrantyUntil: form.warrantyUntil.trim() || 'N/A',
      notes: form.notes.trim() || '',
      repairsCount: 0,
    };

    try {
      await storage.saveItem(newItem);
      // Pops modal back to index and triggers focus refresh cleanly
      router.back();
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 24 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Item Name Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="box" size={14} color="#64748B" />
              <Text style={styles.label}>Item Name *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sony Headphones"
              placeholderTextColor="#94A3B8"
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          {/* Location Path Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="map-pin" size={14} color="#64748B" />
              <Text style={styles.label}>Location Path</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bedroom > Closet > Box 2"
              placeholderTextColor="#94A3B8"
              value={form.location}
              onChangeText={(val) => setForm({ ...form, location: val })}
              autoCorrect={false}
            />
          </View>

          {/* Purchase Price Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="dollar-sign" size={14} color="#64748B" />
              <Text style={styles.label}>Purchase Price ($)</Text>
            </View>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="e.g. 299.99"
              placeholderTextColor="#94A3B8"
              value={form.purchasePrice}
              onChangeText={(val) => setForm({ ...form, purchasePrice: val })}
            />
          </View>

          {/* Warranty End Date Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="shield" size={14} color="#64748B" />
              <Text style={styles.label}>Warranty End Date</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              value={form.warrantyUntil}
              onChangeText={(val) => setForm({ ...form, warrantyUntil: val })}
            />
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="file-text" size={14} color="#64748B" />
              <Text style={styles.label}>Notes</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Optional details, receipt notes, or serial numbers..."
              placeholderTextColor="#94A3B8"
              value={form.notes}
              onChangeText={(val) => setForm({ ...form, notes: val })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Save Asset</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  inputGroup: { marginBottom: 16 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: { color: '#0F172A', fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  // Dark Navy Primary Button
  submitBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});