# TODO: Phase 0 — channel-aware refactor

承認済み計画 (tasks/plan.md rev2)。autopilot を壊さないことが絶対条件。

- [x] 0-1. golden fixture 取得 (移行前): publish:plan / whoami / job → tasks/_golden/
- [x] 0-2. git mv mychannel → channels/autopilot (246 renames)
- [x] 0-3. scripts のデフォルトパス更新 + non-comment stale参照ゼロ
- [x] 0-4. channels.json 新設 + utils/channels.js resolver (schema検証)
- [x] 0-5. credential-manager tokensPath 対応 + assertChannel 誤投稿ガード
- [x] 0-6. publish-queue/package-to-jobs/set-thumbnail/upload/experiment-report に --channel
- [x] 0-7. 検証: publish:plan --channel autopilot = golden / whoami 一致 / guard pass&abort 確認
- [x] 0-8. commit 7337bbe + push origin master 完了

Phase 0 DONE (7337bbe pushed)。次: Phase 1 (Reddit collection, 規約ゲート先行)。

## 持ち越し (Phase 0 commit に含めなかった prior 未コミット作業)
package.json(morning/experiment npm scripts), scripts/experiment-report.js の
channel編集, jst-slots.test.js, docs/, 他 untracked scripts は別途コミット判断が必要。
