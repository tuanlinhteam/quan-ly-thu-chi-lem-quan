// Preset default accounts with RBAC roles (Admin & Quản Lý only)
export const DEFAULT_USERS = [
  {
    id: 'usr_1',
    username: 'admin',
    password: 'admin123',
    name: 'admin',
    role: 'ADMIN',
    roleLabel: 'Quản Trị Viên (Full Quyền)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminLem'
  },
  {
    id: 'usr_2',
    username: 'Quanly',
    password: '123123',
    name: 'Quản Lý',
    role: 'MANAGER',
    roleLabel: 'Quản Lý Thu Chi & Kho',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ManagerLem'
  }
];

// Categories for Income (Thu) and Expense (Chi)
export const TRANSACTION_CATEGORIES = {
  INCOME: [
    { id: 'inc_sales', name: 'Doanh thu Bán hàng / Tiệc', color: '#10B981', icon: 'Utensils' },
    { id: 'inc_delivery', name: 'Doanh thu Giao hàng Ship', color: '#06B6D4', icon: 'Truck' },
    { id: 'inc_vip', name: 'Đặt cọc Tiệc VIP / Sinh nhật', color: '#8B5CF6', icon: 'Crown' },
    { id: 'inc_other', name: 'Thu nhập khác', color: '#64748B', icon: 'PlusCircle' },
  ],
  EXPENSE: [
    { id: 'exp_seafood', name: 'Nhập Hải sản tươi sống', color: '#EF4444', icon: 'Fish' },
    { id: 'exp_drinks', name: 'Nhập Bia & Nước giải khát', color: '#F97316', icon: 'Beer' },
    { id: 'exp_ingredients', name: 'Nhập Rau củ & Gia vị', color: '#F59E0B', icon: 'Carrot' },
    { id: 'exp_rent', name: 'Tiền Mặt bằng / Thuê nhà', color: '#3B82F6', icon: 'Home' },
    { id: 'exp_salary', name: 'Lương & Thưởng Nhân viên', color: '#EC4899', icon: 'Users' },
    { id: 'exp_utilities', name: 'Tiền Điện, Nước, Internet', color: '#06B6D4', icon: 'Zap' },
    { id: 'exp_marketing', name: 'Quảng cáo & Marketing', color: '#8B5CF6', icon: 'Sparkles' },
    { id: 'exp_other', name: 'Chi phí Khác', color: '#64748B', icon: 'MinusCircle' },
  ]
};

// Clean empty inventory
export const INITIAL_INVENTORY = [];

// Clean empty transactions
export const INITIAL_TRANSACTIONS = [];

// Initial Restaurant Settings
export const INITIAL_SETTINGS = {
  restaurantName: 'LEM QUÁN - NHẬU & CHILL',
  subTitle: 'Hải Sản Tươi Sống & Đồ Nhậu Đẳng Cấp',
  address: '123 Đường Bờ Biển, Phường 2, TP. Vũng Tàu',
  phone: '0988.888.999 / 0909.123.456',
  monthlyRevenueTarget: 350000000,
  taxRatePercent: 0,
  currencySymbol: '₫'
};
