// Centralized brand configuration for the Qupon app
// This file contains all brand-to-image mappings and related utilities

export const BRAND_LOGOS = {
  // E-commerce & Shopping
  Amazon: require('../assets/Amazon.png'),
  Flipkart: require('../assets/flipkart.png'),
  Myntra: require('../assets/myntra.jpeg'),
  Ajio: require('../assets/Ajio.png'),
  Nykaa: require('../assets/Nykaa.jpeg'),
  Bewakoof: require('../assets/Bewakoof.png'),
  Snitch: require('../assets/Snitch.png'),
  Only: require('../assets/Only.png'),
  Libas: require('../assets/Libas.png'),
  'Jack & Jones': require('../assets/jackjones.png'),
  'Jack & jones': require('../assets/jackjones.png'),
  'jack & jones': require('../assets/jackjones.png'),
  'Jack and Jones': require('../assets/jackjones.png'),
  'jack&jones': require('../assets/jackjones.png'),
  'Vero Moda': require('../assets/Vero_moda.png'),
  'Vero moda': require('../assets/Vero_moda.png'),
  'vero moda': require('../assets/Vero_moda.png'),
  'Pepe Jeans': require('../assets/Pepe_jeans.png'),
  'Pepe jeans': require('../assets/Pepe_jeans.png'),
  'pepe jeans': require('../assets/Pepe_jeans.png'),
  'Daily Objects': require('../assets/Daily_objects.png'),
  'Daily objects': require('../assets/Daily_objects.png'),
  'daily objects': require('../assets/Daily_objects.png'),
  'H & M': require('../assets/H_M.png'),
  'H & m': require('../assets/H_M.png'),
  'h & m': require('../assets/H_M.png'),
  'H and M': require('../assets/H_M.png'),
  'One Plus': require('../assets/One_plus.png'),
  'One plus': require('../assets/One_plus.png'),
  'one plus': require('../assets/One_plus.png'),
  OnePlus: require('../assets/One_plus.png'),
  'Skull Candy': require('../assets/Skull_candy.png'),
  'Skull candy': require('../assets/Skull_candy.png'),
  'skull candy': require('../assets/Skull_candy.png'),
  SkullCandy: require('../assets/Skull_candy.png'),
  // Additional brands found in logs
  Pantaloons: require('../assets/Pantaloons.png'),
  Basics: require('../assets/Basics.png'),
  Farfetched: require('../assets/Frafetched.png'), // Note: API sends 'Farfetched' but image is 'Frafetched'

  // Food & Dining
  Swiggy: require('../assets/Swiggy_instamart.png'),
  Zomato: require('../assets/Zomato.png'),
  'Swiggy Instamart': require('../assets/Swiggy_instamart.png'),
  'Swiggy instamart': require('../assets/Swiggy_instamart.png'),
  'swiggy instamart': require('../assets/Swiggy_instamart.png'),

  // Travel & Tourism
  'Make My Trip': require('../assets/Make_my_trip.png'),
  'Make my trip': require('../assets/Make_my_trip.png'),
  'make my trip': require('../assets/Make_my_trip.png'),
  MakeMyTrip: require('../assets/Make_my_trip.png'),
  makemytrip: require('../assets/Make_my_trip.png'),
  Goibibo: require('../assets/Goibibo.png'),
  'Clear Trip': require('../assets/Clear_trip.png'),
  'Clear trip': require('../assets/Clear_trip.png'),
  'clear trip': require('../assets/Clear_trip.png'),
  ClearTrip: require('../assets/Clear_trip.png'),
  cleartrip: require('../assets/Clear_trip.png'),
  EaseMyTrip: require('../assets/easemytrip.jpeg'),
  'Ease My Trip': require('../assets/easemytrip.jpeg'),
  'ease my trip': require('../assets/easemytrip.jpeg'),
  Agoda: require('../assets/Agoda.png'),
  'Hotels.com': require('../assets/Hotels_com.png'),
  'hotels.com': require('../assets/Hotels_com.png'),
  HotelsCom: require('../assets/Hotels_com.png'),
  Emirates: require('../assets/Emirates.png'),
  Ixigo: require('../assets/ixigo.png'),
  'Red Bus': require('../assets/Red_bus.jpeg'),
  'Red bus': require('../assets/Red_bus.jpeg'),
  'red bus': require('../assets/Red_bus.jpeg'),
  RedBus: require('../assets/Red_bus.jpeg'),
  redbus: require('../assets/Red_bus.jpeg'),
  'Abhi Bus': require('../assets/Abhi_bus.png'),
  'Abhi bus': require('../assets/Abhi_bus.png'),
  'abhi bus': require('../assets/Abhi_bus.png'),
  AbhiBus: require('../assets/Abhi_bus.png'),
  abhibus: require('../assets/Abhi_bus.png'),
  Flixbus: require('../assets/Flixbus.jpeg'),
  'Flix Bus': require('../assets/Flixbus.jpeg'),
  'flix bus': require('../assets/Flixbus.jpeg'),

  // Entertainment
  'Book My Show': require('../assets/Book_my_show.jpeg'),
  'Book my show': require('../assets/Book_my_show.jpeg'),
  'book my show': require('../assets/Book_my_show.jpeg'),
  BookMyShow: require('../assets/Book_my_show.jpeg'),
  bookmyshow: require('../assets/Book_my_show.jpeg'),
  PVR: require('../assets/PVR_cinemas.jpeg'),
  'PVR Cinemas': require('../assets/PVR_cinemas.jpeg'),
  'pvr cinemas': require('../assets/PVR_cinemas.jpeg'),
  'PVR Inox': require('../assets/PVR_inox.jpeg'),
  'PVR inox': require('../assets/PVR_inox.jpeg'),
  'pvr inox': require('../assets/PVR_inox.jpeg'),
  PVRInox: require('../assets/PVR_inox.jpeg'),
  pvrinox: require('../assets/PVR_inox.jpeg'),
  Audible: require('../assets/Audible.png'),
  JioSaavn: require('../assets/Jiosaavn.png'),
  'Jio Saavn': require('../assets/Jiosaavn.png'),
  'jio saavn': require('../assets/Jiosaavn.png'),
  OTTplay: require('../assets/Ottplay.jpeg'),
  'OTT Play': require('../assets/Ottplay.jpeg'),
  'ott play': require('../assets/Ottplay.jpeg'),
  Aha: require('../assets/Aha.jpeg'),

  // Sports & Fashion
  Nike: require('../assets/Nike.png'),
  Adidas: require('../assets/Adidas.png'),
  Puma: require('../assets/Puma.png'),
  Converse: require('../assets/Converse.png'),
  Crocs: require('../assets/Crocs.png'),
  Birkenstock: require('../assets/Birkenstock.png'),

  // Electronics & Tech
  Croma: require('../assets/Croma.png'),
  Dell: require('../assets/Dell.png'),
  HP: require('../assets/Hp.png'),
  Hp: require('../assets/Hp.png'),
  hp: require('../assets/Hp.png'),
  Lenovo: require('../assets/Lenovo.png'),
  Acer: require('../assets/Acer.png'),
  Mi: require('../assets/Mi.png'),
  MI: require('../assets/Mi.png'),
  mi: require('../assets/Mi.png'),
  Oppo: require('../assets/Oppo.png'),
  Noise: require('../assets/Noise.png'),
  Boat: require('../assets/Boat.png'),
  JBL: require('../assets/Jbl.png'),
  Jbl: require('../assets/Jbl.png'),
  jbl: require('../assets/Jbl.png'),

  // Watches & Accessories
  Titan: require('../assets/Titan.png'),
  'Fastrack Eyewear': require('../assets/Fastrack_eyewear.jpeg'),
  'Fastrack eyewear': require('../assets/Fastrack_eyewear.jpeg'),
  Fastrack: require('../assets/Fastrack_eyewear.jpeg'),
  Lenskart: require('../assets/Lenskart.png'),
  Jockey: require('../assets/Jockey.png'),

  // Home & Furniture
  Wakefit: require('../assets/wakefit.png'),
  IKEA: require('../assets/Ikea.png'),
  Assembly: require('../assets/Assembly.png'),
  Leaf: require('../assets/Leaf.png'),
  Sudathi: require('../assets/Sudathi.png'),

  // Kids & Baby
  FirstCry: require('../assets/Firstcry.png'),

  // Beauty & Personal Care
  Mamaearth: require('../assets/Mamaearth.jpeg'),
  'Dot & Key': require('../assets/Dot_key.jpeg'),
  'Dot & key': require('../assets/Dot_key.jpeg'),
  'dot & key': require('../assets/Dot_key.jpeg'),
  'Dot and Key': require('../assets/Dot_key.jpeg'),
  dotandkey: require('../assets/Dot_key.jpeg'),
  'The Derma Co': require('../assets/The_derma_co.png'),
  'The derma co': require('../assets/The_derma_co.png'),
  'the derma co': require('../assets/The_derma_co.png'),
  TheDermaCo: require('../assets/The_derma_co.png'),
  thedermaco: require('../assets/The_derma_co.png'),
  Minimalist: require('../assets/Minimalist.png'),
  'The Man Company': require('../assets/The_man_company.png'),
  'The man company': require('../assets/The_man_company.png'),
  'the man company': require('../assets/The_man_company.png'),
  TheManCompany: require('../assets/The_man_company.png'),
  themancompany: require('../assets/The_man_company.png'),
  'Bombay Shaving Company': require('../assets/Bombay_shaving_company.png'),
  'Bombay shaving company': require('../assets/Bombay_shaving_company.png'),
  'bombay shaving company': require('../assets/Bombay_shaving_company.png'),
  BombayShavingCompany: require('../assets/Bombay_shaving_company.png'),
  bombayshavingcompany: require('../assets/Bombay_shaving_company.png'),
  Giva: require('../assets/Giva.png'),
  "Neeman's": require('../assets/Neemans.png'),
  Neemans: require('../assets/Neemans.png'),
  neemans: require('../assets/Neemans.png'),
  Realm: require('../assets/Realm.png'),
  'New Me': require('../assets/New_me.png'),
  'New me': require('../assets/New_me.png'),
  'new me': require('../assets/New_me.png'),
  NewMe: require('../assets/New_me.png'),
  newme: require('../assets/New_me.png'),
  Salty: require('../assets/Salty.jpeg'),
  'Nat Habit': require('../assets/Nat_habit.jpeg'),
  'Nat habit': require('../assets/Nat_habit.jpeg'),
  'nat habit': require('../assets/Nat_habit.jpeg'),
  NatHabit: require('../assets/Nat_habit.jpeg'),
  nathabit: require('../assets/Nat_habit.jpeg'),
  'Zandu Care': require('../assets/zandu_care.jpeg'),
  'Zandu care': require('../assets/zandu_care.jpeg'),
  'zandu care': require('../assets/zandu_care.jpeg'),
  ZanduCare: require('../assets/zandu_care.jpeg'),
  zanducare: require('../assets/zandu_care.jpeg'),
  Foxtale: require('../assets/Foxtale.jpeg'),
  Missoma: require('../assets/Missoma.jpeg'),
  Pilgrim: require('../assets/Pilgrim.png'),
  mCaffeine: require('../assets/mCaffeine.png'),
  'm Caffeine': require('../assets/mCaffeine.png'),
  'm caffeine': require('../assets/mCaffeine.png'),
  Hyphen: require('../assets/Hyphen.jpeg'),
  'My Protein': require('../assets/My_protein.jpeg'),
  'My protein': require('../assets/My_protein.jpeg'),
  'my protein': require('../assets/My_protein.jpeg'),
  MyProtein: require('../assets/My_protein.jpeg'),
  myprotein: require('../assets/My_protein.jpeg'),
  WOW: require('../assets/WOW.png'),
  Frafetched: require('../assets/Frafetched.png'),
  Elver: require('../assets/Elver.png'),
  Smytten: require('../assets/Smytten.png'),

  // Transportation
  Ola: require('../assets/Ola.png'),
  Uber: require('../assets/Uber.png'),
  Rapido: require('../assets/Rapido.png'),

  // Telecom
  Airtel: require('../assets/Airtel.png'),
};

