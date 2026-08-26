import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEMS_KEY = '@vault_items';

async function readItems() {
  try {
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('AsyncStorage read error', err);
    return [];
  }
}

async function writeItems(items) {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('AsyncStorage write error', err);
    throw err;
  }
}

const storage = {
  async saveItem(item) {
    const items = await readItems();
    const normalized = {
      ...item,
      repairsCount: Number(item.repairsCount) || 0,
    };
    items.unshift(normalized);
    await writeItems(items);
    return normalized;
  },

  async getItems() {
    const items = await readItems();
    return items;
  },

  async updateItem(id, updatedFields) {
    const items = await readItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ...updatedFields };
    await writeItems(items);
  },

  async deleteItem(id) {
    let items = await readItems();
    items = items.filter((i) => i.id !== id);
    await writeItems(items);
  },

  // Repairs stored per-item under @repairs_<id>
  async getRepairs(itemId) {
    try {
      const key = `@repairs_${itemId}`;
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('getRepairs error', err);
      return [];
    }
  },

  async saveRepair(itemId, repair) {
    try {
      const key = `@repairs_${itemId}`;
      const raw = await AsyncStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(repair);
      await AsyncStorage.setItem(key, JSON.stringify(list));

      // Also update parent item's repairsCount
      const items = await readItems();
      const idx = items.findIndex((i) => i.id === itemId);
      if (idx !== -1) {
        items[idx].repairsCount = (Number(items[idx].repairsCount) || 0) + 1;
        await writeItems(items);
      }
    } catch (err) {
      console.error('saveRepair error', err);
      throw err;
    }
  },

  async deleteRepair(itemId, repairId) {
    try {
      const key = `@repairs_${itemId}`;
      const raw = await AsyncStorage.getItem(key);
      let list = raw ? JSON.parse(raw) : [];
      const before = list.length;
      list = list.filter((r) => r.id !== repairId);
      await AsyncStorage.setItem(key, JSON.stringify(list));

      if (list.length !== before) {
        const items = await readItems();
        const idx = items.findIndex((i) => i.id === itemId);
        if (idx !== -1) {
          items[idx].repairsCount = Math.max((Number(items[idx].repairsCount) || 1) - 1, 0);
          await writeItems(items);
        }
      }
    } catch (err) {
      console.error('deleteRepair error', err);
      throw err;
    }
  },
  async updateRepair(itemId, repairId, updatedFields) {
    try {
      const key = `@repairs_${itemId}`;
      const raw = await AsyncStorage.getItem(key);
      let list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((r) => r.id === repairId);
      if (idx === -1) return;
      list[idx] = { ...list[idx], ...updatedFields };
      await AsyncStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
      console.error('updateRepair error', err);
      throw err;
    }
  },
};

export default storage;