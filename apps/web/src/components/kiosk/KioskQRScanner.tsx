import React, { useEffect, useState } from 'react';

export default function KioskQRScanner({ onScan }: { onScan: (text: string) => void }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    let scanner: any;
    
    const initScanner = async () => {
      try {
        // @ts-ignore - dynamic import handled safely 
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scanner = new Html5QrcodeScanner(
           "kiosk-qr-reader", 
           { fps: 10, qrbox: {width: 250, height: 250}, aspectRatio: 1.0 }, 
           false
        );
        scanner.render(
          (decodedText: string) => {
            scanner.clear();
            onScan(decodedText);
          },
          (errorMessage: string) => {
            // Continuous scanning errors can be ignored
          }
        );
      } catch (err) {
        console.warn('html5-qrcode not found or camera unavailable', err);
        setError(true);
      }
    };
    
    initScanner();

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {}
      }
    };
  }, [onScan]);

  if (error) {
    return (
      <div className="p-6 bg-orange-50 text-orange-800 rounded-xl my-8 text-xl font-bold border-2 border-orange-200 text-center uppercase tracking-widest shadow-inner">
        📷 Camera Scanning Unavailable<br/><span className="text-sm mt-2 block text-orange-600">Please proceed with manual entry below.</span>
      </div>
    );
  }

  return (
     <div className="mb-10 p-2 bg-gray-50 rounded-2xl border-4 border-dashed border-gray-300">
        <div id="kiosk-qr-reader" className="w-full mx-auto overflow-hidden rounded-xl bg-black min-h-[300px]"></div>
     </div>
  );
}
