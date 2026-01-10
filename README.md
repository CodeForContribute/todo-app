# Productivity Workspace

A comprehensive productivity web application built with React and Firebase. Manage your daily tasks, track attendance, plan trips, and more - all in one place.

## Features

- **Dashboard** - Overview with quick access widgets for tasks, attendance, meetings, and leave balance
- **Daily Planner** - Task management with calendar view and daily quotes
- **Attendance Tracker** - Track office attendance and work patterns
- **Focus Timer** - Pomodoro technique timer for productivity
- **Meetings** - Manage upcoming meetings and calendar events
- **Leave Tracker** - Track leave balance and history
- **Trip Planner** - Plan and organize business trips
- **Salary Calculator** - Calculate and breakdown salary components
- **Expense Tracker** - Track and categorize expenses
- **Tax Calculator** - Indian income tax calculator
- **Quick Links** - Store frequently used links
- **Notes** - Capture ideas and important information
- **ChatBot** - AI assistant for quick queries
- **Gamification** - Streaks, levels, and achievement badges

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Firebase (Authentication & Firestore)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure Firebase
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Update `src/firebase/config.js` with your Firebase configuration

4. Start the development server
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
