import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // User State
  userId: string | null
  isAdmin: boolean
  guestId: string | null

  // View Mode
  viewMode: 'fullscreen' | 'manage'
  setViewMode: (mode: 'fullscreen' | 'manage') => void

  // User Actions
  setUser: (id: string | null, isAdmin: boolean) => void
  logout: () => void

  // Settings
  enableNSFW: boolean
  autoTimer: number // 0 = manual, 5/10/15/30 = seconds
  defaultSoundMuted: boolean

  // Update Settings
  updateSettings: (settings: Partial<Omit<AppState, 'setViewMode' | 'setUser' | 'logout' | 'updateSettings'>>) => void

  // Playback State
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void

  // Modal States
  loginModalOpen: boolean
  signupModalOpen: boolean
  uploadModalOpen: boolean
  shareModalOpen: boolean
  settingsModalOpen: boolean

  setLoginModalOpen: (open: boolean) => void
  setSignupModalOpen: (open: boolean) => void
  setUploadModalOpen: (open: boolean) => void
  setShareModalOpen: (open: boolean) => void
  setSettingsModalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User State
      userId: null,
      isAdmin: false,
      guestId: null,

      // View Mode
      viewMode: 'fullscreen',
      setViewMode: (mode) => set({ viewMode: mode }),

      // User Actions
      setUser: (id, isAdmin) => set({ userId: id, isAdmin: isAdmin || false }),
      logout: () => set({ userId: null, isAdmin: false }),

      // Settings
      enableNSFW: false,
      autoTimer: 10,
      defaultSoundMuted: true,

      // Update Settings
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

      // Playback State
      isPlaying: true,
      setIsPlaying: (playing) => set({ isPlaying: playing }),

      // Modal States
      loginModalOpen: false,
      signupModalOpen: false,
      uploadModalOpen: false,
      shareModalOpen: false,
      settingsModalOpen: false,

      setLoginModalOpen: (open) => set({ loginModalOpen: open }),
      setSignupModalOpen: (open) => set({ signupModalOpen: open }),
      setUploadModalOpen: (open) => set({ uploadModalOpen: open }),
      setShareModalOpen: (open) => set({ shareModalOpen: open }),
      setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
    }),
    {
      name: 'app-storage',
      skipHydration: false,
    }
  )
)
