import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

  const { colors, defaultCurrency } = useTheme();
  const router = useRouter();

  const [parentItem, setParentItem] = useState(null);
  const [editItemModalVisible, setEditItemModalVisible] = useState(false);
  const [editItemForm, setEditItemForm] = useState({ name: '', location: '', purchasePrice: '', currency: defaultCurrency?.code || 'USD', currencySymbol: defaultCurrency?.symbol || '$', warrantyUntil: '', notes: '' });

  const [editingRepair, setEditingRepair] = useState(null);
  const [repairEditModalVisible, setRepairEditModalVisible] = useState(false);
  const [editRepairForm, setEditRepairForm] = useState({ date: '', cost: '', provider: '', description: '', currency: defaultCurrency?.code || 'USD', currencySymbol: defaultCurrency?.symbol || '$' });

  const modalAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anyOpen = repairCurrencyModalVisible || repairEditModalVisible || editItemModalVisible;
    Animated.timing(modalAnim, { toValue: anyOpen ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [repairCurrencyModalVisible, repairEditModalVisible, editItemModalVisible]);

  const saveRepair = async () => {
    if (!form.date || !form.provider) {
      Alert.alert('Validation', 'Please provide date and provider.');
      return;
    }
    const newRepair = { id: Date.now().toString(), date: form.date, cost: parseFloat(form.cost) || 0, provider: form.provider, description: form.description, currency: repairCurrency, currencySymbol: repairCurrencySymbol };
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

  // Item edit/delete handlers
  const openEditItem = () => {
    setEditItemModalVisible(true);
  };

  const saveItemEdits = async () => {
    if (!parentItem) return;
    try {
      await storage.updateItem(parentItem.id, {
        name: editItemForm.name,
        location: editItemForm.location,
        purchasePrice: editItemForm.purchasePrice,
        currency: editItemForm.currency,
        currencySymbol: editItemForm.currencySymbol,
        warrantyUntil: editItemForm.warrantyUntil,
        notes: editItemForm.notes,
      });
      setEditItemModalVisible(false);
      // refresh parent item
      const items = await storage.getItems();
      const it = (items || []).find((i) => String(i.id) === String(id));
      setParentItem(it);
    } catch (e) {
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const deleteItemConfirmed = () => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item and its repairs?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await storage.deleteItem(id);
          // also remove repairs key
          await AsyncStorage.removeItem(`@repairs_${id}`);
        } catch (e) {
          // ignore
        } finally {
          router.back();
        }
      } }
    ]);
  };

  // Repair edit/delete handlers
  const openEditRepair = (repair) => {
    setEditingRepair(repair);
    setEditRepairForm({ date: repair.date || '', cost: String(repair.cost || ''), provider: repair.provider || '', description: repair.description || '', currency: repair.currency || repairCurrency, currencySymbol: repair.currencySymbol || repairCurrencySymbol });
    setRepairEditModalVisible(true);
  };

  const saveEditedRepair = async () => {
    if (!editingRepair) return;
    try {
      await storage.updateRepair(id, editingRepair.id, {
        date: editRepairForm.date,
        cost: parseFloat(editRepairForm.cost) || 0,
        provider: editRepairForm.provider,
        description: editRepairForm.description,
        currency: editRepairForm.currency,
        currencySymbol: editRepairForm.currencySymbol,
      });
      const list = await storage.getRepairs(id);
      setRepairs(list || []);
      setRepairEditModalVisible(false);
      setEditingRepair(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to update repair.');
    }
  };

  const deleteRepairConfirmed = (repairId) => {
    Alert.alert('Delete Repair', 'Delete this repair entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await storage.deleteRepair(id, repairId);
          const list = await storage.getRepairs(id);
          setRepairs(list || []);
        } catch (e) {
          Alert.alert('Error', 'Failed to delete repair.');
        }
      } }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.repairCard, { backgroundColor: colors.card }]}> 
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[styles.repairProvider, { color: colors.text }]}>{item.provider}</Text>
        <Text style={[styles.repairCost, { color: colors.danger }]}>{`${item.currencySymbol || repairCurrencySymbol || '$'}${(item.cost || 0).toFixed(2)}`}</Text>
      </View>
      <Text style={[styles.repairDesc, { color: colors.textMuted }]}>{item.description}</Text>
      <Text style={[styles.repairDate, { color: colors.textMuted }]}>{item.date}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <TouchableOpacity onPress={() => openEditRepair(item)}>
          <Text style={{ color: colors.primary }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteRepairConfirmed(item.id)}>
          <Text style={{ color: colors.danger }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
 

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
  ];

  const [repairCurrencyModalVisible, setRepairCurrencyModalVisible] = useState(false);
  const [repairCurrency, setRepairCurrency] = useState(defaultCurrency?.code || 'USD');
  const [repairCurrencySymbol, setRepairCurrencySymbol] = useState(defaultCurrency?.symbol || '$');
  const [repairCurrencyModalTarget, setRepairCurrencyModalTarget] = useState('form');
  const [parentCurrencyLoaded, setParentCurrencyLoaded] = useState(false);
  const [parentItemCurrency, setParentItemCurrency] = useState(null);
  const ListHeader = () => (
    <>
      <View style={[styles.headerBox, { backgroundColor: colors.card }]}> 
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, { color: colors.text }]}>{parentItem?.name || name}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={openEditItem} style={{ marginRight: 8 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteItemConfirmed}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.location, { color: colors.textMuted }]}>{`Location: ${parentItem?.location || 'Office > Desk'}`}</Text>
        <Text style={[styles.warranty, { color: colors.text }]}>{`Warranty Expires: ${parentItem?.warrantyUntil || 'N/A'}`}</Text>
      </View>
      <Text style={[styles.sectionHeader, { color: colors.text }]}>Maintenance & Repair Logs</Text>
    </>
  );

  // load parent item to inherit currency if available
  useEffect(() => {
    (async () => {
      try {
        const items = await storage.getItems();
        const it = (items || []).find((i) => String(i.id) === String(id));
        if (it && it.currency) {
          setRepairCurrency(it.currency || defaultCurrency?.code);
          setRepairCurrencySymbol(it.currencySymbol || defaultCurrency?.symbol);
          setParentItemCurrency(it.currency);
          setParentItem(it);
          setEditItemForm({
            name: it.name || '',
            location: it.location || '',
            purchasePrice: it.purchasePrice || '',
            currency: it.currency || defaultCurrency?.code,
            currencySymbol: it.currencySymbol || defaultCurrency?.symbol,
            warrantyUntil: it.warrantyUntil || '',
            notes: it.notes || '',
          });
        }
      } catch (e) {
        // ignore
      } finally {
        setParentCurrencyLoaded(true);
      }
    })();
  }, [id]);

  // ListFooter removed; form is rendered outside the FlatList to avoid remounting inputs while typing

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={repairs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, paddingTop: 8 }}>No repairs logged yet.</Text>}
          contentContainerStyle={{ paddingBottom: 8 }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        />

        {/* Render footer/form outside of FlatList to avoid remounting the inputs while typing */}
        <View style={{ paddingTop: 12 }}>
          {showForm ? (
            <View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.currencySelectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => { setRepairCurrencyModalTarget('form'); setRepairCurrencyModalVisible(true); }}
                >
                  <Text style={[styles.currencyCodeText, { color: colors.text }]}>{repairCurrency}</Text>
                  <Text style={[styles.currencySymbolText, { color: colors.text }]}>{repairCurrencySymbol}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text }]}
                  placeholder="e.g. 120.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={form.cost}
                  onChangeText={(t) => setForm((s) => ({ ...s, cost: t }))}
                  blurOnSubmit={false}
                />
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={form.date}
                onChangeText={(t) => setForm((s) => ({ ...s, date: t }))}
                blurOnSubmit={false}
              />

              <Text style={[styles.label, { color: colors.text }]}>Provider</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="e.g. Apple Store"
                placeholderTextColor={colors.textMuted}
                value={form.provider}
                onChangeText={(t) => setForm((s) => ({ ...s, provider: t }))}
                blurOnSubmit={false}
              />

              <Text style={[styles.label, { color: colors.text }]}>Cost ({repairCurrency})</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="e.g. 120.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={form.cost}
                onChangeText={(t) => setForm((s) => ({ ...s, cost: t }))}
                blurOnSubmit={false}
              />

              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, { minHeight: 60, textAlignVertical: 'top', backgroundColor: colors.card, color: colors.text }]}
                placeholder="What was done"
                placeholderTextColor={colors.textMuted}
                multiline
                value={form.description}
                onChangeText={(t) => setForm((s) => ({ ...s, description: t }))}
                blurOnSubmit={false}
              />

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

          {/* Repair Currency Picker Modal */}
          <Modal
            visible={repairCurrencyModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setRepairCurrencyModalVisible(false)}
          >
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.modalOverlay }}
              activeOpacity={1}
              onPress={() => setRepairCurrencyModalVisible(false)}
            >
              <Animated.View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', padding: 20, borderTopWidth: 2, borderTopColor: colors.border, transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }], opacity: modalAnim }} onStartShouldSetResponder={() => true}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Select Currency</Text>
                  <TouchableOpacity onPress={() => setRepairCurrencyModalVisible(false)}>
                    <Text style={{ color: colors.textMuted }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={POPULAR_CURRENCIES}
                  keyExtractor={(it) => it.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 }}
                      onPress={() => {
                            if (repairCurrencyModalTarget === 'editRepair') {
                              setEditRepairForm((s) => ({ ...s, currency: item.code, currencySymbol: item.symbol }));
                            } else if (repairCurrencyModalTarget === 'editItem') {
                              setEditItemForm((s) => ({ ...s, currency: item.code, currencySymbol: item.symbol }));
                            } else {
                              setRepairCurrency(item.code);
                              setRepairCurrencySymbol(item.symbol);
                            }
                            setRepairCurrencyModalVisible(false);
                            setRepairCurrencyModalTarget('form');
                          }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, width: 45 }}>{item.code}</Text>
                        <Text style={{ fontSize: 14, color: colors.textMuted }}>{item.name}</Text>
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{item.symbol}</Text>
                    </TouchableOpacity>
                  )}
                />
              </Animated.View>
            </TouchableOpacity>
          </Modal>

          {/* Edit Item Modal */}
          <Modal visible={editItemModalVisible} animationType="slide" transparent onRequestClose={() => setEditItemModalVisible(false)}>
            <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.modalOverlay }} activeOpacity={1} onPress={() => setEditItemModalVisible(false)}>
              <Animated.View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 20, borderTopWidth: 2, borderTopColor: colors.border, transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }], opacity: modalAnim }} onStartShouldSetResponder={() => true}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Edit Item</Text>
                  <TouchableOpacity onPress={() => setEditItemModalVisible(false)}>
                    <Text style={{ color: colors.textMuted }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Name</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={editItemForm.name} onChangeText={(t) => setEditItemForm((s) => ({ ...s, name: t }))} />
                <Text style={[styles.label, { color: colors.text }]}>Location</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={editItemForm.location} onChangeText={(t) => setEditItemForm((s) => ({ ...s, location: t }))} />
                <Text style={[styles.label, { color: colors.text }]}>Purchase Price</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={editItemForm.purchasePrice} onChangeText={(t) => setEditItemForm((s) => ({ ...s, purchasePrice: t }))} keyboardType="numeric" />
                <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
                <TouchableOpacity style={[styles.currencySelectorBtn, { backgroundColor: colors.card, borderColor: colors.border, alignSelf: 'flex-start' }]} onPress={() => { setRepairCurrencyModalTarget('editItem'); setRepairCurrencyModalVisible(true); }}>
                  <Text style={[styles.currencyCodeText, { color: colors.text }]}>{editItemForm.currency}</Text>
                  <Text style={[styles.currencySymbolText, { color: colors.text }]}>{editItemForm.currencySymbol}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.addRepairBtn, { marginTop: 8, borderColor: colors.primary }]} onPress={saveItemEdits}>
                  <Text style={[styles.addRepairText, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </Modal>

          {/* Edit Repair Modal */}
          <Modal visible={repairEditModalVisible} animationType="slide" transparent onRequestClose={() => setRepairEditModalVisible(false)}>
            <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.modalOverlay }} activeOpacity={1} onPress={() => setRepairEditModalVisible(false)}>
              <Animated.View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 20, borderTopWidth: 2, borderTopColor: colors.border, transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }], opacity: modalAnim }} onStartShouldSetResponder={() => true}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Edit Repair</Text>
                  <TouchableOpacity onPress={() => setRepairEditModalVisible(false)}>
                    <Text style={{ color: colors.textMuted }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Provider</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={editRepairForm.provider} onChangeText={(t) => setEditRepairForm((s) => ({ ...s, provider: t }))} />
                <Text style={[styles.label, { color: colors.text, marginTop: 8 }]}>Currency</Text>
                <TouchableOpacity style={[styles.currencySelectorBtn, { backgroundColor: colors.card, borderColor: colors.border, alignSelf: 'flex-start' }]} onPress={() => { setRepairCurrencyModalTarget('editRepair'); setRepairCurrencyModalVisible(true); }}>
                  <Text style={[styles.currencyCodeText, { color: colors.text }]}>{editRepairForm.currency}</Text>
                  <Text style={[styles.currencySymbolText, { color: colors.text }]}>{editRepairForm.currencySymbol}</Text>
                </TouchableOpacity>
                <Text style={[styles.label, { color: colors.text }]}>Date</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={editRepairForm.date} onChangeText={(t) => setEditRepairForm((s) => ({ ...s, date: t }))} />
                <Text style={[styles.label, { color: colors.text }]}>Cost</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={editRepairForm.cost} onChangeText={(t) => setEditRepairForm((s) => ({ ...s, cost: t }))} keyboardType="numeric" />
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top', backgroundColor: colors.card, color: colors.text }]} value={editRepairForm.description} onChangeText={(t) => setEditRepairForm((s) => ({ ...s, description: t }))} multiline />

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={[styles.addRepairBtn, { flex: 1, borderColor: colors.primary }]} onPress={saveEditedRepair}>
                    <Text style={[styles.addRepairText, { color: colors.primary }]}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.addRepairBtn, { flex: 1, borderWidth: 0, backgroundColor: colors.card }]} onPress={() => { if (editingRepair) deleteRepairConfirmed(editingRepair.id); }}>
                    <Text style={{ color: colors.danger }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Modal>
        </View>
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
  currencySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  currencyCodeText: {
    fontSize: 14,
    fontWeight: '700',
    width: 45,
  },
  currencySymbolText: {
    fontSize: 15,
    fontWeight: '600',
  },
});