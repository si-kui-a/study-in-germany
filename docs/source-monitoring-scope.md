# 官方來源自動監測適用範圍

本系統的用途是「監測、比對、蒐證及提出候選更新」，不是無人審核的自動內容發布器。機器可執行規則以 [`config/source-monitoring.json`](../config/source-monitoring.json) 為準。

## 第一階段納入

- 簽證與居留
- 入學條件
- 財力證明及官方費用
- 健康保險
- 獎學金期限
- 現有官方連結

住宿、電信、銀行商品、語言學校價格及主觀推薦暫緩納入。私人、付費、登入後內容以及個人法律、稅務、醫療建議明確排除。

## 自動化邊界

| 等級 | 內容 | 允許行動 |
|---|---|---|
| L0 | 排版、導覽與無關變化 | 忽略並留下紀錄 |
| L1 | 永久轉址、官方聯絡網址 | 建立候選 Pull Request |
| L2 | 日期、金額、百分比 | 保存舊值、新值、上下文，等待審核 |
| L3 | 文件、流程、資格條件 | 僅建立差異報告 |
| L4 | 法律效果、例外及個案適用性 | 停止自動處理並要求人工研究 |

禁止直接推送 `main`、略過 CI、因來源失效直接刪除內容、繞過登入或驗證碼，以及用 AI 生成的結論取代官方原文。

## 日期語意

- `source_checked_at`：系統最後成功存取來源的日期。
- `content_verified_at`：人工確認網站陳述仍正確的日期。
- `valid_from`：規則正式生效日期。
- `updated_at`：目前內容資料版本日期；不得只因爬蟲成功連線而更新。

## 發布條件

正式資料只有在來源權威、原文上下文完整、適用對象及生效日可辨識、沒有同等官方來源衝突、人工完成核對且 CI 通過後才能合併。連續三次擷取失敗才建立 Issue，避免短暫斷線產生維護噪音。

## Discord 人工審核與發布

現有 `discord-interactions` Edge Function 支援內容更新按鈕：`content:approve:<PR編號>:<受審commit前12碼>` 與 `content:reject:<PR編號>:<受審commit前12碼>`。按鈕訊息必須同時呈現來源網址、舊值、新值、原文上下文、適用對象、生效日期、風險等級、PR 及 commit。

核准者必須位於 `DISCORD_CHANNEL_ID` 指定頻道，且使用者 ID 或角色 ID 出現在 `DISCORD_CONTENT_REVIEWER_USER_IDS`／`DISCORD_CONTENT_REVIEWER_ROLE_IDS`。Edge Function 會再次向 GitHub 確認 PR 尚未關閉、目標是 `main`、具有 `automated-content-update` 標籤，而且 commit 未在送審後改變。GitHub 分支保護仍會阻擋未通過 CI 的合併；合併後 Pages 只會在完整 main CI 成功後部署。

部署前還需設定 `GITHUB_CONTENT_TOKEN`（只授予此倉庫 Contents/Pull requests 讀寫）、`GITHUB_CONTENT_REPOSITORY`、至少一種 Discord 審核者白名單，然後重新部署 `discord-interactions --no-verify-jwt`。不得把個人廣泛權限 GitHub Token 複製到 Edge Function。

## 新增來源

每個新來源必須先在設定檔登錄網域、權威等級與可監測主題。新增主題時也必須同步定義風險等級、允許動作、異常門檻與人工審核責任；否則 CI 會拒絕設定。
