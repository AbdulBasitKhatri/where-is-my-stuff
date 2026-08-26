import { useState, useEffect, useRef } from 'react';
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
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import storage from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

// 30 Major World Currencies
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

export default function AddItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { colors, defaultCurrency } = useTheme();

  const [form, setForm] = useState({
    name: '',
    location: '',
    purchasePrice: '',
    currency: defaultCurrency?.code || 'USD',
    currencySymbol: defaultCurrency?.symbol || '$',
    warrantyUntil: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showWarrantyPicker, setShowWarrantyPicker] = useState(false);
  const DateTimePickerRef = useRef(null);
  const modalAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(modalAnim, { toValue: modalVisible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [modalVisible]);

  const [BlurViewComp, setBlurViewComp] = useState(null);
  useEffect(() => {
    try {
      // dynamic require so app doesn't crash if expo-blur isn't installed
      // eslint-disable-next-line global-require
      const mod = require('expo-blur');
      if (mod && mod.BlurView) setBlurViewComp(() => mod.BlurView);
    } catch (e) {
      setBlurViewComp(null);
    }
    try {
      // attempt to require the community datetimepicker dynamically
      // eslint-disable-next-line global-require
      const dt = require('@react-native-community/datetimepicker');
      DateTimePickerRef.current = dt.default || dt;
    } catch (e) {
      DateTimePickerRef.current = null;
    }
  }, []);

  const formatDate = (d) => {
    if (!d) return '';
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const selectedCurrencyObj =
    POPULAR_CURRENCIES.find((c) => c.code === form.currency) || POPULAR_CURRENCIES[0];

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
      currency: form.currency,
      currencySymbol: form.currencySymbol,
      warrantyUntil: form.warrantyUntil.trim() || 'N/A',
      notes: form.notes.trim() || '',
      repairsCount: 0,
    };

    try {
      await storage.saveItem(newItem);
      router.back();
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
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
              <Feather name="box" size={14} color={colors.textMuted} />
              <Text style={[styles.label, { color: colors.text }]}>Item Name *</Text>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Sony Headphones"
              placeholderTextColor={colors.textMuted}
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          {/* Location Path Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="map-pin" size={14} color={colors.textMuted} />
              <Text style={[styles.label, { color: colors.text }]}>Location Path</Text>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Bedroom > Closet > Box 2"
              placeholderTextColor={colors.textMuted}
              value={form.location}
              onChangeText={(val) => setForm({ ...form, location: val })}
              autoCorrect={false}
            />
          </View>

          {/* Purchase Price & Currency Selector Row */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="dollar-sign" size={14} color={colors.textMuted} />
              <Text style={styles.label}>Purchase Price</Text>
            </View>

            <View style={styles.priceRow}>
              {/* Currency Dropdown Button */}
              <TouchableOpacity
                style={[styles.currencySelectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.currencySelectorText, { color: colors.text }]}>
                  {selectedCurrencyObj.code} ({selectedCurrencyObj.symbol})
                </Text>
                <Feather name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Price Numeric Input */}
              <TextInput
                style={[styles.input, styles.priceInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={form.purchasePrice}
                onChangeText={(val) => setForm({ ...form, purchasePrice: val })}
              />
            </View>
          </View>

          {/* Warranty End Date Input (Date Picker) */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="shield" size={14} color={colors.textMuted} />
              <Text style={styles.label}>Warranty End Date</Text>
            </View>
            <TouchableOpacity
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, justifyContent: 'center' }]}
              onPress={() => setShowWarrantyPicker(true)}
            >
              <Text style={{ color: form.warrantyUntil ? colors.text : colors.textMuted }}>{form.warrantyUntil || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>
            {showWarrantyPicker && DateTimePickerRef.current ? (
              <DateTimePickerRef.current
                value={form.warrantyUntil ? new Date(form.warrantyUntil) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={(selected) => {
                  if (Platform.OS !== 'ios') setShowWarrantyPicker(false);
                  if (selected) setForm((s) => ({ ...s, warrantyUntil: formatDate(selected) }));
                }}
                onDismiss={() => setShowWarrantyPicker(false)}
              />
            ) : null}
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="file-text" size={14} color={colors.textMuted} />
              <Text style={styles.label}>Notes</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Optional details, receipt notes, or serial numbers..."
              placeholderTextColor={colors.textMuted}
              value={form.notes}
              onChangeText={(val) => setForm({ ...form, notes: val })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }, isSaving && styles.submitBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.submitBtnText, { color: colors.primaryText }]}>Save Asset</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Currency Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          {BlurViewComp ? (
            <BlurViewComp intensity={60} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
          )}
          <Animated.View style={{ width: '92%', backgroundColor: colors.background, borderRadius: 14, maxHeight: '70%', padding: 18, borderWidth: 1, borderColor: colors.border, transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }], opacity: modalAnim }} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={POPULAR_CURRENCIES}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                const isSelected = item.code === form.currency;
                return (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      isSelected && { backgroundColor: colors.card },
                    ]}
                    onPress={() => {
                      setForm({
                        ...form,
                        currency: item.code,
                        currencySymbol: item.symbol,
                      });
                      setModalVisible(false);
                    }}
                  >
                    <View style={styles.currencyItemLeft}>
                      <Text style={[styles.currencyCodeText, { color: colors.text }]}>{item.code}</Text>
                      <Text style={[styles.currencyNameText, { color: colors.textMuted }]}>{item.name}</Text>
                    </View>
                    <Text style={[styles.currencySymbolText, { color: colors.text }]}>{item.symbol}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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

  // Price & Currency Selector Layout
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  currencySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 120,
    gap: 6,
  },
  currencySelectorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceInput: {
    flex: 1,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  currencyItemSelected: {
    backgroundColor: '#F1F5F9',
  },
  currencyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    width: 45,
  },
  currencyNameText: {
    fontSize: 14,
    color: '#64748B',
  },
  currencySymbolText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});