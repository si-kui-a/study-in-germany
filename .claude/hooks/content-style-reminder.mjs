// PreToolUse hook（Write|Edit）：編輯 src/data/**/*.ts 或 *.json 這類內容
// 資料檔前，自動提醒查 docs/content-style-guide.md，不用每次手動記得。
// 只提醒、不阻擋——真正的禁用詞硬擋在 npm run check:style（CI 也會跑）。
let data = '';
process.stdin.on('data', (chunk) => { data += chunk; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input?.tool_input?.file_path ?? '';
    if (/[/\\]src[/\\]data[/\\].*\.(ts|json)$/.test(filePath)) {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext:
            '這個檔案在 src/data/ 底下，屬於留德華站的使用者可見內容資料檔。' +
            '動筆前請先查 docs/content-style-guide.md（30 秒快速版在最上面）：' +
            '一律用「你」對讀者說話，不用「使用者/用戶」當第二人稱代稱；' +
            '不用「封鎖帳戶/服務器/賬戶/界面」等簡體慣用詞（台灣繁體：限制提領帳戶/伺服器/帳戶/介面）；' +
            '連結文字要可預期導向什麼，不用「點此/了解更多」；' +
            '德文專有名詞同頁/同檔第一次出現才附中文說明，之後用中文。' +
            '寫完可跑 npm run check:style 自動核對禁用詞（CI 也會跑）。',
        },
      }));
    }
  } catch {
    // 讀不到/解析不出 tool_input 就安靜跳過，不影響原本的工具呼叫
  }
});
