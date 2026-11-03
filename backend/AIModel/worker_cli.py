# worker_cli.py
import argparse
import json
import sys
import os
import urllib.request

# Suppress PyTorch/Timm warnings from polluting the JSON stdout
import warnings
warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3" 

from inference import load_model, predict_video

# Configurations pulled from your original app.py
CKPT = os.environ.get("DEEPFAKE_CKPT", "checkpoints/finetune_resume.pt")
CKPT_URL = os.environ.get(
    "DEEPFAKE_CKPT_URL",
    "https://huggingface.co/DeepeshDesu/deepfake_detection/resolve/main/finetune_resume.pt",
)
CHUNK = 1 << 20
MIN_CKPT_BYTES = 50 * 1024 * 1024

def ensure_checkpoint(path: str, url: str) -> str:
    """Use the local checkpoint if present, otherwise download it once from url."""
    if os.path.isfile(path):
        return path
    if not url:
        raise RuntimeError(f"Checkpoint not found at '{path}'. Set DEEPFAKE_CKPT_URL.")
    
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    tmp = path + ".part"
    
    try:
        with urllib.request.urlopen(url) as r, open(tmp, "wb") as f:
            while chunk := r.read(CHUNK):
                f.write(chunk)
        if os.path.getsize(tmp) < MIN_CKPT_BYTES:
            raise RuntimeError("Downloaded file is too small; check the URL.")
        os.replace(tmp, path)
    except Exception as e:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise RuntimeError(f"Failed to download checkpoint: {str(e)}")
        
    return path

def main():
    parser = argparse.ArgumentParser(description="BullMQ Worker CLI for Deepfake Shield")
    parser.add_argument("--video", required=True, help="Path to the downloaded Google Drive video")
    # Note: args.checkpoint defaults to the CKPT variable which points to finetune_resume.pt
    parser.add_argument("--checkpoint", default=CKPT, help="Path to the model checkpoint")
    args = parser.parse_args()

    if not os.path.isfile(args.video):
        print(json.dumps({"error": f"Video file not found: {args.video}"}))
        sys.exit(1)

    try:
        #  Ensure the checkpoint exists (or download it) before loading
        verified_ckpt_path = ensure_checkpoint(args.checkpoint, CKPT_URL)
        
        model = load_model(verified_ckpt_path)
        inference_results = predict_video(model, args.video)
        prob = inference_results["probability"]
        
        result = {
            "prediction": "FAKE" if prob > 0.5 else "REAL",
            "confidence": round(max(prob, 1 - prob) * 100, 2),
            "faceNeckCorrelation": inference_results.get("neck_correlation_score", 0)
        }
        
        # Print ONLY valid JSON to stdout
        # sys.__stdout__ is the real stdout, unaffected by the devnull redirect below
        #sys.stdout is the name that print() uses by default, and you replaced it. Python also keeps the original stream in sys.__stdout__, which your redirect doesn’t touch. By printing to file=sys.__stdout__, the JSON goes to the real stdout, which is the pipe that Node’s exec reads.

     # flush() makes sure the text is actually written before the process exits, so it can’t be lost in a buffer.
     # sys.exit(0) still works as before. It raises SystemExit, your finally block runs, closes the devnull file, and restores sys.stdout.
        print(json.dumps(result), file=sys.__stdout__)
        sys.__stdout__.flush()
        sys.exit(0)

    except ValueError as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Internal inference error: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    original_stdout = sys.stdout
    sys.stdout = open(os.devnull, 'w')
    try:
        main()
    finally:
        sys.stdout.close()
        sys.stdout = original_stdout