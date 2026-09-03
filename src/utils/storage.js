import { INITIAL_TRANSACTIONS, INITIAL_INVENTORY, INITIAL_SETTINGS, DEFAULT_USERS } from './mockData';
import { dbSet, dbListen, dbGet, dbRemove } from './firebase';

const KEYS = {
  TRANSACTIONS: 'lem_quan_transactions_v1',
  INVENTORY: 'lem_quan_inventory_v1',
  SETTINGS: 'lem_quan_settings_v1',
  USERS: 'lem_quan_users_v1',
  CURRENT_USER: 'lem_quan_current_user_v3'
};

// ═══════════════════════════════════════════
//  FIREBASE REAL-TIME SYNC LAYER
//  All data is stored on Firebase and synced
//  across all devices in real-time
//  
//  v4.0: Transactions are stored by ID key
//  (not as a flat array) for efficient writes
// ═══════════════════════════════════════════

// Convert transactions object {tx_id: {...}, ...} to array
const txObjectToArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.values(data).filter(Boolean);
};

// Check if transactions need format migration (array → object keyed by ID)
// NOTE: Full migration was done via CLI script (migrate-transactions.cjs)
// This only handles small edge cases (e.g., leftover numeric keys)
const checkTransactionFormat = async () => {
  try {
    const data = await dbGet('transactions');
    if (!data || Array.isArray(data)) return;
    
    const keys = Object.keys(data);
    const numericKeys = keys.filter(k => !isNaN(Number(k)));
    
    if (numericKeys.length > 0) {
      // Migrate remaining numeric keys one by one (not bulk!)
      console.log(`🔄 Migrating ${numericKeys.length} remaining numeric keys...`);
      for (const numKey of numericKeys) {
        const tx = data[numKey];
        if (tx && tx.id) {
          await dbSet(`transactions/${tx.id}`, tx);
          await dbRemove(`transactions/${numKey}`);
        }
      }
      console.log('✅ Remaining numeric keys migrated');
    }
  } catch (err) {
    console.error('Transaction format check error:', err);
  }
};

// Migrate old localStorage data to Firebase (one-time)
const migrateLocalStorageToFirebase = async () => {
  const MIGRATED_KEY = 'lem_quan_firebase_migrated_v1';
  if (localStorage.getItem(MIGRATED_KEY)) return; // Already migrated

  try {
    // Check if there's old transaction data in localStorage
    const oldTransactions = localStorage.getItem(KEYS.TRANSACTIONS);
    if (oldTransactions) {
      const parsed = JSON.parse(oldTransactions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firebaseTransactions = await dbGet('transactions');
        // Only migrate if Firebase is empty
        if (!firebaseTransactions) {
          // Convert to object format keyed by ID
          const txObject = {};
          for (const tx of parsed) {
            if (tx && tx.id) {
              txObject[tx.id] = tx;
            }
          }
          await dbSet('transactions', txObject);
          console.log(`✅ Migrated ${parsed.length} transactions from localStorage to Firebase`);
        }
      }
    }

    // Migrate inventory
    const oldInventory = localStorage.getItem(KEYS.INVENTORY);
    if (oldInventory) {
      const parsed = JSON.parse(oldInventory);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firebaseInventory = await dbGet('inventory');
        if (!firebaseInventory || (Array.isArray(firebaseInventory) && firebaseInventory.length === 0)) {
          await dbSet('inventory', parsed);
          console.log(`✅ Migrated ${parsed.length} inventory items from localStorage to Firebase`);
        }
      }
    }

    // Migrate settings
    const oldSettings = localStorage.getItem(KEYS.SETTINGS);
    if (oldSettings) {
      const parsed = JSON.parse(oldSettings);
      if (parsed && parsed.restaurantName) {
        await dbSet('settings', parsed);
        console.log('✅ Migrated settings from localStorage to Firebase');
      }
    }

    localStorage.setItem(MIGRATED_KEY, 'true');
    console.log('✅ localStorage → Firebase migration complete');
  } catch (err) {
    console.error('Migration error:', err);
  }
};

// Initialize Firebase with default data if empty
export const initFirebaseData = async () => {
  try {
    // First, migrate any old localStorage data
    await migrateLocalStorageToFirebase();

    // Check for any remaining numeric-key transactions and fix incrementally
    await checkTransactionFormat();

    const transactions = await dbGet('transactions');
    if (transactions === null) {
      await dbSet('transactions', {});
    }

    const inventory = await dbGet('inventory');
    if (inventory === null) {
      await dbSet('inventory', []);
    }

    const users = await dbGet('users');
    if (users === null) {
      await dbSet('users', DEFAULT_USERS);
    }

    const settings = await dbGet('settings');
    if (settings === null) {
      await dbSet('settings', INITIAL_SETTINGS);
    }
  } catch (err) {
    console.error('Firebase init error:', err);
  }
};

// Listen to real-time changes from Firebase
export const listenTransactions = (callback) => {
  return dbListen('transactions', (data) => {
    callback(txObjectToArray(data));
  }, (error) => {
    console.error('Transaction listener error:', error);
    // Fallback: still call with empty so loading overlay goes away
    callback([]);
  });
};

export const listenInventory = (callback) => {
  return dbListen('inventory', (data) => {
    const inventory = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    callback(inventory.filter(Boolean));
  }, (error) => {
    console.error('Inventory listener error:', error);
    callback([]);
  });
};

export const listenUsers = (callback) => {
  return dbListen('users', (data) => {
    const users = data ? (Array.isArray(data) ? data : Object.values(data)) : DEFAULT_USERS;
    callback(users.filter(Boolean));
  });
};

