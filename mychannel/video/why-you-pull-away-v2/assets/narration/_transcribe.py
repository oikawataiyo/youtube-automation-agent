import sys, json, whisper

wav = sys.argv[1]
varname = sys.argv[2]
out_js = sys.argv[3]

model = whisper.load_model("small.en")
res = model.transcribe(wav, word_timestamps=True, language="en", fp16=False)

words = []
for seg in res["segments"]:
    for w in seg.get("words", []):
        txt = w["word"].strip()
        if not txt:
            continue
        words.append([txt, round(float(w["start"]), 2), round(float(w["end"]), 2)])

with open(out_js, "w", encoding="utf-8") as f:
    f.write("window.%s=%s;\n" % (varname, json.dumps(words, ensure_ascii=False)))

print("WORDS", len(words))
if words:
    print("FIRST", words[0])
    print("LAST", words[-1])
