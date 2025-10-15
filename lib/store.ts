import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  setUserId: (id: string) => void;
  clearUserId: () => void;
}

// 사용자 ID를 로컬 스토리지에 저장하는 스토어
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      setUserId: (id: string) => set({ userId: id }),
      clearUserId: () => set({ userId: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);

