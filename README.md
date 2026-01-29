# Flowly

A modern productivity web application built with React and Firebase. Manage your daily tasks, track attendance, stay focused with Pomodoro timer, and more - all in one beautiful interface.

**Live Demo:** [flowly.onrender.com](https://flowly.onrender.com)

## Features

### Core Productivity
- **Dashboard** - Overview with quick access widgets for tasks, attendance, meetings, and leave balance
- **Daily Planner** - Task management with calendar view and daily quotes
- **Focus Timer** - Pomodoro technique timer with session tracking
- **Notes** - Capture ideas and important information with rich formatting

### Work Management
- **Attendance Tracker** - Track office attendance with auto check-in via IP/location detection
- **Meetings** - Manage upcoming meetings and calendar events
- **Leave Tracker** - Track leave balance and history
- **Trip Planner** - Plan and organize business trips

### Finance Tools
- **Salary Calculator** - Calculate and breakdown salary components
- **Expense Tracker** - Track and categorize expenses
- **Tax Calculator** - Indian income tax calculator

### Additional Features
- **Quick Links** - Store frequently used links
- **ChatBot** - AI assistant for quick queries
- **Gamification** - Streaks, XP levels, and achievement badges

## Tech Stack

- **Frontend:** React 19, Vite 7
- **Styling:** Tailwind CSS 4
- **Backend:** Firebase (Authentication & Firestore)
- **Testing:** Vitest, Testing Library
- **CI/CD:** GitHub Actions
- **Hosting:** Render

## Production Features

- Progressive Web App (PWA) - Install on mobile/desktop
- Offline support with service worker caching
- Error boundaries for graceful error handling
- XSS protection with DOMPurify
- Accessibility compliant (ARIA labels, keyboard navigation, skip links)
- Code splitting for optimal performance

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/CodeForContribute/flowly.git
   cd flowly
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Deployment

The app is configured for deployment on Render. Push to the `develop` branch to trigger automatic deployment.

## License

MIT
