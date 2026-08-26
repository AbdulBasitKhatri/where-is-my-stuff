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

// 1. Import your Theme Context & storage utility
import { useTheme } from '../context/ThemeContext'; // Adjust path if using _context/ThemeContext
import storage from '../utils/storage';

function getWarrantyStatus(warrantyDateStr) {
  if (!warrantyDateStr || typeof warrantyDateStr !== 'string') return { valid: false, text: null };
  
  const cleaned = warrantyDateStr.trim().toLowerCase();
  if (['n/a', 'none', 'null', '', 'undefined'].includes(cleaned)) {
    return { valid: false, text: null };
  }

  const warrantyDate = new Date(warrantyDateStr);
  if (isNaN(warrantyDate.getTime())) {
    return { valid: true, isExpired: false, text: warrantyDateStr };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (warrantyDate < today) {
    return { valid: true, isExpired: true, text: 'Expired' };
  }

  return { valid: true, isExpired: false, text: warrantyDateStr };
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 2. Access active theme colors dynamically
  const { theme, isDark } = useTheme();

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const list = await storage.getItems();
      setItems(list || []);
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

  const stats = useMemo(() => {
    const totalCount = items.length;
    const totalRepairs = items.reduce(
      (acc, curr) => acc + (Number(curr.repairsCount) || 0),
      0
    );
    const hasWarranty = items.filter((i) => {
      const status = getWarrantyStatus(i.warrantyUntil);
      return status.valid && !status.isExpired;
    }).length;

    return { totalCount, totalRepairs, hasWarranty };
  }, [items]);

  const filters = ['All', 'Has Warranty', 'Needs Repair'];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location &&
          item.location.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'Has Warranty') {
        const status = getWarrantyStatus(item.warrantyUntil);
        return status.valid && !status.isExpired;
      }
      if (selectedFilter === 'Needs Repair') {
        return (item.repairsCount || 0) > 0;
      }

      return true;
    });
  }, [items, searchQuery, selectedFilter]);

  // Dynamic Theme Palette Map (Fallback-safe defaults)
  const colors = {
    bg: theme?.background || (isDark ? '#0F172A' : '#FFFFFF'),
    cardBg: theme?.card || (isDark ? '#1E293B' : '#F8FAFC'),
    cardSurface: theme?.surface || (isDark ? '#1E293B' : '#FFFFFF'),
    border: theme?.border || (isDark ? '#334155' : '#E2E8F0'),
    text: theme?.text || (isDark ? '#F8FAFC' : '#0F172A'),
    textSecondary: theme?.textSecondary || (isDark ? '#94A3B8' : '#64748B'),
    badgeBg: isDark ? '#334155' : '#F1F5F9',
    accent: theme?.primary || (isDark ? '#38BDF8' : '#0F172A'),
    accentText: isDark ? '#0F172A' : '#FFFFFF',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
            <Feather name="box" size={20} color={colors.accentText} />
          </View>
          <View>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Vault</Text>
            <Text style={[styles.title, { color: colors.text }]}>My Stuff</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.profileAvatar, { backgroundColor: colors.badgeBg, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => router.push('/settings')}
        >
          <Feather name="settings" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
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
              tintColor={colors.accent}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Analytics Cards */}
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Assets</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>{stats.hasWarranty}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Warranty</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalRepairs}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Repairs</Text>
                </View>
              </View>

              {/* Search Bar */}
              <View style={[styles.searchBarContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Feather name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchBar, { color: colors.text }]}
                  placeholder="Search by name or location..."
                  placeholderTextColor={colors.textSecondary}
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
                      style={[
                        styles.chip,
                        { backgroundColor: isActive ? colors.accent : colors.badgeBg, borderColor: colors.border },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, { color: isActive ? colors.accentText : colors.textSecondary }]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Items ({filteredItems.length})
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="box" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No items found</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {searchQuery || selectedFilter !== 'All'
                  ? 'Try adjusting your search query or filters.'
                  : 'Tap the + button to add your first item.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const warrantyStatus = getWarrantyStatus(item.warrantyUntil);

            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.cardSurface, borderColor: colors.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/item-details',
                    params: { id: item.id, name: item.name },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={[styles.locationBadge, { backgroundColor: colors.badgeBg }]}>
                    <Ionicons name="location-outline" size={12} color={colors.textSecondary} style={styles.locationIcon} />
                    <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.location || 'Unassigned'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <Feather
                      name="shield"
                      size={13}
                      color={warrantyStatus.isExpired ? colors.danger : colors.textSecondary}
                    />
                    <Text style={[styles.subText, { color: colors.textSecondary }]}>
                      Warranty:{' '}
                      <Text
                        style={[
                          styles.subTextBold,
                          { color: colors.text },
                          warrantyStatus.isExpired && { color: colors.danger },
                          !warrantyStatus.valid && { color: colors.textSecondary },
                        ]}
                      >
                        {warrantyStatus.valid ? warrantyStatus.text : 'No Coverage'}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.footerInfo}>
                    <Feather name="tool" size={13} color={colors.textSecondary} />
                    <Text style={[styles.subText, { color: colors.textSecondary }]}>
                      Repairs: <Text style={[styles.subTextBold, { color: colors.text }]}>{item.repairsCount ?? 0}</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Single Plus FAB Button */}
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.fab,
          { backgroundColor: colors.accent, bottom: 24 + insets.bottom },
        ])}
        activeOpacity={0.85}
        onPress={() => router.push('/add-item')}
      >
        <Feather name="plus" size={28} color={colors.accentText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: { fontSize: 24, fontWeight: '800' },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterScrollView: { marginBottom: 16 },
  filterContainer: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationIcon: { marginRight: 3 },
  locationText: { fontSize: 12, fontWeight: '500' },
  cardDivider: { height: 1, marginVertical: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  subText: { fontSize: 13 },
  subTextBold: { fontWeight: '600' },
  expiredText: { color: '#EF4444', fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtext: { fontSize: 13, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});