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

To use your own search history in this app, export it from Google Takeout as **`MyActivity.html`** located specifically under **My Activity ➜ Search**.

#### Steps

1. Go to [**Google Takeout**](https://takeout.google.com).
2. Click **Deselect all**.
3. Scroll to **My Activity** and tick the checkbox.
4. Click the blue text **All activity data included**.
   - In the list, **uncheck everything except _Search_**.
   - Click **OK** (or **Apply**).
5. Click **Multiple formats** (if shown) and ensure **HTML** is included for My Activity exports.
6. Click **Next step**.
7. Choose a **delivery method** (e.g., “Send download link via email”) and set **File type & size** (e.g., `.zip`, 2 GB).
8. Click **Create export**. (This can take minutes to hours.)
9. When the email arrives, download and unzip the archive.
10. Navigate to:  
    ```
    Takeout/
      My Activity/
        Search/
          MyActivity.html
    ```
11. In the app, upload **`MyActivity.html`** from that **Search** folder (not the top-level `My Activity` folder).

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
