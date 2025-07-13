import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

const MAX_LEN = 128;

const TextClassifier = () => {
  const [model, setModel] = useState(null);
  const [labelMap, setLabelMap] = useState({});
  const [inputText, setInputText] = useState("");
  const [prediction, setPrediction] = useState(null);

  // Load model and label map
  useEffect(() => {
    const loadResources = async () => {
      try {
        const loadedModel = await tf.loadGraphModel("/tfjs_model/model.json");
        console.log("✅ Model loaded");
        setModel(loadedModel);

        const res = await fetch("/label_map.json");
        const map = await res.json();
        console.log("✅ Label map loaded", map);
        setLabelMap(map);
      } catch (err) {
        console.error("❌ Failed to load model or label map", err);
      }
    };

    loadResources();
  }, []);

  const tokenize = (text) => {
    const tokens = text
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.length)
      .slice(0, MAX_LEN);

    const inputIds = new Array(MAX_LEN).fill(0);
    const attentionMask = new Array(MAX_LEN).fill(0);
    const tokenTypeIds = new Array(MAX_LEN).fill(0);

    for (let i = 0; i < tokens.length; i++) {
      inputIds[i] = tokens[i];
      attentionMask[i] = 1;
    }

    return {
      input_ids: tf.tensor([inputIds], [1, MAX_LEN], "int32"),
      attention_mask: tf.tensor([attentionMask], [1, MAX_LEN], "int32"),
      token_type_ids: tf.tensor([tokenTypeIds], [1, MAX_LEN], "int32")
    };
  };

  const classifyText = async () => {
    if (!model || !inputText.trim()) return;

    const { input_ids, attention_mask, token_type_ids } = tokenize(inputText);

    try {
      const output = await model.executeAsync({
        input_ids,
        attention_mask,
        token_type_ids
      });

      const scores = Array.isArray(output) ? output[0].arraySync()[0] : output.arraySync()[0];
      const predictedIndex = scores.indexOf(Math.max(...scores));
      const predictedLabel = labelMap[predictedIndex] || `Class ${predictedIndex}`;

      setPrediction(predictedLabel);

      tf.dispose([input_ids, attention_mask, token_type_ids, output]);
    } catch (err) {
      console.error("❌ Model execution error:", err);
      alert("Model execution failed. See console for details.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") classifyText();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl mb-4">IAB Text Classifier</h2>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type some text..."
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      <button
        onClick={classifyText}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Classify
      </button>
      {prediction && (
        <div className="mt-4 text-lg">
          <strong>Predicted IAB category:</strong> {prediction}
        </div>
      )}
    </div>
  );
};

export default TextClassifier;
