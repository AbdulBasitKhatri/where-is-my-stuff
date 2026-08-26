import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const MOCK_REPAIRS = [
  { id: 'r1', date: '2025-08-12', cost: 120.0, provider: 'Apple Store', description: 'Battery replacement' },
];

export default function ItemDetailsScreen() {
  const { name } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.location}>Location: Office > Desk</Text>
        <Text style={styles.warranty}>Warranty Expires: Nov 15, 2027</Text>
      </View>

      <Text style={styles.sectionHeader}>Maintenance & Repair Logs</Text>

      <FlatList
        data={MOCK_REPAIRS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.repairCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.repairProvider}>{item.provider}</Text>
              <Text style={styles.repairCost}>${item.cost.toFixed(2)}</Text>
            </View>
            <Text style={styles.repairDesc}>{item.description}</Text>
            <Text style={styles.repairDate}>{item.date}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addRepairBtn}>
        <Text style={styles.addRepairText}>+ Log New Repair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerBox: { backgroundColor: '#1E1E22', padding: 16, borderRadius: 12, marginBottom: 20 },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  location: { color: '#A1A1AA', fontSize: 14, marginBottom: 4 },
  warranty: { color: '#22C55E', fontSize: 14, fontWeight: '600' },
  sectionHeader: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  repairCard: { backgroundColor: '#27272A', padding: 12, borderRadius: 8, marginBottom: 8 },
  repairProvider: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  repairCost: { color: '#F43F5E', fontSize: 16, fontWeight: 'bold' },
  repairDesc: { color: '#D4D4D8', fontSize: 14, marginVertical: 4 },
  repairDate: { color: '#71717A', fontSize: 12 },
  addRepairBtn: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#6366F1', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  addRepairText: { color: '#6366F1', fontSize: 15, fontWeight: '600' },
});