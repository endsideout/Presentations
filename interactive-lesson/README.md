# Interactive Nutrition Lesson

A Next.js-based interactive lesson teaching 3rd graders about healthy eating and the MyPlate food groups.

## Features

- **5 Interactive Activities**: Drag-and-drop food sorting, quizzes, and plate building
- **Real-time Teacher Dashboard**: Monitor student progress as they complete activities
- **Offline Support**: Progress saves locally and syncs when back online
- **Mobile Friendly**: Works on tablets and computers

## Quick Start

```bash
# Install dependencies
npm install

# Set up Firebase (see below)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the student view.  
Open [http://localhost:3000/teacher](http://localhost:3000/teacher) for the teacher dashboard.

## Environment Variables

Create a `.env.local` file with your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Student Device                           │
├─────────────────────────────────────────────────────────────────┤
│  localStorage ◄──────────────────────────────────────┐          │
│       │                                              │          │
│       ▼                                              │          │
│  React State ◄─────── onSnapshot() ◄─────── Firestore          │
│       │                     │                   ▲               │
│       │                     │                   │               │
│       └────► setDoc(merge) ─┴───► Retry Queue ──┘               │
│                                   (on failure)                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Teacher Dashboard                         │
├─────────────────────────────────────────────────────────────────┤
│  ConnectionStatus ◄─── onSnapshot(collection) ◄─── Firestore   │
│       │                        │                                │
│       ▼                        ▼                                │
│  Status Badge              Students[]                           │
│  (truthful)                (real-time)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Interactive Slides

| Slide | Activity | Description |
|-------|----------|-------------|
| 3 | Plate Activity | Build a balanced MyPlate |
| 6 | Quiz | Anytime vs Sometimes foods |
| 8 | Grains Sorting | Sort whole grains vs refined |
| 12 | Protein Sorting | Sort healthy vs processed proteins |
| 13 | Plate Choice | Choose the balanced plate |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Language**: TypeScript
