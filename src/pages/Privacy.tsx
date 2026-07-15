export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl space-y-8 text-content-secondary">
      <div>
        <h1 className="text-2xl font-semibold text-content-primary">隱私政策</h1>
        <p className="mt-1 text-xs text-content-muted">最後更新：2026-07-15</p>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">1. 前言與適用範圍</h2>
        <p>
          留德華（下稱「本站」）是一個開源個人專案，非官方社群平台，以台灣使用者為主要
          服務對象，提供德國語言學校評價、討論區與相關資訊整理。本政策適用於所有訪客
          （未登入瀏覽者）與已透過 Google 帳號登入的註冊使用者。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">2. 我們收集哪些資料</h2>
        <p className="mb-2">
          本站依實際資料庫結構，逐項列出所蒐集的個人資料類別：
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Google 帳號基本資料</strong>：使用 Google 登入時，透過 Supabase Auth
            取得你的姓名、Email 與頭像 URL。Email 僅用於帳號識別與登入驗證，<strong>不會公開顯示</strong>。
          </li>
          <li>
            <strong>個人資料設定（profiles 表）</strong>：顯示名稱（display_name）、頭像網址
            （avatar_url）、註冊序號（registration_seq，用於匿名編號顯示選項）、已取得的徽章
            （badges）。
          </li>
          <li>
            <strong>語校評價（school_reviews 表）</strong>：你發表的 6 維評分（整體、教學、環境、
            教材、行政、交通、價格）與心得文字。
          </li>
          <li>
            <strong>討論區貼文（listings 表）</strong>：貼文標題、內容、地區、價格、聯絡方式
            （選填）、上傳照片、到期時間。
          </li>
          <li>
            <strong>留言與按讚（listing_comments / listing_likes 表）</strong>：你於討論區貼文下的
            留言內容，以及按讚紀錄。
          </li>
          <li>
            <strong>使用者提交（user_submissions 表）</strong>：你主動提交的學校資訊補充、新學校
            建議、新推薦項目或一般回饋內容。
          </li>
          <li>
            <strong>追蹤關係（user_follows 表）</strong>：你追蹤的其他使用者、以及追蹤你的使用者
            （僅記錄關聯，供追蹤動態功能使用）。
          </li>
          <li>
            <strong>檢舉紀錄（reports 表）</strong>：若你提出檢舉，會記錄檢舉類型、原因與補充說明。
            <strong>此項資料不對外公開顯示，僅站方可透過 Supabase Dashboard 查看</strong>，用於處理
            不當內容通報。
          </li>
          <li>
            <strong>被動技術資料</strong>：本站託管於 GitHub Pages、後端服務使用 Supabase，這兩項
            服務可能依其自身運作需要記錄基礎存取日誌（如 IP 位址、瀏覽器資訊），此類資料非本站
            自行蒐集或直接存取，其處理方式請參閱 GitHub 與 Supabase 各自的隱私政策。
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">3. 處理目的與法律依據</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>帳號登入與內容發布</strong>：為提供評價、發文、留言、按讚、追蹤等你主動請求的
            功能所必要，依 GDPR 第 6(1)(b) 條（履行契約 / 使用者請求）。
          </li>
          <li>
            <strong>使用者主動提交建議或新增內容</strong>：你主動使用「使用者提交」功能時，視為
            同意本站處理你所提交的內容，依 GDPR 第 6(1)(a) 條（同意）。
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">4. Cookie 與追蹤技術</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>本站目前未使用任何分析或行銷用途的 Cookie</strong>（例如 Google Analytics
            或其他類似的追蹤工具）。
          </li>
          <li>
            本站僅使用 Supabase Auth 維持登入狀態所必要的 session 機制（cookie / local storage），
            以及維持主題偏好（淺色／深色）的本機儲存。此類使用屬技術必要範疇，不在德國電信電信
            媒體資料保護法（TDDDG）的同意義務範圍內。
          </li>
          <li>
            若本站未來加裝任何分析或追蹤工具，將於本段落補充說明，並依法建立對應的同意機制。
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">5. 資料接收者與第三方服務</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Google</strong>：提供 OAuth 登入服務，本站不會取得或儲存你的 Google 密碼。</li>
          <li>
            <strong>Supabase</strong>：提供資料庫（PostgreSQL）與 Storage（照片/頭像儲存）服務，
            作為本站的資料處理者（Data Processor），並以資料庫層級的 Row Level Security 控管
            存取權限。
          </li>
          <li><strong>GitHub Pages</strong>：提供本站靜態網站託管服務。</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">6. 跨境傳輸</h2>
        <p>
          本站使用的 Supabase 與 Google 服務，其資料處理可能涉及歐盟境外的伺服器或機構。此類
          跨境傳輸依各服務商自身的合規機制處理（例如標準合約條款 SCC）。本站作為使用這些服務的
          一方，建議你進一步參閱
          {' '}<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-burgundy">Supabase 隱私政策</a>
          {' '}與{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-burgundy">Google 隱私權政策</a>
          {' '}以了解詳情。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">7. 資料保存期限</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>討論區貼文（商業類：二手交易／租房）</strong>：發布後 90 天自動下架，你可於
            「我的貼文」自行續期；<strong>討論類貼文</strong>（一般／學習／長居／美食／台灣餐廳）
            則永久保留，不會自動下架。
          </li>
          <li>
            <strong>學校評價</strong>：長期保留，以維持評價系統的參考價值；評價發布後不可修改，
            如需更正請自行刪除後重新發布。你可隨時在「我的貼文」自行刪除。
          </li>
          <li>
            <strong>刪除帳號</strong>：本站目前僅有前端 anon key 權限，技術上無法從 client 端
            真正刪除你的 Google 登入紀錄本身。點擊「刪除帳號」後，系統會<strong>立即清空</strong>
            你的顯示名稱與頭像（自助匿名化），並將此請求記錄 7 天寬限期——期間你若重新登入，
            系統會詢問是否要恢復帳號；超過 7 天未恢復，此請求即視為定案、不再提示，但技術上
            你的 Google 登入紀錄本身仍存在於 Google／Supabase Auth 系統。如需徹底刪除所有紀錄
            （包含登入資料），請透過下方「9. 聯絡窗口」聯繫站方協助手動處理。
          </li>
          <li>
            <strong>使用者產生內容</strong>（評價、貼文、留言）：帳號刪除後，內容本身會保留（不再
            顯示與你的關聯），因為這些內容對其他使用者仍具參考價值。
          </li>
          <li>
            <strong>檢舉紀錄</strong>：由站方視處理情況保留或清除，不對外公開。
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">8. 你的權利</h2>
        <p className="mb-2">依 GDPR 第 15–22 條，你就個人資料享有以下權利：</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>查詢權</strong>：查詢本站是否處理你的個人資料，以及處理的細節。</li>
          <li><strong>更正權</strong>：你可隨時於「編輯個人資料」頁面自行更新顯示名稱與頭像。</li>
          <li>
            <strong>刪除權（被遺忘權）</strong>：對應本站的「刪除帳號」自助功能（見上方第 7 節保存
            期限說明），以及技術限制下需透過站方協助的徹底刪除管道。
          </li>
          <li><strong>限制處理權</strong>：你可要求限制特定資料的處理方式。</li>
          <li><strong>資料可攜權</strong>：你可要求以結構化格式取得你的個人資料。</li>
          <li><strong>反對權</strong>：你可反對特定的資料處理行為。</li>
          <li><strong>撤回同意權</strong>：對於基於同意而進行的處理（如使用者提交功能），你可隨時撤回同意。</li>
        </ul>
        <p className="mt-2">
          如需行使上述任何權利，請透過下方「9. 聯絡窗口」與站方聯繫。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">9. 聯絡窗口</h2>
        <p>
          若你對個人資料的處理有任何疑問，或需要協助行使上述權利（包含徹底刪除帳號紀錄），
          請透過{' '}
          <a
            href="https://github.com/si-kui-a/study-in-germany/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-burgundy"
          >
            GitHub 專案頁面提出 Issue
          </a>
          {' '}與我們聯繫。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">10. 未來贊助功能預留條款</h2>
        <p>
          若本網站提供贊助或支持連結，相關付款程序由第三方服務商（例如 Buy Me a Coffee、Ko-fi）
          直接提供與處理。使用者點擊贊助連結後，將導向該服務商之網站或介面完成付款，付款相關資料
          （如姓名、電子郵件、付款識別資訊、交易金額）由該服務商依其自身之隱私政策收集、處理及
          保存，本網站不會接觸、儲存或傳輸上述資料。
        </p>
        <p className="mt-2">
          本網站建議使用者於使用第三方贊助服務前，先行閱讀該服務商之隱私政策。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-content-primary">11. 服務性質聲明</h2>
        <p>
          本網站目前為開源資訊網站，未提供付費內容或訂閱功能。若未來新增贊助、會員、數位商品或
          其他收費服務，相關使用規則、退款、存取權限與限制條件將於更新後公告，並適用當時版本之
          服務條款。
        </p>
      </section>
    </article>
  );
}