export const listenSettings = (callback) => {
  return dbListen('settings', (data) => {
    callback(data || INITIAL_SETTINGS);
  }, (error) => {
    console.error('Settings listener error:', error);
    callback(INITIAL_SETTINGS);
  });
};

// ═══════════════════════════════════════════
//  SAVE FUNCTIONS — Individual writes
//  Instead of replacing ALL transactions every
//  save, we now write individual records by ID.
//  This is MUCH faster and reliable (KB vs MB).
// ═══════════════════════════════════════════

// Save a SINGLE transaction by its ID
export const saveTransaction = async (transaction) => {
  if (!transaction || !transaction.id) {
    console.error('Cannot save transaction without ID');
    return;
  }
  try {
    await dbSet(`transactions/${transaction.id}`, transaction);
  } catch (err) {
    console.error('Error saving transaction to Firebase:', err);
    throw err; // Let caller know it failed
  }
};

// Delete a SINGLE transaction by ID
export const deleteTransactionById = async (id) => {
  if (!id) return;
  try {
    await dbRemove(`transactions/${id}`);
  } catch (err) {
    console.error('Error deleting transaction from Firebase:', err);
    throw err;
  }
};

// Bulk save ALL transactions (for migration/reset only)
export const saveTransactions = async (transactions) => {
  try {
    if (Array.isArray(transactions)) {
      // Convert array to object keyed by ID
      const txObject = {};
      for (const tx of transactions) {
        if (tx && tx.id) {
          txObject[tx.id] = tx;
        }
      }
      await dbSet('transactions', txObject);
    } else {
      await dbSet('transactions', transactions);
    }
  } catch (err) {
    console.error('Error saving transactions to Firebase:', err);
  }
};

export const saveInventory = async (inventory) => {
  try {
    await dbSet('inventory', inventory);
  } catch (err) {
    console.error('Error saving inventory to Firebase:', err);
  }
};

export const saveUsers = async (users) => {
  try {
    await dbSet('users', users);
  } catch (err) {
    console.error('Error saving users to Firebase:', err);
  }
};

export const saveSettings = async (settings) => {
  try {
    await dbSet('settings', settings);
  } catch (err) {
    console.error('Error saving settings to Firebase:', err);
  }
};

// Load from Firebase (one-time read)
export const loadTransactions = async () => {
  try {
    const data = await dbGet('transactions');
    return txObjectToArray(data);
  } catch (err) {
    return [];
  }
};

export const loadInventory = async () => {
  try {
    const data = await dbGet('inventory');
    if (!data) return [];
    return Array.isArray(data) ? data : Object.values(data).filter(Boolean);
  } catch (err) {
    return [];
  }
};

export const loadSettings = async () => {
  try {
    const data = await dbGet('settings');
    return data || INITIAL_SETTINGS;
  } catch (err) {
    return INITIAL_SETTINGS;
  }
};

export const loadUsers = () => {
  // Users loaded synchronously from local cache for auth, but synced via listener
  try {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : DEFAULT_USERS;
  } catch (err) {
    return DEFAULT_USERS;
  }
};

// Cache users locally for fast auth
export const cacheUsersLocally = (users) => {
  try {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  } catch (err) {}
};

// Session management (stays in localStorage - per device)
export const loadSavedUserSession = () => {
  try {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const saveUserSession = (user) => {
  try {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  } catch (err) {}
};

// ═══════════════════════════════════════════
//  UTILITY FORMATTERS
// ═══════════════════════════════════════════

export const formatVND = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDateVN = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to parse & sort transaction list by Date & Time
export const sortTransactionsByDateTime = (list = [], direction = 'DESC') => {
  if (!Array.isArray(list)) return [];

  const getTs = (t) => {
    if (!t) return 0;
    let dateVal = t.date || '';
    let timeVal = t.time || '00:00';

    if (typeof dateVal === 'number') return dateVal;
    if (/^\d{10,}$/.test(String(dateVal))) return Number(dateVal);

    if (typeof dateVal === 'string' && dateVal.includes('/')) {
      const parts = dateVal.split('/');
      if (parts.length === 3) {
        dateVal = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const normalizedTime = timeVal.length === 5 ? `${timeVal}:00` : timeVal;
    const combined = `${dateVal}T${normalizedTime}`;
    const ts = new Date(combined).getTime();
    if (!isNaN(ts)) return ts;

    const dateOnlyTs = new Date(dateVal).getTime();
    if (!isNaN(dateOnlyTs)) return dateOnlyTs;

    return 0;
  };

  return [...list].sort((a, b) => {
    const tsA = getTs(a);
    const tsB = getTs(b);

    if (tsA !== tsB) {
      return direction === 'DESC' ? tsB - tsA : tsA - tsB;
    }

    // Tie-breaker 1: updatedAt if recently edited
    const upA = a.updatedAt || 0;
    const upB = b.updatedAt || 0;
    if (upA !== upB) {
      return direction === 'DESC' ? upB - upA : upA - upB;
    }

    // Tie-breaker 2: id
    return direction === 'DESC'
      ? String(b.id || '').localeCompare(String(a.id || ''))
      : String(a.id || '').localeCompare(String(a.id || ''));
  });
};

// Reset all data on Firebase
export const resetToFactoryDefaults = async () => {
  await dbSet('transactions', {});
  await dbSet('inventory', []);
  await dbSet('users', DEFAULT_USERS);
  await dbSet('settings', INITIAL_SETTINGS);
  localStorage.removeItem(KEYS.CURRENT_USER);
  window.location.reload();
};
