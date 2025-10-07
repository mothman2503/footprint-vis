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

IAB_CATEGORIES = {
  "computers_technology_video_games": {"id": "1", "name": "computers_technology_video_games", "color": "#ff4b5c"},
  "education_and_science": {"id": "2", "name": "education_and_science", "color": "#f15bb5"},
  "family_and_relationships": {"id": "3", "name": "family_and_relationships", "color": "#3cba54"},
  "finance_and_career": {"id": "4", "name": "finance_and_career", "color": "#4ade80"},
  "health_fitness_beauty": {"id": "5", "name": "health_fitness_beauty", "color": "#ff6f61"},
  "hobbies_interests_leisure": {"id": "6", "name": "hobbies_interests_leisure", "color": "#ffbe0b"},
  "lifestyle_food_home_fashion_travel_pets": {"id": "7", "name": "lifestyle_food_home_fashion_travel_pets", "color": "#8ecae6"},
  "politics_economics_law_world_affairs": {"id": "8", "name": "politics_economics_law_world_affairs", "color": "#5bc0eb"},
  "pop_culture_arts_entertainment_film_music": {"id": "9", "name": "pop_culture_arts_entertainment_film_music", "color": "#9d4edd"},
  "sensitive_topics": {"id": "10", "name": "sensitive_topics", "color": "#ffb703"},
  "shopping": {"id": "11", "name": "shopping", "color": "#8338ec"},
  "sports": {"id": "12", "name": "sports", "color": "#1155ff"},
  "uncategorized": {"id": "13", "name": "uncategorized", "color": "#aaaaaa"}
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
                category = IAB_CATEGORIES.get(label, IAB_CATEGORIES["uncategorized"])
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
