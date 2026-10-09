# ChatApp 💬

A real-time mobile chat application built with React Native (Expo) and Supabase, with a Telegram-style UI.

---

## Features

- 🔐 Email/Password authentication
- 💬 Real-time messaging via Supabase WebSockets
- 👥 One-on-one conversations
- 🔍 Search users to start a chat
- 🎨 Telegram-style chat list and message bubbles
- 📱 Android (APK build available), iOS not tested yet
- 🗄️ Persistent message storage with Supabase

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native (Expo) |
| Navigation | Expo Router (Stack + Tabs) |
| Backend | Supabase (Auth + Postgres + Realtime) |
| State Management | Zustand |
| Styling | NativeWind (Tailwind CSS) |
| Language | TypeScript |
| Build | EAS (Expo Application Services) |

---

## Project Structure

```
chatApp/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx       # Auth stack layout
│   │   ├── login.tsx         # Login screen
│   │   └── register.tsx      # Register screen
│   ├── (drawer)/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx   # Tab layout
│   │   │   ├── index.tsx     # Chats list screen
│   │   │   └── two.tsx       # Settings screen
│   │   └── _layout.tsx       # Wrapper layout for the tabs
│   ├── chat/
│   │   └── [id].tsx          # Individual chat screen
│   ├── users.tsx             # User search screen
│   └── _layout.tsx           # Root layout with auth redirect
├── components/               # Reusable components
├── database/
│   └── schema.sql            # Tables, RPC functions, RLS policies
├── store/
│   └── store.ts              # Zustand store
├── utils/
│   └── supabase.ts           # Supabase client
└── global.css                # NativeWind global styles
```

---

## Database Schema

```sql
-- User profiles (auto-created on signup via trigger)
profiles (id, username, email, created_at)

-- Conversations between users
conversations (id, created_at)

-- Members of each conversation
conversation_members (id, conversation_id, user_id, joined_at)

-- Messages in each conversation
messages (id, conversation_id, sender_id, content, created_at)
```

**RPC functions used by the app:**

- `get_my_conversations()` returns the current user's chats with the last message
- `get_conversation_partner(conv_id)` returns the other user in a chat

**Row Level Security** is enabled on all tables, so users can only read conversations and messages they belong to.

---

## Getting Started

### Prerequisites

- Node.js (use the minimum version your Expo SDK requires, see the Expo docs)
- A Supabase account
- An Android phone or emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/ARYAN0529/react-native-apps.git
cd react-native-apps/chatApp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Fill in your `.env` file in the `chatApp` folder:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run the app

This project uses a development build (not plain Expo Go):

```bash
# one-time: build and install the dev client on your phone
npm run build:dev

# then start the dev server
npx expo start --dev-client
```

---

## Supabase Setup

1. Create a new Supabase project
2. Run `database/schema.sql` in the SQL editor (tables, RPC functions, RLS)
3. Enable Realtime on the `messages` table
4. Copy your project URL and anon key into `.env`

---

## Build an APK

```bash
eas login
eas build -p android --profile preview
```

The cloud build can't see your local `.env`, so set the Supabase variables in EAS first:

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --environment preview
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --environment preview
```

When the build finishes, download the `.apk` from the link EAS prints and install it on your phone.

---

## How Real-time Messaging Works

```
User sends message
      ↓
Insert into Supabase messages table
      ↓
Supabase Realtime broadcasts via WebSocket
      ↓
Other user's app receives payload instantly
      ↓
Message added to UI without page refresh
```

---

## Screenshots

![Chats](screenshots/chats.png) ![Chat](screenshots/chat.png)

---

## Author

**Aryan** — [@ARYAN0529](https://github.com/ARYAN0529)

---

## License

MIT