import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import storage from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

export default function ItemDetailsScreen() {
  const { id, name } = useLocalSearchParams();
  const [repairs, setRepairs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', cost: '', provider: '', description: '' });
  const STORAGE_KEY = `@repairs_${id}`;

  useEffect(() => {
    (async () => {
      try {
        const list = await storage.getRepairs(id);
        setRepairs(list || []);
      } catch (err) {
        setRepairs([]);
      }
    })();
  }, [id]);

  const { colors } = useTheme();

  const saveRepair = async () => {
    if (!form.date || !form.provider) {
      Alert.alert('Validation', 'Please provide date and provider.');
      return;
    }
    const newRepair = { id: Date.now().toString(), date: form.date, cost: parseFloat(form.cost) || 0, provider: form.provider, description: form.description };
    try {
      await storage.saveRepair(id, newRepair);
      const list = await storage.getRepairs(id);
      setRepairs(list || []);
      setForm({ date: '', cost: '', provider: '', description: '' });
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save repair.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.repairCard, { backgroundColor: colors.card }]}> 
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[styles.repairProvider, { color: colors.text }]}>{item.provider}</Text>
        <Text style={[styles.repairCost, { color: colors.danger }]}>{`$${(item.cost || 0).toFixed(2)}`}</Text>
      </View>
      <Text style={[styles.repairDesc, { color: colors.textMuted }]}>{item.description}</Text>
      <Text style={[styles.repairDate, { color: colors.textMuted }]}>{item.date}</Text>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={[styles.headerBox, { backgroundColor: colors.card }]}> 
        <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.location, { color: colors.textMuted }]}>Location: Office &gt; Desk</Text>
        <Text style={[styles.warranty, { color: colors.text }]}>{'Warranty Expires: N/A'}</Text>
      </View>
      <Text style={[styles.sectionHeader, { color: colors.text }]}>Maintenance & Repair Logs</Text>
    </>
  );

  const ListFooter = () => (
    <>
      {showForm ? (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.label, { color: colors.text }]}>Date</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} blurOnSubmit={false} />
          <Text style={[styles.label, { color: colors.text }]}>Provider</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} placeholder="e.g. Apple Store" placeholderTextColor={colors.textMuted} value={form.provider} onChangeText={(t) => setForm({ ...form, provider: t })} blurOnSubmit={false} />
          <Text style={[styles.label, { color: colors.text }]}>Cost ($)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} placeholder="e.g. 120.00" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={form.cost} onChangeText={(t) => setForm({ ...form, cost: t })} blurOnSubmit={false} />
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top', backgroundColor: colors.card, color: colors.text }]} placeholder="What was done" placeholderTextColor={colors.textMuted} multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} blurOnSubmit={false} />
          <TouchableOpacity style={[styles.addRepairBtn, { marginTop: 8, borderColor: colors.primary }]} onPress={saveRepair}>
            <Text style={[styles.addRepairText, { color: colors.primary }]}>Save Repair</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addRepairBtn, { borderWidth: 0, backgroundColor: colors.card, marginTop: 8 }]} onPress={() => setShowForm(false)}>
            <Text style={{ color: colors.textMuted }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addRepairBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addRepairText}>+ Log New Repair</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={repairs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, paddingTop: 8 }}>No repairs logged yet.</Text>}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  label: { color: '#111827', fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F8FAFF', color: '#111827', padding: 14, borderRadius: 8, fontSize: 16 },
  headerBox: { backgroundColor: '#F8FAFF', padding: 16, borderRadius: 12, marginBottom: 20 },
  title: { color: '#111827', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  location: { color: '#6B7280', fontSize: 14, marginBottom: 4 },
  warranty: { color: '#059669', fontSize: 14, fontWeight: '600' },
  sectionHeader: { color: '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  repairCard: { backgroundColor: '#27272A', padding: 12, borderRadius: 8, marginBottom: 8 },
  repairProvider: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  repairCost: { color: '#F43F5E', fontSize: 16, fontWeight: 'bold' },
  repairDesc: { color: '#D4D4D8', fontSize: 14, marginVertical: 4 },
  repairDate: { color: '#71717A', fontSize: 12 },
  addRepairBtn: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#6366F1', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  addRepairText: { color: '#6366F1', fontSize: 15, fontWeight: '600' },
});