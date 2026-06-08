#!/usr/bin/env python
"""Generate per-segment Kokoro narration using the kokoro-onnx runtime.

Drop-in alternative to generate-kokoro-narration.py for environments where the
PyTorch `kokoro` package cannot be built (e.g. Python 3.14). Produces identical
per-segment WAV + JSON sidecar outputs so transcribe-word-timings.py and the
HyperFrames index can consume them unchanged.

Model files (download once):
  kokoro-v1.0.onnx, voices-v1.0.bin
  default search path: %USERPROFILE%/.cache/kokoro-onnx (override with --model/--voices)
"""
import argparse
import datetime as dt
import json
import os
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SAMPLE_RATE = 24000
DEFAULT_CACHE = Path(os.path.expanduser("~")) / ".cache" / "kokoro-onnx"


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project_dir", help="Path to channels/<channel>/video/<project>")
    parser.add_argument("--voice", default="am_adam")
    parser.add_argument("--speed", type=float, default=0.8)
    parser.add_argument("--lang", default="en-us")
    parser.add_argument("--model", default=str(DEFAULT_CACHE / "kokoro-v1.0.onnx"))
    parser.add_argument("--voices", default=str(DEFAULT_CACHE / "voices-v1.0.bin"))
    parser.add_argument("--force", action="store_true", help="Regenerate existing WAV files")
    return parser.parse_args()


def txt_files(narration_dir):
    return sorted(p for p in narration_dir.glob("*.txt") if not p.name.startswith("_"))


def normalize_text(text):
    text = text.replace("—", " - ").replace("–", " - ").replace("�", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def generate_file(kokoro, text_path, wav_path, voice, speed, lang):
    text = normalize_text(text_path.read_text(encoding="utf-8"))
    if not text:
        raise ValueError(f"empty narration text: {text_path}")

    chunks = []
    # Split at sentence boundaries so long sections do not exceed the token window.
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        sentence = sentence.strip()
        if not sentence:
            continue
        samples, sr = kokoro.create(sentence, voice=voice, speed=speed, lang=lang)
        if sr != SAMPLE_RATE:
            raise RuntimeError(f"unexpected sample rate {sr} for {text_path}")
        chunks.append(np.asarray(samples, dtype=np.float32))
        chunks.append(np.zeros(int(SAMPLE_RATE * 0.12), dtype=np.float32))

    if not chunks:
        raise RuntimeError(f"Kokoro generated no audio for {text_path}")

    audio = np.concatenate(chunks)
    sf.write(str(wav_path), audio, SAMPLE_RATE)
    return len(audio) / SAMPLE_RATE


def main():
    args = parse_args()
    project_dir = Path(args.project_dir).resolve()
    narration_dir = project_dir / "assets" / "narration"
    if not narration_dir.exists():
        raise SystemExit(f"narration dir not found: {narration_dir}")
    for required in (args.model, args.voices):
        if not Path(required).exists():
            raise SystemExit(f"model file not found: {required}")

    files = txt_files(narration_dir)
    if not files:
        raise SystemExit(f"no narration txt files found in {narration_dir}")

    kokoro = Kokoro(args.model, args.voices)
    generated = []
    for text_path in files:
        wav_path = text_path.with_suffix(".wav")
        if wav_path.exists() and not args.force:
            print(f"skip existing {wav_path.name}")
            continue
        duration = generate_file(kokoro, text_path, wav_path, args.voice, args.speed, args.lang)
        meta = {
            "voice": args.voice,
            "speed": args.speed,
            "source": text_path.name,
            "duration_seconds": round(duration, 3),
            "generated_at": dt.datetime.now(dt.UTC).isoformat(),
            "engine": "kokoro-onnx-v1.0",
            "sample_rate": SAMPLE_RATE,
        }
        text_path.with_suffix(".json").write_text(
            json.dumps(meta, indent=2) + "\n", encoding="utf-8"
        )
        generated.append((wav_path.name, duration))
        print(f"generated {wav_path.name} {duration:.2f}s")

    if generated:
        total = sum(duration for _, duration in generated)
        print(f"generated {len(generated)} file(s), {total:.2f}s")
    else:
        print("nothing generated")


if __name__ == "__main__":
    main()
