// Centralized Category Configuration
// This file standardizes category mappings across the app

// API Categories - These should match what the backend returns
export const API_CATEGORIES = [
  'Fashion',
  'Beauty & Health',
  'Food & Dining',
  'Travel',
  'Entertainment',
  'Electronics',
  'Appliances',
  'Home & Decor',
  'Computers & Gaming',
  'Mobiles',
  'TV',
  'Sports',
  'Books',
  'Education',
  'Automotive',
  'Pets',
  'Baby & Kids',
  'Office',
  'Business',
  'Finance',
  'Insurance',
  'Real Estate',
  'Services',
];

// Category Icon Mapping
export const getCategoryIcon = categoryName => {
  const iconMap = {
    // Fashion & Apparel
    Fashion: require('../assets/Fashion.jpeg'),
    'Fashion & Apparel': require('../assets/Fashion.jpeg'),
    Clothing: require('../assets/Fashion.jpeg'),
    Accessories: require('../assets/Fashion.jpeg'),

    // Beauty & Health
    'Beauty & Health': require('../assets/Beauty_and_health.jpeg'),
    Beauty: require('../assets/Beauty_and_health.jpeg'),
    Health: require('../assets/Beauty_and_health.jpeg'),
    'Personal Care': require('../assets/Beauty_and_health.jpeg'),
    Skincare: require('../assets/Beauty_and_health.jpeg'),
    Makeup: require('../assets/Beauty_and_health.jpeg'),

    // Food & Dining
    'Food & Dining': require('../assets/food.png'),
    Food: require('../assets/food.png'),
    Restaurants: require('../assets/food.png'),
    Dining: require('../assets/food.png'),
    Beverages: require('../assets/food.png'),

    // Travel
    Travel: require('../assets/Travel.jpeg'),
    'Travel & Tourism': require('../assets/Travel.jpeg'),
    Hotels: require('../assets/Travel.jpeg'),
    Vacation: require('../assets/Travel.jpeg'),

    // Entertainment
    Entertainment: require('../assets/Entertainment.jpeg'),
    Movies: require('../assets/Tv.jpeg'),
    Music: require('../assets/Entertainment.jpeg'),
    Gaming: require('../assets/Computers_laptops_Gaming.jpeg'),
    Events: require('../assets/Entertainment.jpeg'),

    // Electronics - Use a default image since electronics.png doesn't exist
    Electronics: require('../assets/logo.png'),
    Gadgets: require('../assets/logo.png'),
    Smartphones: require('../assets/Mobiles.jpeg'),
    Laptops: require('../assets/Computers_laptops_Gaming.jpeg'),
    Cameras: require('../assets/logo.png'),

    // Appliances
    Appliances: require('../assets/Appliances.jpeg'),
    'Home Appliances': require('../assets/Appliances.jpeg'),
    Kitchen: require('../assets/Appliances.jpeg'),

    // Home & Decor
    'Home & Decor': require('../assets/HomeDecor.jpeg'),
    Home: require('../assets/HomeDecor.jpeg'),
    Decor: require('../assets/HomeDecor.jpeg'),
    Furniture: require('../assets/HomeDecor.jpeg'),

    // Computers & Gaming
    'Computers & Gaming': require('../assets/Computers_laptops_Gaming.jpeg'),
    Computers: require('../assets/Computers_laptops_Gaming.jpeg'),
    Software: require('../assets/Computers_laptops_Gaming.jpeg'),

    // Mobiles
    Mobiles: require('../assets/Mobiles.jpeg'),
    'Mobile Phones': require('../assets/Mobiles.jpeg'),

    // TV
    TV: require('../assets/Tv.jpeg'),
    Television: require('../assets/Tv.jpeg'),
    Streaming: require('../assets/Tv.jpeg'),
    'Audio/Video': require('../assets/Tv.jpeg'),
    'Audio & Video': require('../assets/Tv.jpeg'),
    'Audio Video': require('../assets/Tv.jpeg'),

    // Sports - Use a default image since sports.png doesn't exist
    Sports: require('../assets/logo.png'),
    Fitness: require('../assets/logo.png'),
    Outdoor: require('../assets/logo.png'),
    Exercise: require('../assets/logo.png'),

    // Additional categories - Use default images for missing ones
    Books: require('../assets/logo.png'),
    Education: require('../assets/logo.png'),
    Automotive: require('../assets/logo.png'),
    Pets: require('../assets/HomeDecor.jpeg'),
    'Baby & Kids': require('../assets/HomeDecor.jpeg'),
    Office: require('../assets/logo.png'),
    Business: require('../assets/logo.png'),
    Finance: require('../assets/logo.png'),
    Insurance: require('../assets/logo.png'),
    'Real Estate': require('../assets/HomeDecor.jpeg'),
    Services: require('../assets/logo.png'),
  };

  // Try exact match first
  if (iconMap[categoryName]) {
    return iconMap[categoryName];
  }

  // Try partial match for better coverage
  for (const [key, value] of Object.entries(iconMap)) {
    if (
      categoryName &&
      typeof categoryName === 'string' &&
      key &&
      typeof key === 'string' &&
      (categoryName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(categoryName.toLowerCase()))
    ) {
      return value;
    }
  }

  // Return default icon if no match found
  return require('../assets/logo.png');
};

// Category grouping for display purposes
export const CATEGORY_GROUPS = {
  'Fashion & Style': ['Fashion', 'Beauty & Health', 'Accessories'],
  'Food & Dining': ['Food & Dining', 'Restaurants', 'Beverages'],
  'Travel & Entertainment': ['Travel', 'Entertainment', 'Movies', 'Music'],
  Technology: ['Electronics', 'Computers & Gaming', 'Mobiles', 'TV'],
  'Home & Lifestyle': ['Home & Decor', 'Appliances', 'Sports', 'Pets'],
  'Business & Services': ['Business', 'Finance', 'Education', 'Services'],
};

// Get category display name
export const getCategoryDisplayName = categoryName => {
  // Return the category name as is, but you can add custom display names here
  return categoryName || 'Uncategorized';
};

// Validate if a category exists in our supported list
export const isValidCategory = categoryName => {
  return API_CATEGORIES.includes(categoryName);
};

// Get all categories for dropdown/selection
export const getAllCategories = () => {
  return API_CATEGORIES.map(category => ({
    name: category,
    displayName: getCategoryDisplayName(category),
    icon: getCategoryIcon(category),
  }));
};
