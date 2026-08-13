import { INITIAL_TRANSACTIONS, INITIAL_INVENTORY, INITIAL_SETTINGS, DEFAULT_USERS } from './mockData';

const KEYS = {
  TRANSACTIONS: 'lem_quan_transactions_v1',
  INVENTORY: 'lem_quan_inventory_v1',
  SETTINGS: 'lem_quan_settings_v1',
  USERS: 'lem_quan_users_v1',
  CURRENT_USER: 'lem_quan_current_user_v3' // Bumped to force reload new account names
};

// Helper format VND currency
export const formatVND = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format short date (DD/MM/YYYY)
export const formatDateVN = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.NumberFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

// Get today string YYYY-MM-DD
export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Storage Loaders
export const loadTransactions = () => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions', err);
  }
};

export const loadInventory = () => {
  try {
    const data = localStorage.getItem(KEYS.INVENTORY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

export const saveInventory = (inventory) => {
  try {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
  } catch (err) {
    console.error('Error saving inventory', err);
  }
};

export const loadSettings = () => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  } catch (err) {
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings', err);
  }
};

export const loadUsers = () => {
  try {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : DEFAULT_USERS;
  } catch (err) {
    return DEFAULT_USERS;
  }
};

export const saveUsers = (users) => {
  try {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users', err);
  }
};

export const loadSavedUserSession = () => {
  try {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null; // LOGGED OUT BY DEFAULT FOR ALL DEVICES!
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
  } catch (err) {
    console.error('Error saving session', err);
  }
};

// Reset all data & logout all users
export const resetToFactoryDefaults = () => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify([]));
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.CURRENT_USER);
  window.location.reload();
};
