# Footprint-Vis

Footprint-Vis is a full-stack app that helps you understand and visualize your Google Search history. The React frontend renders interactive day/month calendars, category trends, and table views. The Flask backend exposes a lightweight classifier so searches can be grouped into IAB-style categories.

## Table of Contents
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Repository Setup](#repository-setup)
- [Quick Start](#quick-start)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Using Your Own Data (Google Takeout)](#using-your-own-data-google-takeout)
- [Project Structure](#project-structure)
- [Common Commands](#common-commands)
- [Notes](#notes)

## Introduction
Visualize search activity across days and months, drill into categories, and upload your own Google Takeout export. Sample datasets are bundled so you can explore immediately; uploading your own `MyActivity.html` (Search only) lets you classify and browse personal history offline in the browser while the backend handles category inference.

## Prerequisites
- **Node.js ≥ 18**
- **Python ≥ 3.10**
- **Git LFS** (required for model assets)  
  ```bash
  git lfs install
  ```

## Repository Setup
```bash
git clone https://github.com/mothman2503/footprint-vis.git
cd footprint-vis
git lfs pull          # fetch LFS-tracked model files
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs at **http://localhost:3000** and expects the backend at **http://localhost:8000** by default.

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py                      # serves on http://localhost:8000
```
If you need a different port: `flask run --port 5000`.

## Using Your Own Data (Google Takeout)
Export **MyActivity.html** for **Search** only, then upload it in the app.
1) Go to [Google Takeout](https://takeout.google.com) → **Deselect all**.  
2) Select **My Activity** → **All activity data included** → keep only **Search** checked.  
3) Ensure export format includes **HTML**.  
4) Create export, download, unzip, then pick:
```
Takeout/My Activity/Search/MyActivity.html
```
Upload that file via the dataset “Add dataset” action.

## Project Structure
```
footprint-vis/
├── frontend/   # React app: views, charts, dataset management
└── backend/    # Flask API + classifier model
```

## Common Commands
- Frontend dev server: `npm start` (from `frontend/`)
- Frontend build: `npm run build` (from `frontend/`)
- Backend dev: `python app.py` (from `backend/`)
- Lint (frontend): `npm run lint` (from `frontend/`)

## Notes
- Run **frontend and backend** together for a full experience.  
- Update backend URL in `frontend/src/config.js` if you change ports.  
- LFS assets must be present (`git lfs pull`) before running the classifier.***
