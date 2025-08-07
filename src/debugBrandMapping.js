import { getBrandLogo, hasBrandLogo } from './config/brandConfig';

// Test with the actual brand names from the console logs
const testBrandNames = [
  'Puma',
  'Nike', 
  'Lenskart',
  'Giva',
  'Adidas',
  'Ajio',
  'Sudathi',
  'Fastrack eyewear',
  'zandu care',
  'Hyphen',
  'mCaffeine',
  'Mamaearth',
  'Swiggy instamart',
  'The derma co',
  'Minimalist',
  'Airtel',
  'Audible',
  'Aha',
  'Pilgrim',
  'Foxtale',
  'Ottplay',
  'Bus',
  'ixigo',
  'Bewakoof',
  'Ikea',
  'Elver',
  'Dot & key',
  'Myntra',
  'WOW',
  'Nykaa',
  'Abhi bus',
  'Red bus',
  'Salty',
  'Firstcry',
  'Clear trip',
  'wakefit',
  'Leaf',
  'Pepe jeans',
  'Titan',
  'Nat habit',
  'PVR cinemas',
  'Boat',
  'Agoda',
  'Uber',
  'Ola',
  'Rapido',
  'Book my show',
  'Zomato',
  'Make my trip',
  'Daily objects',
  'Jockey',
  'Bombay shaving company',
  'easemytrip',
  'Crocs',
  'Croma',
  'Pantaloons',
  'Birkenstock',
  'Skull candy',
  'PVR inox',
  'Snitch',
  'H & M',
  'Lenovo',
  'Oppo',
  'Hp',
  'Jbl',
  'Dell',
  "Neeman's",
  'Flixbus',
  'Noise',
  'Amazon',
  'Realm',
  'jack&jones',
  'My protein',
  'Mi',
  'Basics',
  'Acer',
  'The man company',
  'Goibibo',
  'Only',
  'Emirates',
  'Assembly',
  'One plus',
  'Smytten',
  'New me',
  'Converse',
  'Libas',
  'Vero moda',
  'Missoma',
  'Farfetched',
  'Jiosaavn',
  'Hotels.com'
];

console.log('🧪 Testing brand mapping with actual brand names from logs...');
console.log('='.repeat(60));

testBrandNames.forEach(brandName => {
  const logo = getBrandLogo(brandName);
  const hasLogo = hasBrandLogo(brandName);
  
  console.log(`Brand: "${brandName}"`);
  console.log(`  Has Logo: ${hasLogo}`);
  console.log(`  Logo Source: ${logo}`);
  console.log(`  Logo Type: ${typeof logo}`);
  console.log('---');
});

console.log('='.repeat(60));
console.log('�� Test completed!'); 