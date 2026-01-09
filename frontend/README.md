# Frontend - Green Acres Farm Management

This is the frontend application for the Green Acres Farm Management system, built with React, TypeScript, and Vite.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build

To build the application for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, Cart, etc.)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── ...
├── public/             # Static assets
├── index.html          # HTML entry point
├── App.tsx             # Main App component
├── index.tsx           # Application entry point
└── vite.config.ts      # Vite configuration
```

## 🔧 Technologies Used

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## 🔗 Backend Integration

The frontend connects to the backend API. Make sure the backend server is running before starting the frontend development server.

Backend API URL is configured in the environment variables (`.env` file).

## 📝 Notes

- This frontend is now separated from the backend for better project organization
- All frontend-specific files are contained in this directory
- The backend is located in the `../backend` directory
