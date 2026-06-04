import { create } from 'zustand'

interface UIState {
  isLocked: boolean
  setLocked: (locked: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLocked: true, // Will be initialized by the shell based on privacy settings
  setLocked: (locked) => set({ isLocked: locked }),
}))
