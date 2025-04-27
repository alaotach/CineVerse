# CookMyShow - Movie Booking System

## System Architecture

CookMyShow consists of three main components:

1. **C++ Backend**: Core business logic and data management
2. **Python Bridge**: API handling and data transformation between frontend and backend
3. **React Frontend**: User interface built with React, TypeScript and Tailwind CSS

## Prerequisites

- C++ compiler with C++17 support
- Python 3.9+ with pip
- Node.js 16+ with npm

## Starting the System

### All components at once (recommended)

Run the provided script:

```bash
start-system.bat
```

This will start the C++ backend, Python bridge, and open the frontend in your browser.

### Manual startup (for development)

#### 1. Start C++ Backend

```bash
cd backend
cinema_backend.exe --port=8080
```

#### 2. Start Python Bridge

```bash
cd bridge
python app.py
```

#### 3. Start Frontend Development Server

```bash
cd project
npm run dev
```

## Port Configuration

- C++ Backend: http://localhost:8080/api
- Python Bridge: http://localhost:5000
- Frontend: http://localhost:3000

## System Check

To verify if all components are running properly:

```bash
python system-check.py
```

## Troubleshooting

### C++ Backend Issues

If the C++ backend fails to start:
- Check if the required ports (8080) are already in use
- Ensure all necessary DLLs are available
- Check backend logs for specific errors

### Python Bridge Issues

If the Python bridge fails to start:
- Ensure all requirements are installed (`pip install -r bridge/requirements.txt`)
- Check if the port 5000 is already in use
- Verify environment variables are correctly set
- Check bridge logs for specific errors

### Frontend Issues

If the frontend cannot connect to the backend:
- Check that both the C++ backend and Python bridge are running
- Verify the environment variable `VITE_API_URL` is set correctly
- Clear browser cache and reload
