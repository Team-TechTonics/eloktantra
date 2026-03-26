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
  
  // Dev note: loopback check removed for local debugging on 5001. 
  return url;
};

export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024';
