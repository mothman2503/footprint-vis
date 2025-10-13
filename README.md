# Footprint-Vis

**Footprint-Vis** is a web application for visualizing and analyzing personal search-history data.  
It consists of a **React frontend** and a **Flask backend**.

There are some pre-loaded search histories that can be visualized, and you also have the option to upload your own Google Search history.  
To export your own search history, follow the steps in [Section 4 – Google Takeout](#4-google-takeout).

The backend runs a small classification model that the frontend communicates with to categorize search queries and visualize them interactively.

---

## 🧩 How to set up and run the project

### 1. Clone the repository
```bash
git clone https://github.com/mothman2503/footprint-vis.git
cd footprint-vis
````

**Note:** This project uses [Git LFS](https://git-lfs.github.com/) for large model files.
Before cloning, ensure Git LFS is installed on your system:

```bash
git lfs install
```

If you already cloned without it, you can fetch the model files afterward with:

```bash
git lfs pull
```

---

### 2. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

By default, the backend runs on **[http://localhost:5000](http://localhost:5000)**.
If this port is busy or you want to use a different one, you can set it manually:

```bash
flask run --port 8000
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

This will start the React development server on **[http://localhost:3000](http://localhost:3000)**.
The frontend expects the backend to be running locally (default port 5000).
If you change the backend port, update the API URL in `frontend/src/config.js`.

---

### 4. Google Takeout

To use your own search history in this app, you’ll need to export it from Google Takeout as a `MyActivity.html` file.

#### Steps

1. Go to [**Google Takeout**](https://takeout.google.com).
2. Click **“Deselect all”** to start fresh.
3. Scroll down and check **“My Activity”** (or **“My Activity / Activity Controls / Web & App Activity”**)
   → this ensures your Google Search activity is included.
4. (Optional) Also make sure **Web & App Activity** is enabled in your Google Account settings before exporting.
5. Click **Next step**.
6. Choose your **delivery method** (e.g. *Send download link via email*) and **file type & size** (e.g. ZIP, 2 GB).
7. Click **Create export**.
   The export may take several minutes to hours, depending on data size.
8. Once you receive the download email, download and unzip the archive.
9. Inside the extracted folder, find a sub-folder named **“My Activity”** (or similar).
10. Inside that folder, locate the file named **`MyActivity.html`** (sometimes lowercase).
11. Upload that **`MyActivity.html`** file inside the app interface — or place it in the expected data folder — so the system can parse and visualize your searches.

---

### 📁 Project structure

```
footprint-vis/
│
├── frontend/   # React web app (visual interface)
└── backend/    # Flask API and classification model
```

---

### Notes

* You need both servers (frontend + backend) running at the same time.
* Make sure **Node.js ≥ 18** and **Python ≥ 3.10** are installed.
* Model files are stored via **Git LFS** — they will automatically download when cloning or running `git lfs pull`.

---

### License

MIT License © 2025 Othman Ghani
