import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DigiDocument {
  id: string;
  name: string;
  type: 'Aadhaar' | 'Voter ID' | 'PAN' | 'Other';
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
}

export interface User {
  id: string;
  name: string;
  aadhaarNumber: string;
  mobileNumber: string;
  documents: DigiDocument[];
}

interface DigiLockerState {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  login: (aadhaar: string, name?: string) => void;
  logout: () => void;
  addDocument: (doc: DigiDocument) => void;
  removeDocument: (id: string) => void;
  setVerified: (status: boolean) => void;
}

export const useDigiLockerStore = create<DigiLockerState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isVerified: false,
      login: (aadhaar: string, name: string = 'Ramanuj') => 
        set({ 
          user: { 
            id: 'u-123', 
            name: name, 
            aadhaarNumber: aadhaar,
            mobileNumber: '9123456780',
            documents: [
              { 
                id: 'd-1', 
                name: `${name} Aadhaar Card`, 
                type: 'Aadhaar', 
                fileUrl: '#', 
                uploadedAt: new Date().toISOString(), 
                verified: true 
              }
            ] 
          }, 
          isAuthenticated: true 
        }),
      logout: () => set({ user: null, isAuthenticated: false, isVerified: false }),
      addDocument: (doc) => set((state) => ({
        user: state.user ? { ...state.user, documents: [...state.user.documents, doc] } : null
      })),
      removeDocument: (id) => set((state) => ({
        user: state.user ? { ...state.user, documents: state.user.documents.filter(d => d.id !== id) } : null
      })),
      setVerified: (status) => set({ isVerified: status }),
    }),
    { name: 'digilocker-app-storage' }
  )
);
