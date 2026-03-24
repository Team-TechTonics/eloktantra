import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DigiDocument {
  id: string;
  name: string;
  type: 'Aadhaar' | 'Voter ID' | 'PAN' | 'Other';
  uploadedAt: string;
  verified: boolean;
  fileUrl?: string; // Add fileUrl
}

export interface User {
  id: string;
  name: string;
  aadhaarNumber: string;
  mobileNumber: string;
  address: string;
  constituencyId: string;
  faceEmbedding: string;
  documents: DigiDocument[];
}

interface DigiLockerState {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  login: (user: User) => void;
  logout: () => void;
  setVerified: (status: boolean) => void;
  addDocument: (doc: DigiDocument) => void;
  removeDocument: (id: string) => void;
}

export const useDigiLockerStore = create<DigiLockerState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isVerified: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, isVerified: false }),
      setVerified: (status) => set({ isVerified: status }),
      addDocument: (doc: DigiDocument) => set((state) => ({
        user: state.user ? { ...state.user, documents: [...state.user.documents, doc] } : null
      })),
      removeDocument: (id: string) => set((state) => ({
        user: state.user ? { ...state.user, documents: state.user.documents.filter(d => d.id !== id) } : null
      })),
    }),
    { name: 'digilocker-app-storage' }
  )
);
