import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';

const MOCK_ITEMS = [
  { id: '1', name: 'MacBook Pro 16"', location: 'Office > Desk', warrantyUntil: '2027-11-15', repairsCount: 1 },
  { id: '2', name: 'Bosch Power Drill', location: 'Garage > Cabinet B', warrantyUntil: '2026-05-10', repairsCount: 0 },
  { id: '3', name: 'House Spare Keys', location: 'Hallway > Key Bowl', warrantyUntil: 'N/A', repairsCount: 0 },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [items] = useState(MOCK_ITEMS);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/item-details', params: { id: item.id, name: item.name } })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.locationTag}>{item.location}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.subText}>Warranty: {item.warrantyUntil}</Text>
              <Text style={styles.subText}>Repairs: {item.repairsCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Link href="/add-item" asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: '#1E1E22', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  locationTag: { color: '#6366F1', backgroundColor: '#1E1B4B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  subText: { color: '#A1A1AA', fontSize: 13 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#6366F1', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
});