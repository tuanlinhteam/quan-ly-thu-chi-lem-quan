import { INITIAL_TRANSACTIONS, INITIAL_INVENTORY, INITIAL_SETTINGS, DEFAULT_USERS } from './mockData';
import { dbSet, dbListen, dbGet } from './firebase';

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
// ═══════════════════════════════════════════

// Initialize Firebase with default data if empty
export const initFirebaseData = async () => {
  try {
    const transactions = await dbGet('transactions');
    if (transactions === null) {
      await dbSet('transactions', []);
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
    const transactions = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    callback(transactions.filter(Boolean));
  });
};

export const listenInventory = (callback) => {
  return dbListen('inventory', (data) => {
    const inventory = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    callback(inventory.filter(Boolean));
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
  });
};

// Save to Firebase (replaces localStorage writes)
export const saveTransactions = async (transactions) => {
  try {
    await dbSet('transactions', transactions);
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
    if (!data) return [];
    return Array.isArray(data) ? data : Object.values(data).filter(Boolean);
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

// Reset all data on Firebase
export const resetToFactoryDefaults = async () => {
  await dbSet('transactions', []);
  await dbSet('inventory', []);
  await dbSet('users', DEFAULT_USERS);
  await dbSet('settings', INITIAL_SETTINGS);
  localStorage.removeItem(KEYS.CURRENT_USER);
  window.location.reload();
};
