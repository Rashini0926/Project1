// utils/migrateClothingData.js
import { importInitialClothingItems, getAllClothingItems } from '../services/clothingItemService';

// Original static clothing items with enhanced data
export const initialClothingItems = [
  { 
    name: 'T-Shirt', 
    price: 19.99,
    description: 'Classic cotton t-shirt, comfortable for everyday wear',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray', 'Blue'],
    stockQuantity: 100,
    materials: [
      { name: 'Cotton', quantity: 0.25, unit: 'kg', cost: 5.0 }
    ]
  },
  { 
    name: 'Jeans', 
    price: 49.99,
    description: 'Durable denim jeans with classic 5-pocket design',
    category: 'Bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'Gray'],
    stockQuantity: 80,
    materials: [
      { name: 'Denim', quantity: 0.8, unit: 'kg', cost: 12.0 },
      { name: 'Metal Buttons', quantity: 5, unit: 'pieces', cost: 2.5 }
    ]
  },
  { 
    name: 'Trousers', 
    price: 39.99,
    description: 'Formal trousers suitable for business attire',
    category: 'Bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Khaki'],
    stockQuantity: 65,
    materials: [
      { name: 'Polyester', quantity: 0.5, unit: 'kg', cost: 7.5 },
      { name: 'Cotton', quantity: 0.3, unit: 'kg', cost: 6.0 }
    ]
  },
  { 
    name: 'Hoodie', 
    price: 29.99,
    description: 'Warm and comfortable hoodie with front pocket',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Black', 'Navy'],
    stockQuantity: 120,
    materials: [
      { name: 'Cotton', quantity: 0.5, unit: 'kg', cost: 10.0 },
      { name: 'Polyester', quantity: 0.2, unit: 'kg', cost: 3.0 }
    ]
  },
  { 
    name: 'Jacket', 
    price: 79.99,
    description: 'Water-resistant outer jacket with inner lining',
    category: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Olive'],
    stockQuantity: 50,
    materials: [
      { name: 'Nylon', quantity: 0.6, unit: 'kg', cost: 15.0 },
      { name: 'Polyester Filling', quantity: 0.3, unit: 'kg', cost: 8.0 },
      { name: 'Metal Zipper', quantity: 1, unit: 'piece', cost: 3.5 }
    ]
  },
  { 
    name: 'Sweater', 
    price: 34.99,
    description: 'Warm knitted sweater for winter',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Red', 'Gray', 'Navy'],
    stockQuantity: 70,
    materials: [
      { name: 'Wool', quantity: 0.4, unit: 'kg', cost: 14.0 },
      { name: 'Acrylic', quantity: 0.3, unit: 'kg', cost: 6.0 }
    ]
  },
  { 
    name: 'Shorts', 
    price: 24.99,
    description: 'Casual summer shorts with elastic waistband',
    category: 'Bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Khaki', 'Blue', 'Black'],
    stockQuantity: 90,
    materials: [
      { name: 'Cotton', quantity: 0.3, unit: 'kg', cost: 6.0 }
    ]
  },
  { 
    name: 'Skirt', 
    price: 29.99,
    description: 'A-line skirt with side zipper',
    category: 'Bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Beige'],
    stockQuantity: 55,
    materials: [
      { name: 'Polyester', quantity: 0.35, unit: 'kg', cost: 5.25 },
      { name: 'Cotton', quantity: 0.15, unit: 'kg', cost: 3.0 }
    ]
  },
  { 
    name: 'Dress', 
    price: 59.99,
    description: 'Elegant evening dress with belt',
    category: 'Full Body',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Red', 'Navy'],
    stockQuantity: 40,
    materials: [
      { name: 'Polyester', quantity: 0.8, unit: 'kg', cost: 12.0 },
      { name: 'Satin', quantity: 0.2, unit: 'kg', cost: 10.0 }
    ]
  },
  { 
    name: 'Socks', 
    price: 9.99,
    description: 'Pack of 3 pairs of comfortable cotton socks',
    category: 'Accessories',
    sizes: ['S', 'M', 'L'],
    colors: ['White', 'Black', 'Gray'],
    stockQuantity: 200,
    materials: [
      { name: 'Cotton', quantity: 0.1, unit: 'kg', cost: 2.0 },
      { name: 'Elastic', quantity: 0.02, unit: 'kg', cost: 0.5 }
    ]
  }
];

// Legacy export for backwards compatibility
export const clothingItems = initialClothingItems.map((item, index) => ({
  id: index + 1,
  name: item.name,
  price: item.price
}));

/**
 * Migrates the static clothing data to the database
 * @returns {Promise<Object>} - The result of the migration
 */
export async function migrateClothingData() {
  try {
    // First check if we already have items in the database
    const existingItemsResponse = await getAllClothingItems();
    
    if (existingItemsResponse?.data?.length > 0) {
      console.log('Data already migrated, skipping...');
      return {
        success: true,
        message: 'Data already exists in database',
        existingCount: existingItemsResponse.data.length
      };
    }
    
    // If no items exist, import the initial data
    const response = await importInitialClothingItems(initialClothingItems);
    console.log('Migration completed:', response);
    return response;
  } catch (error) {
    console.error('Error migrating clothing data:', error);
    throw error;
  }
}
