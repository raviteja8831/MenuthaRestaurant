const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://13.127.228.119:8090/api';
const GOOGLE_MAPS_API_KEY = 'AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ';
const RESTAURANT_ID = 48;

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON: ' + data.substring(0, 100)));
        }
      });
    }).on('error', reject);
  });
}

async function geocodeAddress(address) {
  if (!address) {
    console.log('❌ No address provided');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    console.log(`🌍 Geocoding address: "${address}"`);

    const json = await httpGet(url);

    if (json.status === 'OK' && json.results.length > 0) {
      const location = json.results[0].geometry.location;
      console.log('✅ Successfully geocoded!');
      console.log(`   Latitude: ${location.lat}`);
      console.log(`   Longitude: ${location.lng}`);
      return { lat: location.lat, lng: location.lng };
    } else {
      console.log(`❌ Geocoding failed: ${json.status}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during geocoding:', error.message);
    return null;
  }
}

async function fetchRestaurants() {
  try {
    console.log('📡 Fetching restaurants from API...\n');
    const data = await httpGet(`${API_BASE_URL}/restaurants`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching restaurants:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting geocoding process for Restaurant ID', RESTAURANT_ID);
  console.log('='.repeat(60), '\n');

  // Fetch all restaurants
  let restaurantsData = await fetchRestaurants();

  if (!restaurantsData) {
    console.log('❌ Could not fetch restaurants. Exiting.');
    return;
  }

  console.log('📊 Response type:', typeof restaurantsData);
  console.log('📊 Is array?:', Array.isArray(restaurantsData));

  // Handle different response formats
  let restaurants = restaurantsData;
  if (restaurantsData.success !== undefined) {
    // Response might be { success: true, data: [...] }
    restaurants = restaurantsData.data || restaurantsData.restaurants || [];
  }

  if (!Array.isArray(restaurants)) {
    console.log('❌ Unexpected response format:', JSON.stringify(restaurantsData).substring(0, 200));
    return;
  }

  // Find restaurant 48
  const restaurant = restaurants.find(r => r.id === RESTAURANT_ID);

  if (!restaurant) {
    console.log(`❌ Restaurant with ID ${RESTAURANT_ID} not found.`);
    console.log(`   Available restaurant IDs: ${restaurants.map(r => r.id).slice(0, 10).join(', ')}...`);
    return;
  }

  console.log('✅ Found restaurant:');
  console.log(`   ID: ${restaurant.id}`);
  console.log(`   Name: ${restaurant.name}`);
  console.log(`   Address: ${restaurant.address}`);
  console.log(`   Current lat: ${restaurant.lat}`);
  console.log(`   Current lng: ${restaurant.lng}\n`);

  // Geocode the address
  const coords = await geocodeAddress(restaurant.address);

  if (coords) {
    console.log('\n' + '='.repeat(60));
    console.log('📍 COORDINATES TO UPDATE IN DATABASE:');
    console.log('='.repeat(60));
    console.log(`Restaurant ID: ${RESTAURANT_ID}`);
    console.log(`lat: ${coords.lat}`);
    console.log(`lng: ${coords.lng}`);
    console.log('='.repeat(60));
    console.log('\nℹ️  You can update these coordinates in your database.');
  }
}

main().catch(console.error);
