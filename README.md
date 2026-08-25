# ChatApp 💬

A real-time mobile chat application built with React Native (Expo) and Supabase.

---

## Features

- 🔐 Email/Password Authentication
- 💬 Real-time messaging via Supabase WebSockets
- 👥 One-on-one conversations
- 🔍 Search users to start a chat
- 📱 Cross-platform (Android & iOS)
- 🗄️ Persistent message storage with Supabase

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native (Expo) |
| Navigation | Expo Router (Drawer + Tabs) |
| Backend | Supabase (Auth + Postgres + Realtime) |
| State Management | Zustand |
| Styling | NativeWind (Tailwind CSS) |
| Language | TypeScript |
| Build | EAS (Expo Application Services) |

---

## Project Structure

```
ChatApp/
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
│   │   ├── _layout.tsx       # Drawer layout
│   │   └── index.tsx         # Drawer home
│   ├── chat/
│   │   └── [id].tsx          # Individual chat screen
│   ├── users.tsx             # User search screen
│   └── _layout.tsx           # Root layout with auth redirect
├── components/               # Reusable components
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

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account
- Expo Go app (for development)

### Installation

```bash
# Clone the repo
git clone https://github.com/ARYAN0529/react-native-apps.git
cd react-native-apps/ChatApp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Enable Realtime on the `messages` table
4. Copy your project URL and anon key to `.env`

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

> Add screenshots here

---

## Author

**Aryan** — [@ARYAN0529](https://github.com/ARYAN0529)

---

## License

MIT
