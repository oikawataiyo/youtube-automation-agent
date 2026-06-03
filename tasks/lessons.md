# Lessons — 繰り返さないための自己ルール

> CLAUDE.md §3 Self-Improvement Loop。user からの correction / 失敗 pattern を記録し、同じ轍を踏まない。

## 2026-05-30 visual-methodology 構築から

### L1: 「前提を白紙にして」と言われたら、過去の制約を持ち込まない
- **何が起きたか**: 当初 moyo アバターのキャラアニメ前提で映像方法論を考えていたが、user に「moyo のアバターに固執する必要もないので、それを使うという前提も白紙にして」と指示された。
- **rule**: user が assumption の blank-slate を明示したら、それまでの設計判断・成果物の前提を引き継がず、output をその制約から完全に切り離す。岡田メソッドも「キャラアニメ専用」ではなく汎用の映像/物語/演出方法論として体系化した。
- **適用場面**: 既存方針の延長で考えがちな時。user が「白紙」「こだわらない」「前提を外す」と言ったら一旦ゼロベースに戻す。

### L2: Codex usage limit に当たったら Claude-direct に pivot
- **何が起きたか**: Phase 4 で PRINCIPLES / PLAYBOOK 生成を Codex に委譲したが、両 job が exit 1 で "You've hit your usage limit" 失敗。
- **rule**: Codex 委譲が usage limit で失敗したら、待たずに Claude が直接書く。ただし context 肥大を避けるため **必要 section だけ read** する (axis A を全読 + 他 axis は `## 2.` / `## 6.` を grep)。全 file を Read しない。
- **適用場面**: Codex 委譲が usage/quota error を返した時。reset を待つより Claude 直書きの方が速い場合が多い。

### L3: 日本語パスを含む script は PowerShell でなく bash で書く
- **何が起きたか**: `sync_visual_methodology.ps1` が "Unexpected token" / "string is missing the terminator" で parse 失敗。Windows PowerShell 5.1 の UTF-8 + 日本語パス文字列の非互換が原因。
- **rule**: 日本語のパス/文字列を多用する shell script は最初から bash (`scripts/*.sh`, Git Bash 実行) で書く。PowerShell 5.1 は日本語リテラルで parse error を起こしやすい。
- **適用場面**: Windows でファイル同期/操作 script を書く時、対象パスに日本語が含まれるなら bash を選ぶ。

### L4: Codex Windows 起動の定型 (memory にも記録済)
- `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox --output-last-message <file> "$(cat prompt.txt)" </dev/null`
- `</dev/null` 必須 (background hang 防止)、bypass flag 必須 (Win11 Home は Sandbox 非対応)。
- 詳細は auto-memory: codex_windows_sandbox / codex_background_stdin 参照。

## 2026-06-03 pullaway-v2 (hyperframes render) から

### L5: hyperframes render は同一 GPU を奪い合うので「絶対に1本ずつ」直列
- **何が起きたか**: seg-02 を background で複数回 launch してしまい、3本が同じ `renders/seg-02.mp4` に同時 render → GPU 競合で各々が異常に遅く (数分→十数分)、かつ同一 file への並行書き込みで破損リスク。
- **rule**: render は 1 本完了 (task-notification) を待ってから次を launch。並行 render しない。誤って複数 launch したら TaskStop で止め、出力 file を rm して単独で render し直す。
- **適用場面**: hyperframes/ffmpeg など GPU/重 IO を使う job。「並列で速くなる」は誤り、むしろ遅く+壊れる。

### L6: background bash は repo root で起動する (foreground の cwd を継承しない)
- **何が起きたか**: foreground で `pwd`=v2 でも、`run_in_background:true` の render が repo root で動き "No index.html / No composition" で失敗。
- **rule**: background command は primary working dir (repo root) 起点とみなす。project subdir で動かす必要があるなら command 内に `cd <abs path> &&` を明示するか、絶対パスで全引数を渡す。foreground の cwd 継承を当てにしない。
- **適用場面**: subdir の project で render/build を background 実行する時。

### L7: `cmd 2>&1 | tail -N` は完了まで何も出ない (進捗が見えない)
- **何が起きたか**: render 出力を `| tail -4` に通したため、tail が EOF まで buffer して進捗 0 表示。hung と誤認しかけた。
- **rule**: 進捗を見たいなら pipe せず `--output-last-message` 的手段か raw 出力にする。tail/head に通したら「完了まで沈黙」が正常。判断は task-notification を待つ。
