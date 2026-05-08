# PreventAI Health

A multi-component AI health assistant combining a Python model backend with a React frontend UI.

## Project Overview

This repository includes:

- `ai health/frontend` - React + Vite + Tailwind UI for user-facing dashboards and health assessments.
- `ai health/model` - Python machine learning models and a Flask-based backend web app.
- `run_all.bat` - Windows launcher to start both backend and frontend together.

The app supports:

- Blood pressure prediction
- Diabetes risk assessment
- Obesity prediction
- Posture and exercise guidance
- A simple web app interface for recommendations

## Repository Structure

```
A:\ai health
├── run_all.bat
├── ai health
│   ├── frontend
│   ├── model
│   └── supabase
```

### Key folders

- `ai health/frontend` - frontend source
- `ai health/model` - Python backend, ML models, web app, and utilities
- `ai health/model/web_app` - Flask web app templates, static assets, and server code
- `ai health/model/posture/exercise_ai` - pose and exercise analysis logic

## Setup Instructions

### 1. Backend setup

1. Open PowerShell and navigate to the model folder:

```powershell
cd "A:\ai health\ai health\model"
```

2. Create and activate a virtual environment:

```powershell
python -m venv .\venv
.\venv\Scripts\Activate.ps1
```

3. Install backend dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

4. Start the backend service:

```powershell
python web_app/app.py
```

The backend should run on `http://localhost:5000` by default.

### 2. Frontend setup

1. Open a separate terminal and go to the frontend folder:

```powershell
cd "A:\ai health\ai health\frontend"
```

2. Install Node dependencies:

```powershell
npm install
```

3. Start the frontend development server:

```powershell
npm run dev
```

The frontend should run on `http://localhost:5173`.

### 3. Quick start using the launcher

From the repository root:

```powershell
.\run_all.bat
```

This opens two windows: one for the backend and one for the frontend.

## Features

- React dashboard with health assessments
- Supabase integration support in `ai health/supabase`
- Python ML models for predictions and analysis
- Web recommendations interface in `model/web_app`
- Pose tracking and exercise guidance in `model/posture/exercise_ai`

## Frontend Notes

The frontend uses:

- React
- Vite
- Tailwind CSS
- React Router
- Supabase
- Recharts

If you receive `ENOENT` errors from `npm install`, make sure you are in `ai health/frontend` and that `package.json` is present.

## Backend Notes

The backend is built with Python and includes:

- `requirements.txt` for dependencies
- ML support in `bp_model`, `health ai`, and `obesity_model`
- A Flask app in `web_app/app.py`

If you see Python errors, verify that the virtual environment is activated and dependencies are installed.

## Troubleshooting

- `npm install` must be run from `ai health/frontend`
- `python web_app/app.py` must be run after activating `ai health/model/venv`
- If port conflicts occur, stop any processes using `5000` or `5173`

## Next Steps

- Configure Supabase credentials if using the `supabase` integration
- Update model assets in `ai health/model/health ai/models`
- Customize UI components in `ai health/frontend/src/components`
- Improve the Flask backend in `ai health/model/web_app`

---

If you want, I can also add a smaller `README.md` inside `ai health/frontend` and `ai health/model` for component-level documentation.