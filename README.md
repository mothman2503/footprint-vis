# Footprint-Vis

**Footprint-Vis** is a web application for visualizing and analyzing personal search history data.  
It consists of a **React frontend** and a **Flask backend**.  
The backend runs a small classification model that the frontend communicates with to categorize search queries so that it can then display them.

---

## 🧩 How to set up and run the project

### 1. Clone the repository
```bash
git clone https://github.com/mothman2503/footprint-vis.git
cd footprint-vis
```


### 2. Backend setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```
