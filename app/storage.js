import * as SQLite from 'expo-sqlite';

const DB_NAME = 'inventory.db';

// Initialize and open the database
async function getDBConnection() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  
  // Ensure table exists
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      purchasePrice TEXT,
      warrantyUntil TEXT,
      notes TEXT,
      repairsCount INTEGER DEFAULT 0
    );
  `);
  
  return db;
}

const storage = {
  /**
   * Save a single new item (matches AddItemScreen call).
   */
  async saveItem(item) {
    try {
      const db = await getDBConnection();
      await db.runAsync(
        `INSERT INTO items (id, name, location, purchasePrice, warrantyUntil, notes, repairsCount)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          item.id,
          item.name,
          item.location || 'Unknown',
          item.purchasePrice || '',
          item.warrantyUntil || 'N/A',
          item.notes || '',
          item.repairsCount || 0,
        ]
      );
      return item;
    } catch (error) {
      console.error('SQLite Save Error:', error);
      throw error;
    }
  },

  /**
   * Retrieve all items.
   */
  async getItems() {
    try {
      const db = await getDBConnection();
      const allRows = await db.getAllAsync('SELECT * FROM items ORDER BY id DESC;');
      return allRows;
    } catch (error) {
      console.error('SQLite Fetch Error:', error);
      throw error;
    }
  },

  /**
   * Update an existing item by ID.
   */
  async updateItem(id, updatedFields) {
    try {
      const db = await getDBConnection();
      const fields = Object.keys(updatedFields);
      if (fields.length === 0) return;

      const setClause = fields.map((field) => `${field} = ?`).join(', ');
      const values = [...Object.values(updatedFields), id];

      await db.runAsync(`UPDATE items SET ${setClause} WHERE id = ?;`, values);
    } catch (error) {
      console.error('SQLite Update Error:', error);
      throw error;
    }
  },

  /**
   * Delete an item by ID.
   */
  async deleteItem(id) {
    try {
      const db = await getDBConnection();
      await db.runAsync('DELETE FROM items WHERE id = ?;', [id]);
    } catch (error) {
      console.error('SQLite Delete Error:', error);
      throw error;
    }
  },
};

export default storage;