// Default fallback logo
const DEFAULT_LOGO = require('../assets/logo.png');

/**
 * Get the brand logo image for a given brand name
 * @param {string} brandName - The name of the brand
 * @returns {any} - The require() statement for the brand logo image
 */
export const getBrandLogo = brandName => {
  // Handle null/undefined brand names
  if (!brandName || typeof brandName !== 'string') {
    console.log('⚠️ Invalid brand name:', brandName);
    return DEFAULT_LOGO;
  }

  // Normalize the brand name (trim whitespace, handle common variations)
  const normalizedBrandName = brandName.trim();

  // Try exact match first
  if (BRAND_LOGOS[normalizedBrandName]) {
    return BRAND_LOGOS[normalizedBrandName];
  }

  // Try case-insensitive exact match
  const exactMatch = Object.keys(BRAND_LOGOS).find(
    key => key.toLowerCase() === normalizedBrandName.toLowerCase(),
  );
  if (exactMatch) {
    return BRAND_LOGOS[exactMatch];
  }

  // Try normalized matching (remove extra spaces, handle common variations)
  const normalizedInput = normalizedBrandName
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  for (const [key, value] of Object.entries(BRAND_LOGOS)) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, ' ').trim();

    // Try exact normalized match
    if (normalizedInput === normalizedKey) {
      return value;
    }

    // Try partial match (brand name contains the key or vice versa)
    if (
      normalizedInput.includes(normalizedKey) ||
      normalizedKey.includes(normalizedInput)
    ) {
      console.log(
        '✅ Found partial match for brand:',
        normalizedBrandName,
        '->',
        key,
      );
      return value;
    }
  }

  // Try fuzzy matching for common brand name variations
  const fuzzyMatches = {
    // Fastrack variations
    fastrack: 'Fastrack Eyewear',
    'fastrack eyewear': 'Fastrack Eyewear',
    fastrackeyewear: 'Fastrack Eyewear',

    // Travel variations
    'make my trip': 'Make My Trip',
    makemytrip: 'Make My Trip',
    'clear trip': 'Clear Trip',
    cleartrip: 'Clear Trip',
    'ease my trip': 'EaseMyTrip',
    easemytrip: 'EaseMyTrip',
    'red bus': 'Red Bus',
    redbus: 'Red Bus',
    'abhi bus': 'Abhi Bus',
    abhibus: 'Abhi Bus',
    'flix bus': 'Flixbus',
    flixbus: 'Flixbus',

    // Entertainment variations
    'book my show': 'Book My Show',
    bookmyshow: 'Book My Show',
    'pvr inox': 'PVR Inox',
    pvrinox: 'PVR Inox',
    'pvr cinemas': 'PVR',
    pvrcinemas: 'PVR',
    'jio saavn': 'JioSaavn',
    jiosaavn: 'JioSaavn',
    'ott play': 'OTTplay',
    ottplay: 'OTTplay',

    // Beauty & Personal Care variations
    'dot & key': 'Dot & Key',
    dotandkey: 'Dot & Key',
    'the derma co': 'The Derma Co',
    thedermaco: 'The Derma Co',
    'bombay shaving company': 'Bombay Shaving Company',
    bombayshavingcompany: 'Bombay Shaving Company',
    'the man company': 'The Man Company',
    themancompany: 'The Man Company',
    'new me': 'New Me',
    newme: 'New Me',
    'nat habit': 'Nat Habit',
    nathabit: 'Nat Habit',
    'zandu care': 'Zandu Care',
    zanducare: 'Zandu Care',
    'my protein': 'My Protein',
    myprotein: 'My Protein',
    'm caffeine': 'mCaffeine',
    mcaffeine: 'mCaffeine',

    // Fashion variations
    'jack & jones': 'Jack & Jones',
    jackandjones: 'Jack & Jones',
    'vero moda': 'Vero Moda',
    veromoda: 'Vero Moda',
    'pepe jeans': 'Pepe Jeans',
    pepejeans: 'Pepe Jeans',
    'daily objects': 'Daily Objects',
    dailyobjects: 'Daily Objects',
    'skull candy': 'Skull Candy',
    skullcandy: 'Skull Candy',
    'one plus': 'One Plus',
    oneplus: 'One Plus',
    'h & m': 'H & M',
    handm: 'H & M',

    // Food variations
    'swiggy instamart': 'Swiggy Instamart',
    swiggyinstamart: 'Swiggy Instamart',

    // Hotels variations
    'hotels.com': 'Hotels.com',
    hotelscom: 'Hotels.com',

    // Neeman's variations
    neemans: "Neeman's",
    "neeman's": "Neeman's",

    // Additional missing brands
    'jack&jones': 'Jack & Jones',
    pantaloons: 'Pantaloons',
    basics: 'Basics',
    farfetched: 'Farfetched',
  };

  const fuzzyMatch = fuzzyMatches[normalizedInput];
  if (fuzzyMatch && BRAND_LOGOS[fuzzyMatch]) {
    return BRAND_LOGOS[fuzzyMatch];
  }

  // No match found, return default logo
  return DEFAULT_LOGO;
};

/**
 * Get all available brand names
 * @returns {string[]} - Array of all brand names
 */
export const getAllBrandNames = () => {
  return Object.keys(BRAND_LOGOS);
};

/**
 * Check if a brand exists in our mapping
 * @param {string} brandName - The name of the brand to check
 * @returns {boolean} - True if brand exists, false otherwise
 */
export const hasBrandLogo = brandName => {
  if (!brandName || typeof brandName !== 'string') {
    return false;
  }

  // Check exact match
  if (BRAND_LOGOS[brandName]) {
    return true;
  }

  // Check case-insensitive match
  const exactMatch = Object.keys(BRAND_LOGOS).find(
    key => key.toLowerCase() === brandName.toLowerCase(),
  );
  if (exactMatch) {
    return true;
  }

  // Check partial match
  return Object.keys(BRAND_LOGOS).some(
    key =>
      brandName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(brandName.toLowerCase()),
  );
};
