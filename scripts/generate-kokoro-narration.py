#!/usr/bin/env python
import argparse
import datetime as dt
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline


SAMPLE_RATE = 24000


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate per-segment Kokoro WAV narration for a HyperFrames video project."
    )
    parser.add_argument("project_dir", help="Path to mychannel/video/<project>")
    parser.add_argument("--voice", default="am_adam")
    parser.add_argument("--speed", type=float, default=0.8)
    parser.add_argument("--lang-code", default="a", help="Kokoro language code; 'a' is American English")
    parser.add_argument("--force", action="store_true", help="Regenerate existing WAV files")
    return parser.parse_args()


def txt_files(narration_dir):
    return sorted(p for p in narration_dir.glob("*.txt") if not p.name.startswith("_"))


def normalize_text(text):
    text = text.replace("\u2014", " - ")
    text = text.replace("\u2013", " - ")
    text = text.replace("\ufffd", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def tensor_to_numpy(audio):
    if hasattr(audio, "detach"):
        audio = audio.detach().cpu().numpy()
    return np.asarray(audio, dtype=np.float32)


def generate_file(pipeline, text_path, wav_path, voice, speed):
    text = normalize_text(text_path.read_text(encoding="utf-8"))
    if not text:
        raise ValueError(f"empty narration text: {text_path}")

    chunks = []
    # Split at sentence boundaries so long sections do not become one huge model call.
    for result in pipeline(text, voice=voice, speed=speed, split_pattern=r"(?<=[.!?])\s+"):
        if result.audio is None:
            continue
        chunks.append(tensor_to_numpy(result.audio))
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

    files = txt_files(narration_dir)
    if not files:
        raise SystemExit(f"no narration txt files found in {narration_dir}")

    pipeline = KPipeline(lang_code=args.lang_code)
    generated = []
    for text_path in files:
        wav_path = text_path.with_suffix(".wav")
        if wav_path.exists() and not args.force:
            print(f"skip existing {wav_path.name}")
            continue
        duration = generate_file(pipeline, text_path, wav_path, args.voice, args.speed)
        meta = {
            "voice": args.voice,
            "speed": args.speed,
            "source": text_path.name,
            "duration_seconds": round(duration, 3),
            "generated_at": dt.datetime.now(dt.UTC).isoformat(),
            "engine": "kokoro-82M",
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
