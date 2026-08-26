import * as SQLite from 'expo-sqlite';

let db = null;

function getDb() {
  if (db) return db;
  if (!SQLite || typeof SQLite.openDatabase !== 'function') {
    throw new Error('expo-sqlite native module is not available in this runtime.');
  }
  db = SQLite.openDatabase('vaulttrack.db');
  return db;
}

function execSql(sql, args = []) {
  return new Promise((resolve, reject) => {
    try {
      const database = getDb();
      database.transaction((tx) => {
        tx.executeSql(
          sql,
          args,
          (_, result) => resolve(result),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    } catch (err) {
      reject(err);
    }
  });
}

export async function initDB() {
  await execSql(
    `CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT,
      location TEXT,
      purchasePrice TEXT,
      warrantyUntil TEXT,
      notes TEXT,
      repairsCount INTEGER
    );`
  );

  await execSql(
    `CREATE TABLE IF NOT EXISTS repairs (
      id TEXT PRIMARY KEY,
      itemId TEXT,
      date TEXT,
      cost REAL,
      provider TEXT,
      description TEXT
    );`
  );
}

export async function getItems() {
  await initDB();
  const res = await execSql('SELECT * FROM items ORDER BY rowid DESC');
  return res.rows._array;
}

export async function saveItem(item) {
  await initDB();
  const q = `INSERT OR REPLACE INTO items (id, name, location, purchasePrice, warrantyUntil, notes, repairsCount) VALUES (?, ?, ?, ?, ?, ?, ?);`;
  await execSql(q, [item.id, item.name, item.location, item.purchasePrice, item.warrantyUntil, item.notes, item.repairsCount || 0]);
}

export async function getRepairs(itemId) {
  await initDB();
  const res = await execSql('SELECT * FROM repairs WHERE itemId = ? ORDER BY rowid DESC', [itemId]);
  return res.rows._array;
}

export async function saveRepair(itemId, repair) {
  await initDB();
  const q = `INSERT OR REPLACE INTO repairs (id, itemId, date, cost, provider, description) VALUES (?, ?, ?, ?, ?, ?);`;
  await execSql(q, [repair.id, itemId, repair.date, repair.cost || 0, repair.provider, repair.description]);
  // update repairs count
  await execSql('UPDATE items SET repairsCount = COALESCE(repairsCount, 0) + 1 WHERE id = ?;', [itemId]);
}

export async function getItemById(id) {
  await initDB();
  const res = await execSql('SELECT * FROM items WHERE id = ? LIMIT 1', [id]);
  return res.rows._array[0] || null;
}

export default {
  initDB,
  getItems,
  saveItem,
  getRepairs,
  saveRepair,
  getItemById,
};
