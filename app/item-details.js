import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import storage from './storage';

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
    <View style={styles.repairCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.repairProvider}>{item.provider}</Text>
        <Text style={styles.repairCost}>${(item.cost || 0).toFixed(2)}</Text>
      </View>
      <Text style={styles.repairDesc}>{item.description}</Text>
      <Text style={styles.repairDate}>{item.date}</Text>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.headerBox}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.location}>Location: Office &gt; Desk</Text>
        <Text style={styles.warranty}>Warranty Expires: Nov 15, 2027</Text>
      </View>
      <Text style={styles.sectionHeader}>Maintenance & Repair Logs</Text>
    </>
  );

  const ListFooter = () => (
    <>
      {showForm ? (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#71717A" value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} blurOnSubmit={false} />
          <Text style={styles.label}>Provider</Text>
          <TextInput style={styles.input} placeholder="e.g. Apple Store" placeholderTextColor="#71717A" value={form.provider} onChangeText={(t) => setForm({ ...form, provider: t })} blurOnSubmit={false} />
          <Text style={styles.label}>Cost ($)</Text>
          <TextInput style={styles.input} placeholder="e.g. 120.00" placeholderTextColor="#71717A" keyboardType="numeric" value={form.cost} onChangeText={(t) => setForm({ ...form, cost: t })} blurOnSubmit={false} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} placeholder="What was done" placeholderTextColor="#71717A" multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} blurOnSubmit={false} />
          <TouchableOpacity style={[styles.addRepairBtn, { marginTop: 8 }]} onPress={saveRepair}>
            <Text style={styles.addRepairText}>Save Repair</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addRepairBtn, { borderWidth: 0, backgroundColor: '#27272A', marginTop: 8 }]} onPress={() => setShowForm(false)}>
            <Text style={{ color: '#A1A1AA' }}>Cancel</Text>
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={repairs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={<Text style={{ color: '#6B7280', paddingTop: 8 }}>No repairs logged yet.</Text>}
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