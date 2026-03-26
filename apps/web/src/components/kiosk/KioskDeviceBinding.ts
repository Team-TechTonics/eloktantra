export const getKioskDeviceId = (): string => {
  if (typeof window === 'undefined') return 'KIOSK-SERVER';
  let deviceId = localStorage.getItem('kiosk_device_id');
  if (!deviceId) {
    deviceId = "KIOSK-" + crypto.randomUUID().toUpperCase();
    localStorage.setItem('kiosk_device_id', deviceId);
  }
  return deviceId;
};
