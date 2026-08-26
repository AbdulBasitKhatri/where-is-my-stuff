import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import storage from './storage';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch items from SQLite
  const fetchItems = useCallback(async () => {
    try {
      const list = await storage.getItems();
      setItems(list);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  // Analytics Metrics
  const stats = useMemo(() => {
    const totalCount = items.length;
    const totalRepairs = items.reduce(
      (acc, curr) => acc + (Number(curr.repairsCount) || 0),
      0
    );
    const hasWarranty = items.filter(
      (i) => i.warrantyUntil && i.warrantyUntil !== 'N/A'
    ).length;

    return { totalCount, totalRepairs, hasWarranty };
  }, [items]);

  const filters = ['All', 'Has Warranty', 'Needs Repair'];

  // Filtered List Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location &&
          item.location.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'Has Warranty') {
        return item.warrantyUntil && item.warrantyUntil !== 'N/A';
      }
      if (selectedFilter === 'Needs Repair') {
        return (item.repairsCount || 0) > 0;
      }

      return true;
    });
  }, [items, searchQuery, selectedFilter]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingText}>Vault Overview</Text>
          <Text style={styles.title}>My Stuff</Text>
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0F172A"
            />
          }
          ListHeaderComponent={
            <View>
              {/* Monochromatic Analytics Cards */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalCount}</Text>
                  <Text style={styles.statLabel}>Total Assets</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.hasWarranty}</Text>
                  <Text style={styles.statLabel}>In Warranty</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalRepairs}</Text>
                  <Text style={styles.statLabel}>Repairs</Text>
                </View>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <Feather name="search" size={18} color="#64748B" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchBar}
                  placeholder="Search by name or location..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
              </View>

              {/* Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScrollView}
                contentContainerStyle={styles.filterContainer}
              >
                {filters.map((filter) => {
                  const isActive = selectedFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setSelectedFilter(filter)}
                      style={[styles.chip, isActive && styles.chipActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Items ({filteredItems.length})
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="box" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedFilter !== 'All'
                  ? 'Try adjusting your search query or filters.'
                  : 'Tap the + button to add your first item.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/item-details',
                  params: { id: item.id, name: item.name },
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.locationBadge}>
                  <Ionicons name="location-outline" size={12} color="#475569" style={styles.locationIcon} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.location || 'Unassigned'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <Feather name="shield" size={13} color="#64748B" />
                  <Text style={styles.subText}>
                    Warranty: <Text style={styles.subTextBold}>{item.warrantyUntil || 'N/A'}</Text>
                  </Text>
                </View>

                <View style={styles.footerInfo}>
                  <Feather name="tool" size={13} color="#64748B" />
                  <Text style={styles.subText}>
                    Repairs: <Text style={styles.subTextBold}>{item.repairsCount ?? 0}</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Single Plus FAB Button */}
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.fab,
          { bottom: 24 + insets.bottom },
        ])}
        activeOpacity={0.85}
        onPress={() => router.push('/add-item')}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#FFFFFF' },

  // Header
  topHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  greetingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A' },

  // Stats Bar (Monochromatic Dark Navy Accent)
  statsRow: {
    flexDirection: 'row',
    justify: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 },

  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchBar: {
    flex: 1,
    color: '#0F172A',
    paddingVertical: 10,
    fontSize: 14,
  },

  // Filter Chips
  filterScrollView: { marginBottom: 16 },
  filterContainer: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },

  // Section Header
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  // Item Cards
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: { flex: 1, color: '#0F172A', fontSize: 16, fontWeight: '700' },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationIcon: { marginRight: 3 },
  locationText: { color: '#475569', fontSize: 12, fontWeight: '500' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  subText: { color: '#64748B', fontSize: 13 },
  subTextBold: { color: '#0F172A', fontWeight: '600' },

  // Empty State
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  emptySubtext: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },

  // Single Plus FAB (Dark Navy Blue)
  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#0F172A',
    width: 56,
    height: 56,
    borderRadius: 28,
    justify: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});