from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import joblib
import os

app = Flask(__name__)
CORS(app)

# === Configuration ===
model_dir = "./model"
device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")

# === Load model & tokenizer
tokenizer = DistilBertTokenizerFast.from_pretrained(model_dir)
model = DistilBertForSequenceClassification.from_pretrained(model_dir).to(device)
model.eval()

# === Load label encoder
label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))

# === Category definitions (name-based!)
IAB_CATEGORIES = {
    "Arts, Culture & Entertainment": {"id": "1", "name": "Arts, Culture & Entertainment", "color": "#ff4b5c"},
    "News, Politics & Society": {"id": "2", "name": "News, Politics & Society", "color": "#f15bb5"},
    "Technology & Science": {"id": "3", "name": "Technology & Science", "color": "#3cba54"},
    "Health & Wellness": {"id": "4", "name": "Health & Wellness", "color": "#4ade80"},
    "Food, Drink & Lifestyle": {"id": "5", "name": "Food, Drink & Lifestyle", "color": "#ff6f61"},
    "Business & Finance": {"id": "6", "name": "Business & Finance", "color": "#ffbe0b"},
    "Travel & Transportation": {"id": "7", "name": "Travel & Transportation", "color": "#8ecae6"},
    "Education & Learning": {"id": "8", "name": "Education & Learning", "color": "#5bc0eb"},
    "Family & Relationships": {"id": "9", "name": "Family & Relationships", "color": "#9d4edd"},
    "Shopping": {"id": "10", "name": "Shopping", "color": "#ffb703"},
    "Sports": {"id": "11", "name": "Sports", "color": "#8338ec"},
    "Uncategorized": {"id": "12", "name": "Uncategorized", "color": "#aaaaaa"},
}

@app.route("/classify", methods=["POST"])
def classify():
    data = request.get_json()
    queries = data.get("queries", [])

    if not queries:
        return jsonify({"error": "No queries provided"}), 400

    BATCH_SIZE = 16  # Tune this based on your device's memory
    results = []

    try:
        for i in range(0, len(queries), BATCH_SIZE):
            batch = queries[i:i + BATCH_SIZE]
            inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=128)
            inputs = {k: v.to(device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                preds = torch.argmax(probs, dim=1).cpu().numpy()
                labels = label_encoder.inverse_transform(preds)

            for query, label in zip(batch, labels):
                category = IAB_CATEGORIES.get(label, IAB_CATEGORIES["Uncategorized"])
                results.append({
                    "query": query,
                    "category": category
                })

        return jsonify(results)

    except RuntimeError as e:
        print(f"[ERROR] RuntimeError during inference: {e}")
        return jsonify({"error": "Model inference failed. Try reducing input size or batch size."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
