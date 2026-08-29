import { create } from 'zustand';

type User = {
  id: string;
  email: string;
  username: string;
};

type Conversation = {
  id: string;
  username: string;
  last_message?: string;
  created_at: string;
};

type Store = {
  user: User | null;
  conversations: Conversation[];
  setUser: (user: User | null) => void; // ye ek  function hai // void means return nothing 
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
};


//zustand store create hoga ab
// create <store> ye refer kar rahai hai jo just uper type store banaya hai usko 
export const useStore = create<Store>((set) => ({
  user: null,
  conversations: [],
  setUser: (user) => set({ user }),
  setConversations: (conversations) => set({ conversations }),    // fetching conversations
  addConversation: (conversation) =>   // existing conversation mai aag new message karu ga to vo add ho jayga
    set((state) => ({
      conversations: [conversation, ...state.conversations],    // ... ka matlab get all converstion till now 
    })),
}));

// zustand store kar raha ha user , conversation

//conversation -> iska ek arr[] aaya with created times ,ek arr[] main multiple object honge dono side ke