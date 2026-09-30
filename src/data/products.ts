export type Category = 'all' | 'produce' | 'dairy' | 'bakery' | 'meat' | 'drinks' | 'pantry' | 'snacks'

export interface Product {
  id: string
  name: string
  nameAr: string
  price: number
  category: Category
  unit: string
  barcode: string
  stock: number
}

export const CATEGORIES: { id: Category; label: string; labelAr: string; icon: string }[] = [
  { id: 'all',     label: 'All Items', labelAr: 'الكل',           icon: '▦'  },
  { id: 'produce', label: 'Produce',   labelAr: 'خضار وفواكه',    icon: '🥦' },
  { id: 'dairy',   label: 'Dairy',     labelAr: 'ألبان',          icon: '🥛' },
  { id: 'bakery',  label: 'Bakery',    labelAr: 'مخبوزات',        icon: '🍞' },
  { id: 'meat',    label: 'Meat',      labelAr: 'لحوم',           icon: '🥩' },
  { id: 'drinks',  label: 'Drinks',    labelAr: 'مشروبات',        icon: '🧃' },
  { id: 'pantry',  label: 'Pantry',    labelAr: 'مؤونة',          icon: '🛒' },
  { id: 'snacks',  label: 'Snacks',    labelAr: 'وجبات خفيفة',   icon: '🍫' },
]

export const PRODUCTS: Product[] = [
  // Produce — خضار وفواكه
  { id: 'p001', name: 'Tomatoes',      nameAr: 'طماطم',           price: 12,   category: 'produce', unit: 'kg',  barcode: '6221234560001', stock: 50  },
  { id: 'p002', name: 'Cucumbers',     nameAr: 'خيار',            price: 8,    category: 'produce', unit: 'kg',  barcode: '6221234560002', stock: 40  },
  { id: 'p003', name: 'Onions',        nameAr: 'بصل',             price: 7,    category: 'produce', unit: 'kg',  barcode: '6221234560003', stock: 60  },
  { id: 'p004', name: 'Potatoes',      nameAr: 'بطاطس',           price: 9,    category: 'produce', unit: 'kg',  barcode: '6221234560004', stock: 70  },
  { id: 'p005', name: 'Bananas',       nameAr: 'موز',             price: 18,   category: 'produce', unit: 'kg',  barcode: '6221234560005', stock: 35  },
  { id: 'p006', name: 'Apples',        nameAr: 'تفاح',            price: 35,   category: 'produce', unit: 'kg',  barcode: '6221234560006', stock: 45  },
  // Dairy — ألبان
  { id: 'd001', name: 'Whole Milk 1L', nameAr: 'حليب كامل الدسم', price: 22,  category: 'dairy',   unit: 'pcs', barcode: '6221234561001', stock: 80  },
  { id: 'd002', name: 'Labneh 500g',   nameAr: 'لبنة',            price: 28,   category: 'dairy',   unit: 'pcs', barcode: '6221234561002', stock: 30  },
  { id: 'd003', name: 'Eggs (12)',      nameAr: 'بيض',             price: 55,   category: 'dairy',   unit: 'pcs', barcode: '6221234561003', stock: 25  },
  { id: 'd004', name: 'Butter 200g',   nameAr: 'زبدة',            price: 45,   category: 'dairy',   unit: 'pcs', barcode: '6221234561004', stock: 20  },
  // Bakery — مخبوزات
  { id: 'b001', name: 'Pita Bread (5)',nameAr: 'خبز عربي',        price: 5,    category: 'bakery',  unit: 'pcs', barcode: '6221234562001', stock: 100 },
  { id: 'b002', name: 'Sandwich Loaf', nameAr: 'خبز تست',         price: 18,   category: 'bakery',  unit: 'pcs', barcode: '6221234562002', stock: 40  },
  { id: 'b003', name: 'Kaak Cookies',  nameAr: 'كعك',             price: 25,   category: 'bakery',  unit: 'pcs', barcode: '6221234562003', stock: 30  },
  // Meat — لحوم
  { id: 'm001', name: 'Chicken Breast',nameAr: 'صدر دجاج',        price: 120,  category: 'meat',    unit: 'kg',  barcode: '6221234563001', stock: 20  },
  { id: 'm002', name: 'Ground Beef',   nameAr: 'لحم مفروم',       price: 180,  category: 'meat',    unit: 'kg',  barcode: '6221234563002', stock: 15  },
  { id: 'm003', name: 'Lamb Chops',    nameAr: 'ضلوع غنم',        price: 250,  category: 'meat',    unit: 'kg',  barcode: '6221234563003', stock: 10  },
  // Drinks — مشروبات
  { id: 'dr001', name: 'Water 1.5L',   nameAr: 'مياه معدنية',     price: 7,    category: 'drinks',  unit: 'pcs', barcode: '6221234564001', stock: 200 },
  { id: 'dr002', name: 'Orange Juice 1L',nameAr:'عصير برتقال',    price: 35,   category: 'drinks',  unit: 'pcs', barcode: '6221234564002', stock: 50  },
  { id: 'dr003', name: 'Cola 330ml',   nameAr: 'كولا',            price: 15,   category: 'drinks',  unit: 'pcs', barcode: '6221234564003', stock: 120 },
  { id: 'dr004', name: 'Laban 200ml',  nameAr: 'لبن',             price: 10,   category: 'drinks',  unit: 'pcs', barcode: '6221234564004', stock: 90  },
  // Pantry — مؤونة
  { id: 'pa001', name: 'Rice 5kg',     nameAr: 'أرز',             price: 110,  category: 'pantry',  unit: 'pcs', barcode: '6221234565001', stock: 60  },
  { id: 'pa002', name: 'Sugar 2kg',    nameAr: 'سكر',             price: 38,   category: 'pantry',  unit: 'pcs', barcode: '6221234565002', stock: 80  },
  { id: 'pa003', name: 'Olive Oil 750ml',nameAr:'زيت زيتون',      price: 145,  category: 'pantry',  unit: 'pcs', barcode: '6221234565003', stock: 25  },
  { id: 'pa004', name: 'Salt 1kg',     nameAr: 'ملح',             price: 8,    category: 'pantry',  unit: 'pcs', barcode: '6221234565004', stock: 100 },
  { id: 'pa005', name: 'Red Lentils 1kg',nameAr:'عدس أحمر',       price: 28,   category: 'pantry',  unit: 'pcs', barcode: '6221234565005', stock: 70  },
  // Snacks — وجبات خفيفة
  { id: 'sn001', name: 'Chips 80g',    nameAr: 'شيبس',            price: 14,   category: 'snacks',  unit: 'pcs', barcode: '6221234566001', stock: 150 },
  { id: 'sn002', name: 'Halawa 400g',  nameAr: 'حلاوة',           price: 42,   category: 'snacks',  unit: 'pcs', barcode: '6221234566002', stock: 40  },
  { id: 'sn003', name: 'Mixed Nuts 250g',nameAr:'مكسرات مشكلة',   price: 75,   category: 'snacks',  unit: 'pcs', barcode: '6221234566003', stock: 30  },
  { id: 'sn004', name: 'Chocolate Bar',nameAr: 'شوكولاتة',        price: 22,   category: 'snacks',  unit: 'pcs', barcode: '6221234566004', stock: 80  },
]
