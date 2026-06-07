#!/usr/bin/env python
import argparse
import json
import re
from pathlib import Path

import whisper


def parse_args():
    parser = argparse.ArgumentParser(
        description="Transcribe project WAV narration into HyperFrames word timing JS files."
    )
    parser.add_argument("project_dir", help="Path to mychannel/video/<project>")
    parser.add_argument("--model", default="small.en")
    parser.add_argument("--force", action="store_true", help="Regenerate existing word JS files")
    return parser.parse_args()


def js_var_for(wav_path):
    match = re.match(r"^(\d+)-", wav_path.name)
    if not match:
        raise ValueError(f"cannot infer segment number from {wav_path.name}")
    return f"SEG{int(match.group(1)):02d}_WORDS"


def parse_existing_words(js_path):
    text = js_path.read_text(encoding="utf-8")
    text = re.sub(r"^window\.\w+\s*=\s*", "", text).strip()
    text = re.sub(r";\s*$", "", text)
    return json.loads(text)


def transcribe(model, wav_path):
    result = model.transcribe(
        str(wav_path),
        word_timestamps=True,
        language="en",
        fp16=False,
    )
    words = []
    for segment in result.get("segments", []):
        for word in segment.get("words", []):
            text = word.get("word", "").strip()
            if not text:
                continue
            words.append([
                text,
                round(float(word["start"]), 2),
                round(float(word["end"]), 2),
            ])
    return words


def main():
    args = parse_args()
    project_dir = Path(args.project_dir).resolve()
    narration_dir = project_dir / "assets" / "narration"
    if not narration_dir.exists():
        raise SystemExit(f"narration dir not found: {narration_dir}")

    wavs = sorted(p for p in narration_dir.glob("*.wav") if re.match(r"^\d+-", p.name))
    if not wavs:
        raise SystemExit(f"no segment wav files found in {narration_dir}")

    model = whisper.load_model(args.model)
    transcript = []
    global_offset = 0.0

    for wav_path in wavs:
        var_name = js_var_for(wav_path)
        js_path = wav_path.with_name(f"{wav_path.stem.split('-', 1)[0]}-words.js")
        if js_path.exists() and not args.force:
            words = parse_existing_words(js_path)
            print(f"skip existing {js_path.name} ({len(words)} words)")
        else:
            words = transcribe(model, wav_path)
            js_path.write_text(
                f"window.{var_name}={json.dumps(words, ensure_ascii=False)};\n",
                encoding="utf-8",
            )
            print(f"wrote {js_path.name} ({len(words)} words)")

        for index, word in enumerate(words):
            transcript.append({
                "id": f"w{len(transcript)}",
                "segment": wav_path.stem,
                "segmentWordIndex": index,
                "text": word[0],
                "start": round(global_offset + float(word[1]), 2),
                "end": round(global_offset + float(word[2]), 2),
            })
        if words:
            global_offset += float(words[-1][2])

    (project_dir / "transcript.json").write_text(
        json.dumps(transcript, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"wrote transcript.json ({len(transcript)} words)")


if __name__ == "__main__":
    main()
