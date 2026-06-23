// Location & geolocation utilities

export const SOUTH_INDIAN_STATES = ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana'];
export const SOUTH_INDIAN_CITIES = ['Chennai', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Kochi', 'Coimbatore', 'Madurai', 'Vijayawada', 'Visakhapatnam', 'Mysore', 'Trivandrum', 'Thiruvananthapuram', 'Mangalore', 'Tiruppur'];

// Get user's location via IP-based geolocation
export async function getUserLocation() {
  // Check cache first
  const cached = localStorage.getItem('sn_location');
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('Location fetch failed');
    const data = await res.json();
    const location = {
      city: data.city || 'Unknown',
      region: data.region || '',
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'IN',
      timezone: data.timezone || 'Asia/Kolkata',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };
    localStorage.setItem('sn_location', JSON.stringify(location));
    return location;
  } catch {
    // Fallback location
    const fallback = {
      city: 'Chennai',
      region: 'Tamil Nadu',
      country: 'India',
      countryCode: 'IN',
      timezone: 'Asia/Kolkata',
      latitude: 13.08,
      longitude: 80.27,
    };
    localStorage.setItem('sn_location', JSON.stringify(fallback));
    return fallback;
  }
}

// Check if user is from South India
export function isSouthIndian(location) {
  if (!location) return false;
  const region = (location.region || '').trim();
  const city = (location.city || '').trim();

  return (
    SOUTH_INDIAN_STATES.some(s => region.toLowerCase().includes(s.toLowerCase())) ||
    SOUTH_INDIAN_CITIES.some(c => city.toLowerCase().includes(c.toLowerCase()))
  );
}

// Determine auth method based on location
export function getAuthMethod(location) {
  if (isSouthIndian(location)) {
    return { method: 'email', label: 'Email OTP', description: 'South Indian users authenticate via Email OTP for enhanced security.' };
  }
  return { method: 'mobile', label: 'Mobile OTP', description: 'Mobile OTP verification for secure and quick access.' };
}

// Determine theme based on time and location
export function getAutoTheme(timezone) {
  try {
    const now = new Date();
    const localTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone || 'UTC',
    }).format(now);
    const hour = parseInt(localTime, 10);

    // Light theme between 7 AM and 6 PM
    if (hour >= 7 && hour < 18) return 'light';
    return 'dark';
  } catch {
    return 'dark';
  }
}

// Format duration in seconds to mm:ss
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Generate invoice ID
export function generateInvoiceId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SN-${ts}-${rand}`;
}

// Format currency
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}
