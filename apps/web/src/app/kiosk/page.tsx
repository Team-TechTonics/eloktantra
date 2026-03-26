import KioskContainer from './KioskContainer';

export const metadata = {
  title: 'Hardware Kiosk Voting Terminal | eLoktantra',
  description: 'Secure, offline-first hardware kiosk interface for voting',
};

export default function KioskPage() {
  return (
    <main className="fixed inset-0 z-[99999] bg-gray-100 overflow-y-auto w-full h-full no-scrollbar select-none" style={{ touchAction: 'pan-y' }}>
      <KioskContainer />
    </main>
  );
}
