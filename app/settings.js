import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const [selectedCurrency, setSelectedCurrency] = useState('USD ($)');
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const currencies = ['USD ($)', 'EUR (€)', 'GBP (£)', 'PKR (Rs)', 'CAD ($)'];

  const handleExportData = () => {
    Alert.alert(
      'Export Database',
      'Your inventory data has been prepared as a JSON file.',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Wipe All Data',
      'Are you sure you want to delete all items and repair histories? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: PREFERENCES */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.card}>
          {/* Currency Choice */}
          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Feather name="dollar-sign" size={16} color="#0F172A" />
              <Text style={styles.rowTitle}>Default Currency</Text>
            </View>
            <Text style={styles.rowValue}>{selectedCurrency}</Text>
          </View>

          <View style={styles.divider} />

          {/* Theme Option */}
          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Feather name="moon" size={16} color="#0F172A" />
              <Text style={styles.rowTitle}>Theme</Text>
            </View>
            <Text style={styles.rowValue}>Monochrome Dark Navy</Text>
          </View>

          <View style={styles.divider} />

          {/* Haptics */}
          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Feather name="sliders" size={16} color="#0F172A" />
              <Text style={styles.rowTitle}>Haptic Feedback</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: '#CBD5E1', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SECTION 2: DATA & BACKUP */}
        <Text style={styles.sectionHeader}>Data Management</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleExportData}>
            <View style={styles.rowLabelGroup}>
              <Feather name="download" size={16} color="#0F172A" />
              <Text style={styles.rowTitle}>Export Inventory Data</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Feather name="refresh-cw" size={16} color="#0F172A" />
              <Text style={styles.rowTitle}>Auto-Backup to Storage</Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ false: '#CBD5E1', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleClearData}>
            <View style={styles.rowLabelGroup}>
              <Feather name="trash-2" size={16} color="#EF4444" />
              <Text style={[styles.rowTitle, { color: '#EF4444' }]}>
                Clear Database
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* SECTION 3: HELP & FAQ */}
        <Text style={styles.sectionHeader}>Support & Info</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              Alert.alert('Location Paths FAQ', 'Use "Room > Unit > Container" format for seamless searching (e.g. Living Room > Shelf 3).')
            }
          >
            <View style={styles.rowLabelGroup}>
              <Feather name="help-circle" size={16} color="#0F172A" />
              <Text style={styles.rowTitle}>Frequently Asked Questions</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Feather name="info" size={16} color="#0F172A" />
              <Text style={styles.rowTitle}>Version</Text>
            </View>
            <Text style={styles.rowValue}>1.0.0 (SQLite Local)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});