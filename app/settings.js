import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    themeMode,
    colors,
    defaultCurrency,
    updateThemeMode,
    updateDefaultCurrency,
  } = useTheme();

  const FAQ_ITEMS = [
    { q: 'Why can\'t I feel haptics?', a: 'Haptics were removed from this build for broader compatibility.' },
    { q: 'Where are items stored?', a: 'Items are stored locally using AsyncStorage on your device.' },
    { q: 'How do I change default currency?', a: 'Open the Default Currency setting and choose a currency.' },
  ];

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [faqModalVisible, setFaqModalVisible] = useState(false);

  const handleThemeChange = (mode) => {
    updateThemeMode(mode);
  };

  const handleSelectCurrency = (item) => {
    updateDefaultCurrency({ code: item.code, symbol: item.symbol });
    setCurrencyModalVisible(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION: PREFERENCES */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          PREFERENCES
        </Text>

        {/* Currency Selector */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setCurrencyModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Feather name="dollar-sign" size={18} color={colors.text} />
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Default Currency</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Used for new asset entries
                </Text>
              </View>
            </View>

            <View style={styles.rowRight}>
              <Text style={[styles.valueText, { color: colors.primary }]}>
                {defaultCurrency.code} ({defaultCurrency.symbol})
              </Text>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION: APPEARANCE */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          APPEARANCE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.themeSelector}>
            {['light', 'dark', 'system'].map((mode) => {
              const isActive = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleThemeChange(mode)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'monitor'}
                    size={16}
                    color={isActive ? colors.primaryText : colors.text}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      { color: isActive ? colors.primaryText : colors.text },
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION: FEEDBACK & ACCESSIBILITY */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}> 
          FEEDBACK & ACCESSIBILITY
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Feather name="info" size={18} color={colors.text} />
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>FAQ & Help</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Common questions and troubleshooting
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setFaqModalVisible(true)}>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          activeOpacity={1}
          onPress={() => setCurrencyModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Default Currency
              </Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={POPULAR_CURRENCIES}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.code === defaultCurrency.code;
                return (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      isSelected && { backgroundColor: colors.card },
                    ]}
                    onPress={() => handleSelectCurrency(item)}
                  >
                    <View style={styles.currencyLeft}>
                      <Text style={[styles.currencyCode, { color: colors.text }]}>
                        {item.code}
                      </Text>
                      <Text style={[styles.currencyName, { color: colors.textMuted }]}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={[styles.currencySymbol, { color: colors.text }]}>
                      {item.symbol}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>


      {/* FAQ Modal */}
      <Modal visible={faqModalVisible} animationType="slide" transparent onRequestClose={() => setFaqModalVisible(false)}>
        <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]} activeOpacity={1} onPress={() => setFaqModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}> 
              <Text style={[styles.modalTitle, { color: colors.text }]}>FAQ & Help</Text>
              <TouchableOpacity onPress={() => setFaqModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={FAQ_ITEMS}
              keyExtractor={(i, idx) => String(idx)}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 12 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{item.q}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 6 }}>{item.a}</Text>
                </View>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Theme Segmented Control
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
    width: 45,
  },
  currencyName: {
    fontSize: 14,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '600',
  },
});