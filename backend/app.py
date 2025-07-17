from flask import Flask, request, jsonify
import torch
from transformers import RobertaTokenizerFast, RobertaForSequenceClassification
import joblib
import os

app = Flask(__name__)

model_dir = "model/results_distilroberta"
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

# Load model
tokenizer = RobertaTokenizerFast.from_pretrained(model_dir)
model = RobertaForSequenceClassification.from_pretrained(model_dir).to(device)
model.eval()
label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))

# Color map
IAB_COLOR_MAP = {
    "Arts, Culture & Entertainment": "#ff4b5c",
    "News, Politics & Society": "#f15bb5",
    "Technology & Science": "#3cba54",
    "Health & Wellness": "#4ade80",
    "Food, Drink & Lifestyle": "#ff6f61",
    "Business & Finance": "#ffbe0b",
    "Travel & Transportation": "#8ecae6",
    "Education & Learning": "#5bc0eb",
    "Family & Relationships": "#9d4edd",
    "Shopping": "#ffb703",
    "Sports": "#8338ec",
    "Uncategorized": "#aaaaaa"
}

@app.route("/classify", methods=["POST"])
def classify():
    data = request.json
    queries = data.get("queries", [])

    inputs = tokenizer(queries, return_tensors="pt", padding=True, truncation=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        preds = torch.argmax(outputs.logits, dim=1).cpu().numpy()

    labels = label_encoder.inverse_transform(preds)

    results = []
    for query, label in zip(queries, labels):
        results.append({
            "query": query,
            "category": label,
            "color": IAB_COLOR_MAP.get(label, "#aaaaaa")
        })

    return jsonify(results)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
