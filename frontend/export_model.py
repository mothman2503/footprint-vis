#!/usr/bin/env python3
"""
Export a fine-tuned MiniLM sequence classifier to ONNX for @xenova/transformers.

Env (what you had working):
  - Python 3.10 venv
  - transformers==4.45.2
  - optimum==1.27.0
  - torch==2.8.0 (CPU)
"""

from pathlib import Path
import shutil
import sys

from transformers import AutoModelForSequenceClassification, AutoTokenizer
from optimum.exporters.onnx import export
from optimum.exporters.tasks import TasksManager

ROOT = Path(__file__).resolve().parent
CKPT_NAME = "microsoft__MiniLM-L12-H384-uncased"

CANDIDATES = [
    ROOT / "runs_multi_model" / CKPT_NAME,         # ./frontend/runs_multi_model/<CKPT_NAME>
    ROOT.parent / "runs_multi_model" / CKPT_NAME,  # ../runs_multi_model/<CKPT_NAME>
]

OUTPUT_DIR = ROOT / "public" / "models" / "minilm-iab"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REQUIRED = {
    "config.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.txt",
    "model.safetensors",
}

def pick_model_dir() -> Path:
    problems = []
    for p in CANDIDATES:
        if p.is_dir():
            missing = [f for f in REQUIRED if not (p / f).exists()]
            if not missing:
                return p
            problems.append(f"- {p} (missing: {', '.join(missing)})")
        else:
            problems.append(f"- {p} (does not exist)")
    raise FileNotFoundError("❌ Couldn’t find a valid model folder.\nChecked:\n" + "\n".join(problems))

def main():
    model_dir = pick_model_dir()
    print(f"✅ Using model dir: {model_dir}")

    # Load fine-tuned model + tokenizer from local files only
    tokenizer = AutoTokenizer.from_pretrained(str(model_dir), local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(str(model_dir), local_files_only=True)

    # Build ONNX export config for text-classification
    print("Exporting to ONNX…")
    onnx_cfg_ctor = TasksManager.get_exporter_config_constructor(
        model=model,
        exporter="onnx",
        task="text-classification",
        library_name="transformers",
    )
    onnx_config = onnx_cfg_ctor(model.config)

    # Export ONNX (no tokenizer/preprocessor arg in this Optimum version)
    export(
        model=model,
        config=onnx_config,
        opset=14,
        output=OUTPUT_DIR / "model.onnx",
        device="cpu",
    )

    # Save tokenizer files next to model.onnx
    tokenizer.save_pretrained(OUTPUT_DIR)

    # Also dump the model config (keeps id2label/label2id for nice labels in the browser)
    (OUTPUT_DIR / "config.json").write_text(model.config.to_json_string())

    # If you track extra mapping files, copy them (optional)
    for extra in ("id_to_label.json", "label_to_id.json"):
        src = model_dir / extra
        if src.exists():
            shutil.copy2(src, OUTPUT_DIR / extra)

    print(f"🎉 Export complete! Files written to: {OUTPUT_DIR}")
    print("   Expect: model.onnx + tokenizer files + config.json")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
