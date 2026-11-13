# _wt_sig_hidden/scripts 指令目錄

<!-- make_command_catalog: dirs=.; title=_wt_sig_hidden/scripts 指令目錄 -->
本檔由 `make_command_catalog.py` 從各腳本開頭說明自動產生，不要手動編輯；改腳本說明後執行 `python make_command_catalog.py --recheck COMMANDS.md --write`。

| 腳本 | 用途 |
|---|---|
| `install_hooks.py` | 安裝 pre-commit + pre-push hook。 |
| `pre_commit_guard.py` | git commit前的強制檢查，安裝於 .git/hooks/pre-commit（見 scripts/install_hooks.py）。 |
| `pre_push_guard.py` | git push前的強制檢查，安裝於 .git/hooks/pre-push（見 scripts/install_hooks.py / install_hooks_full.py）。 |

## 呼叫方式

### `install_hooks.py`

```
python scripts/install_hooks.py      在repo根目錄執行一次，安裝pre-commit與pre-push
```

### `pre_commit_guard.py`

```
由 .git/hooks/pre-commit 自動呼叫（python scripts/install_hooks.py 安裝）
python scripts/pre_commit_guard.py   手動對目前暫存區跑一次同樣的檢查
```

### `pre_push_guard.py`

```
由 .git/hooks/pre-push 自動呼叫（python scripts/install_hooks.py 安裝），git傳入remote名稱與URL
```
