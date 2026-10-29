import { create } from 'zustand';

type Draft = {
  username: string;
  email: string;
  password: string;
  avatarUri: string | null;
};

type RegisterStore = Draft & {
  setDraft: (patch: Partial<Draft>) => void; // update any field(s)
  reset: () => void;                         // clear after signup
};

const empty: Draft = { username: '', email: '', password: '', avatarUri: null };

export const useRegisterStore = create<RegisterStore>((set) => ({
  ...empty,
  setDraft: (patch) => set(patch),
  reset: () => set(empty),
}));