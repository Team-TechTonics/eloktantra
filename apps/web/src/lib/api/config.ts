/**
 * Centralized API Configuration
 * Prevents recursive loopbacks and ensures direct-to-backend routing for proxies.
 */

export const getBackendUrl = () => {
  // Priority 1: Dedicated backend variable
  // Priority 2: Generic API URL
  // Priority 3: Hardcoded Render fallback
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
              process.env.NEXT_PUBLIC_API_URL || 
              'https://backend-elokantra.onrender.com';
  
  // Safety Check: If the URL points to the local frontend (loopback:3000), 
  // we MUST force it to a backend to prevent infinite recursion.
  // BUT we should allow local backends on other ports (e.g. 5001).
  if (url.includes('localhost:3000')) {
    console.warn('API CONFIG: Loopback port 3000 detected. Rerouting to Render for safety.');
    return 'https://backend-elokantra.onrender.com';
  }
  
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.info(`API CONFIG: Valid local backend detected at ${url}`);
  }
  
  return url;
};

export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024';
