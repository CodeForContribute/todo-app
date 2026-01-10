// Fetch current public IP address
export async function getCurrentIP() {
  try {
    // Using multiple services for redundancy
    const services = [
      'https://api.ipify.org?format=json',
      'https://api.my-ip.io/v2/ip.json',
    ];

    for (const url of services) {
      try {
        const response = await fetch(url, { timeout: 5000 });
        if (response.ok) {
          const data = await response.json();
          return data.ip;
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch IP:', error);
    return null;
  }
}

// Check if current IP matches any configured office IPs
export function isOfficeNetwork(currentIP, officeConfig) {
  if (!currentIP || !officeConfig?.ips?.length) return false;

  return officeConfig.ips.some(configuredIP => {
    // Exact match
    if (currentIP === configuredIP) return true;

    // CIDR notation support (e.g., 192.168.1.0/24)
    if (configuredIP.includes('/')) {
      return isIPInCIDR(currentIP, configuredIP);
    }

    // Wildcard support (e.g., 192.168.1.*)
    if (configuredIP.includes('*')) {
      const regex = new RegExp('^' + configuredIP.replace(/\./g, '\\.').replace(/\*/g, '\\d+') + '$');
      return regex.test(currentIP);
    }

    return false;
  });
}

// Check if IP is within CIDR range
function isIPInCIDR(ip, cidr) {
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);

  return (ipNum & mask) === (rangeNum & mask);
}

// Convert IP string to number
function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

// Get geolocation (for location-based detection)
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
}

// Calculate distance between two coordinates (Haversine formula)
export function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Check if current location is within office radius
export function isAtOfficeLocation(currentLocation, officeConfig) {
  if (!currentLocation || !officeConfig?.location) return false;

  const distance = getDistanceFromLatLng(
    currentLocation.latitude,
    currentLocation.longitude,
    officeConfig.location.latitude,
    officeConfig.location.longitude
  );

  const radius = officeConfig.location.radius || 100; // Default 100 meters
  return distance <= radius;
}
