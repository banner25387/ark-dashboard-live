/* 全景頁 v2（任務單 C3b）：三欄流程主畫面（地圖索引 → 攻略流程卡 → 走一趟）＋全景格分頁（無關係線）＋時間軸視圖（任務單 C4：直播集數＋驗證事件＋地圖進度排在同一條垂直時間軸上）。
 * 純前端、無套件、無 build；file:// 可開（資料由 island_data.js 內嵌）。
 * 資料契約：任務單/2026-10-27_全景頁JSON契約.md v1.4。本檔只讀 window.ISLAND_DATA；不用 links 畫圖。
 * 模組層只定義函式與字典，不碰 DOM；node 載入時只輸出 buildSteps／buildTimeline（供 tests/test_island_steps.py、tests/test_island_timeline.py）。
 */
(function () {
  "use strict";

  /* ---------- 介面字串（全部集中在此；ja 缺鍵回退 zh） ---------- */
  var I18N = {
    zh: {
      title: "ARK 全景",
      back_to_list: "← 清單（離線 wiki 首頁）",
      lang_btn: "日本語",
      view_flow: "流程", view_grid: "全景", view_timeline: "時間軸",
      stats_title: "驗證統計",
      v_l3: "已實戰 L3", v_l2: "試過 L2", v_l1: "來源核對 L1", v_none: "未驗證",
      idx_title: "地圖索引", idx_sub: "{maps} 張地圖／{targets} 個目標。選一張地圖，看它的攻略流程。",
      current: "目前所在",
      card_title: "攻略流程", card_hint: "在左欄選一張地圖。",
      species_count: "物種", target_count: "目標", done_count: "已實戰",
      sec_cave: "① 洞窟（先去）", sec_artifact: "② Artifact（拿到）", sec_boss: "③ Boss（點一列走一趟 →）",
      rel_produces: "產出：{list}", rel_in_cave: "在 {cave}", cave_unknown: "洞窟未確認",
      rel_boss: "需 {n} 個 Artifact・推薦 {m} 種",
      empty_targets: "這張圖還沒有攻略目標。",
      empty_sec_cave: "這張圖沒有洞窟資料。", empty_sec_artifact: "這張圖沒有 Artifact 資料。", empty_sec_boss: "這張圖沒有 Boss 資料。",
      empty_unreleased: "此圖 ASA 尚未推出。", empty_unowned: "此圖尚未購買，物種不入圖鑑分母。",
      walk_title: "走一趟", walk_hint: "點中欄任一列看詳情；點 Boss 列會在這裡列出「要打它得先做什麼」。",
      steps_n: "共 {n} 步", step_no: "第 {n} 步",
      prev: "上一步", next: "下一步", finished: "走完了",
      step_cave: "洞窟", step_artifact: "Artifact", step_species: "物種", step_tribute: "物資", step_boss: "Boss",
      st_go: "去 {cave}　拿 Artifact×{n}", st_find: "找 {artifact}（洞窟未確認）", st_prepare: "準備 {sp}",
      st_tribute: "備齊召喚物資", st_fight: "打 {boss}{diff}",
      spawn_maps: "出沒：{list}", tamed_n: "已馴 {n}", not_in_species: "不在生物清單",
      unknown: "未確認", unknown_ref: "?（查無）", none: "—",
      detail_title: "詳情", detail_toggle: "詳情",
      to_flow: "看流程",
      grid_hint: "點地圖格展開物種；點格內節點或物種看詳情；「看流程」切到流程視圖。",
      legend_title: "圖例", legend_status: "地圖狀態", legend_verif: "驗證", legend_nodes: "節點",
      node_boss: "Boss（Γ／β／α 三色；灰＝單一難度）", node_cave: "洞窟", node_artifact: "Artifact",
      generated: "產生日", version: "版本", mock: "假資料",
      map: "地圖", kind: "類型", status: "狀態", release: "ASA 推出", started: "開始", finished_at: "完成",
      boss_progress: "Boss 進度",
      targets: "本圖目標", species_list: "本圖物種", expand: "展開物種", collapse: "收合",
      type: "類型", difficulty: "難度", artifacts: "所需 Artifact", produces: "產出 Artifact",
      cave: "所在洞窟", recommended: "推薦物種", tribute: "召喚物資", coord: "座標",
      source: "來源", confidence: "信心", checked: "查證日", verification: "驗證",
      v_date: "日期", v_episode: "集數", v_note: "備註",
      category: "分類", tameable: "可馴服", yes: "是", no: "否", maps: "出沒地圖",
      tamed_count: "存活馴服數", page: "物種頁", open_page: "開啟物種頁", no_page: "無頁",
      episodes: "直播集數",
      t_boss: "Boss", t_cave: "洞窟", t_artifact: "Artifact",
      st_未推出: "未推出", st_未開始: "未開始", st_進行中: "進行中", st_完成: "完成", st_未購買: "未購買",
      kd_故事圖: "故事圖", kd_非正史圖: "非正史圖", kd_合作圖: "合作圖", kd_第三方DLC: "第三方 DLC",
      err_no_data: "資料未載入：window.ISLAND_DATA 未定義。請確認 island_data.js 與本頁同資料夾，且在 island.js 之前載入。",
      err_missing: "資料缺頂層鍵：",
      err_title: "全景頁無法顯示",
      stress: "壓力測試模式（每圖物種補到 50 種）",
      // 使用說明浮層（任務單 C3d 第四節；繁中 2026-11-01 定稿）
      help_btn: "使用說明", help_title: "這頁怎麼用", help_close: "知道了",
      help_what_h: "這是什麼",
      help_what: "ARK: Survival Ascended 各張地圖的攻略流程表：每張圖的洞窟、Artifact、Boss，以及打一隻 Boss 之前要先做的事。資料離線內建，不需連網。",
      help_cols_h: "三欄怎麼看",
      help_cols_1: "左欄選一張地圖。",
      help_cols_2: "中欄顯示那張圖的三段：① 洞窟、② Artifact、③ Boss。點任一列，右欄顯示詳情。",
      help_cols_3: "點 ③ 的 Boss 列，右欄變成「走一趟」：從拿 Artifact、準備生物、備物資到開打，一步一步列出。",
      help_walk_h: "走一趟",
      help_walk: "按「下一步」或鍵盤 ← →。目前這一步要去的洞窟或要拿的 Artifact，會在中欄亮起；走過的變綠。",
      help_dots_h: "色點意義",
      help_dot_l3: "已實戰成功（L3）", help_dot_l2: "試過但還沒成功（L2）", help_dot_l1: "只核對過資料來源（L1）", help_dot_none: "未驗證",
      help_grid_h: "全景分頁",
      help_grid: "上方切到「全景」可一次看 15 張圖。點格子展開該圖物種，點節點看詳情，「看流程」跳回三欄。",
      help_url_h: "網址可以分享",
      help_url: "選到哪張圖、哪隻 Boss、走到第幾步都記在網址裡。複製網址給別人，打開就是同一畫面。",
      help_tl_h: "時間軸",
      help_tl: "上方切到「時間軸」，直播集數、驗證事件、地圖進度依日期由舊到新排成一條線。集數列的 VOD 連結可開錄影，事件列的連結可跳到流程視圖或物種頁。沒有日期的事件集中在底部的「日期未定」區。",
      help_src_h: "資料來源",
      help_src: "Boss、洞窟、Artifact 資料整理自 ark.wiki.gg 與 kamigame，驗證級數以實際遊玩為準。看到錯誤歡迎回報。",
      // 時間軸視圖（任務單 C4）
      tl_title: "時間軸", tl_hint: "點時間軸上的項目，右側顯示詳情；側欄可依地圖篩選。",
      tl_stats_title: "時間軸統計", tl_n_episodes: "集數", tl_n_events: "驗證事件", tl_n_undated: "日期未定", tl_range: "最早～最晚",
      tl_filter: "地圖篩選", tl_all: "全部", tl_no_map_n: "{n} 集未填地圖（篩單一地圖時隱藏）",
      tl_undated: "日期未定", tl_undated_hint: "有驗證級數但還沒有日期的事件；日期補進驗證紀錄後會自動上軸。",
      tl_map_unfilled: "地圖未填", tl_empty: "還沒有時間軸資料",
      tl_k_episode: "直播集數", tl_k_event: "驗證事件", tl_k_map: "地圖進度", tl_k_release: "ASA 推出",
      tl_show_release: "顯示 ASA 推出", tl_release: "ASA 推出 {map}", tl_started: "開始 {map}", tl_finished: "完成 {map}",
      tl_ev_l3: "已馴（L3）", tl_ev_l2: "試過（L2）", tl_ev_target_l3: "已實戰 L3", tl_ev_target_l2: "試過 L2",
      tl_ep: "第 {n} 集", tl_ep_no: "集數", tl_ep_title: "標題", tl_ep_date: "日期", tl_ep_highlight: "當集重點", tl_vod: "VOD",
      tl_open_vod: "開啟 VOD", tl_no_vod: "無 VOD", tl_with_ep: "同集事件", tl_which: "事件",
      to_timeline: "在時間軸看", tl_legend: "圖例"
    },
    ja: {
      title: "ARK 全景図",
      back_to_list: "← 一覧（オフライン wiki トップ）",
      lang_btn: "繁中",
      view_flow: "フロー", view_grid: "全景", view_timeline: "タイムライン",
      stats_title: "検証の統計",
      v_l3: "実戦済 L3", v_l2: "試行 L2", v_l1: "出典照合 L1", v_none: "未検証",
      idx_title: "マップ索引", idx_sub: "{maps} マップ／{targets} 目標。マップを選ぶと攻略フローを表示。",
      current: "現在地",
      card_title: "攻略フロー", card_hint: "左でマップを選んでください。",
      species_count: "生物", target_count: "目標", done_count: "実戦済",
      sec_cave: "① 洞窟（先に行く）", sec_artifact: "② アーティファクト（入手）", sec_boss: "③ ボス（押すと手順 →）",
      rel_produces: "入手：{list}", rel_in_cave: "{cave} にある", cave_unknown: "洞窟未確認",
      rel_boss: "アーティファクト {n} 個・推奨 {m} 種",
      empty_targets: "このマップにはまだ攻略目標がありません。",
      empty_sec_cave: "このマップには洞窟のデータがありません。", empty_sec_artifact: "このマップにはアーティファクトのデータがありません。", empty_sec_boss: "このマップにはボスのデータがありません。",
      empty_unreleased: "このマップは ASA 未配信です。", empty_unowned: "このマップは未購入です。",
      walk_title: "手順を歩く", walk_hint: "中央の行を押すと詳細。ボスの行を押すと「倒すまでの手順」をここに並べます。",
      steps_n: "全 {n} 歩", step_no: "第 {n} 歩",
      prev: "前へ", next: "次へ", finished: "完了",
      step_cave: "洞窟", step_artifact: "アーティファクト", step_species: "生物", step_tribute: "素材", step_boss: "ボス",
      st_go: "{cave} へ　アーティファクト×{n} を入手", st_find: "{artifact} を探す（洞窟未確認）", st_prepare: "{sp} を用意",
      st_tribute: "召喚素材を揃える", st_fight: "{boss}{diff} を倒す",
      spawn_maps: "生息：{list}", tamed_n: "テイム済 {n}", not_in_species: "生物一覧にない",
      unknown: "未確認", unknown_ref: "?（不明）", none: "—",
      detail_title: "詳細", detail_toggle: "詳細",
      to_flow: "フローを見る",
      grid_hint: "マップを押すと生物を展開。ノードや生物を押すと詳細。「フローを見る」でフロー表示へ。",
      legend_title: "凡例", legend_status: "マップ状態", legend_verif: "検証", legend_nodes: "ノード",
      node_boss: "ボス（Γ／β／α 三色；灰＝単一難度）", node_cave: "洞窟", node_artifact: "アーティファクト",
      generated: "生成日", version: "バージョン", mock: "ダミーデータ",
      map: "マップ", kind: "種別", status: "状態", release: "ASA リリース", started: "開始", finished_at: "完了",
      boss_progress: "ボス進捗",
      targets: "このマップの目標", species_list: "このマップの生物", expand: "生物を展開", collapse: "閉じる",
      type: "種別", difficulty: "難度", artifacts: "必要アーティファクト", produces: "入手アーティファクト",
      cave: "洞窟", recommended: "推奨生物", tribute: "召喚素材", coord: "座標",
      source: "出典", confidence: "確度", checked: "確認日", verification: "検証",
      v_date: "日付", v_episode: "回", v_note: "備考",
      category: "分類", tameable: "テイム可", yes: "はい", no: "いいえ", maps: "生息マップ",
      tamed_count: "生存テイム数", page: "生物ページ", open_page: "生物ページを開く", no_page: "ページなし",
      episodes: "配信回",
      t_boss: "ボス", t_cave: "洞窟", t_artifact: "アーティファクト",
      st_未推出: "未配信", st_未開始: "未着手", st_進行中: "進行中", st_完成: "完了", st_未購買: "未購入",
      kd_故事圖: "ストーリー", kd_非正史圖: "非正史", kd_合作圖: "コラボ", kd_第三方DLC: "サードパーティ DLC",
      err_no_data: "データ未読込：window.ISLAND_DATA が未定義です。island_data.js が同じフォルダにあり island.js より先に読み込まれているか確認してください。",
      err_missing: "データに欠けているトップレベルキー：",
      err_title: "全景図を表示できません",
      stress: "負荷テストモード（各マップ 50 種まで複製）",
      // 使い方オーバーレイ（C3d；2026-11-01 收稿定稿）
      help_btn: "使い方", help_title: "このページの使い方", help_close: "わかりました",
      help_what_h: "このページについて",
      help_what: "ARK: Survival Ascended の各マップの攻略フロー表です。マップごとの洞窟、アーティファクト、ボス、そしてボスに挑む前にやっておくことをまとめています。データは内蔵済みのため、ネット接続なしで使えます。",
      help_cols_h: "3 列の見方",
      help_cols_1: "左の列でマップを選びます。",
      help_cols_2: "中央の列にそのマップの 3 段（① 洞窟、② アーティファクト、③ ボス）を表示します。どの行を押しても、右の列に詳細が出ます。",
      help_cols_3: "③ のボスの行を押すと、右の列が「手順を歩く」に変わります。アーティファクトの入手、生物の用意、召喚素材の準備から戦闘まで、一歩ずつ並べます。",
      help_walk_h: "手順を歩く",
      help_walk: "「次へ」かキーボードの ← → で進みます。今の手順で行く洞窟や取るアーティファクトが中央の列で光り、済んだものは緑になります。",
      help_dots_h: "色の意味",
      help_dot_l3: "実戦で成功済み（L3）", help_dot_l2: "試行済み・未成功（L2）", help_dot_l1: "出典のみ照合済み（L1）", help_dot_none: "未検証",
      help_grid_h: "全景タブ",
      help_grid: "上部で「全景」に切り替えると、15 マップを一度に見られます。マップを押すと生物を展開、ノードを押すと詳細、「フローを見る」で 3 列表示に戻ります。",
      help_url_h: "URL で共有できます",
      help_url: "選んだマップ、ボス、何歩目まで進んだかは URL に記録されます。URL をコピーして送れば、相手も同じ画面を開けます。",
      help_tl_h: "タイムライン",
      help_tl: "上部で「タイムライン」に切り替えると、配信回、検証イベント、マップ進捗を日付の古い順に一本の線に並べます。配信回の VOD リンクから録画を開け、イベントからフロー表示や生物ページへ移動できます。日付のないイベントは下部の「日付未定」にまとめて表示します。",
      help_src_h: "データの出典",
      help_src: "ボス、洞窟、アーティファクトのデータは ark.wiki.gg と kamigame をもとに整理し、検証レベルは実際のプレイを基準にしています。誤りに気づいたらお知らせください。",
      // タイムライン表示（C4）
      tl_title: "タイムライン", tl_hint: "タイムライン上の項目を押すと右に詳細。サイドバーでマップ別に絞り込めます。",
      tl_stats_title: "タイムラインの統計", tl_n_episodes: "配信回", tl_n_events: "検証イベント", tl_n_undated: "日付未定", tl_range: "最古～最新",
      tl_filter: "マップで絞り込み", tl_all: "すべて", tl_no_map_n: "{n} 回はマップ未記入（マップ絞り込み時は非表示）",
      tl_undated: "日付未定", tl_undated_hint: "検証レベルはあるが日付がまだないイベント。検証記録に日付を入れると自動で軸に載ります。",
      tl_map_unfilled: "マップ未記入", tl_empty: "タイムラインのデータはまだありません",
      tl_k_episode: "配信回", tl_k_event: "検証イベント", tl_k_map: "マップ進捗", tl_k_release: "ASA リリース",
      tl_show_release: "ASA リリース日を表示", tl_release: "ASA リリース {map}", tl_started: "{map} 開始", tl_finished: "{map} 完了",
      tl_ev_l3: "テイム済（L3）", tl_ev_l2: "試行（L2）", tl_ev_target_l3: "実戦済 L3", tl_ev_target_l2: "試行 L2",
      tl_ep: "第 {n} 回", tl_ep_no: "配信回", tl_ep_title: "タイトル", tl_ep_date: "日付", tl_ep_highlight: "この回の要点", tl_vod: "VOD",
      tl_open_vod: "VOD を開く", tl_no_vod: "VOD なし", tl_with_ep: "同じ回のイベント", tl_which: "イベント",
      to_timeline: "タイムラインで見る", tl_legend: "凡例"
    }
  };
  var REQUIRED_KEYS = ["meta", "maps", "targets", "species", "species_by_map", "links", "verification", "episodes"];
  var STATUS_CLASS = { "未推出": "st-unreleased", "未開始": "st-notstarted", "進行中": "st-active", "完成": "st-done", "未購買": "st-unowned" };
  var LS_KEY = "ark_island_lang";
  var HELP_KEY = "island.help.seen"; // 使用說明浮層：首次開頁自動彈一次後寫入，之後只靠「？」開（不記進網址）
  var VIEWS = ["flow", "grid", "timeline"];
  var DATE_RE = /^\d{4}-\d{2}-\d{2}/;

  /* ---------- 純函式（不碰 DOM；node 也能跑） ---------- */
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function trIn(lang, key) {
    var d = I18N[lang] || I18N.zh;
    if (has(d, key)) return d[key];
    if (has(I18N.zh, key)) return I18N.zh[key];
    return key;
  }
  function fmt(s, vars) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return has(vars, k) ? String(vars[k]) : m; });
  }
  function jpOf(obj) { // name_jp；空值與資料層的「未確認」佔位都視為缺值（README 顯示名慣例）
    var jp = obj && obj.name_jp ? String(obj.name_jp) : "";
    return jp === "未確認" ? "" : jp;
  }
  function nameIn(obj, lang) { // 名稱欄位：ja 取 name_jp，缺值回退 name
    if (!obj) return "";
    var jp = jpOf(obj);
    return (lang === "ja" && jp) ? jp : (obj.name || "");
  }
  function levelOf(data, key) {
    var v = data && data.verification ? data.verification[key] : null;
    if (!v || !v.level) return "";
    var lv = String(v.level).toUpperCase();
    return (lv === "L1" || lv === "L2" || lv === "L3") ? lv : "";
  }

  /**
   * 走一趟步驟規則（任務單 C3b 第 5 條，單一純函式）。
   * 回傳陣列，每步 {kind, ids, title, sub, vkey}（另附 page／species 給畫面用）：
   *   a. 依 boss.artifacts 以洞窟分組（首次出現順序）：同洞窟多個 Artifact 合成一步，ids＝[洞窟 id, …Artifact id]，vkey＝洞窟 id；
   *      cave_id 空（或 Artifact／洞窟 id 查無）的 Artifact 各自一步，vkey＝Artifact id。
   *   b. 依 recommended_species 順序每種一步；不在 species 仍成一步，副標「不在生物清單」。
   *   c. 一步「備齊召喚物資」，副標＝tribute（空則「未確認」）。
   *   d. 最後一步「打 <Boss> <難度>」，副標＝信心、查證日期。
   */
  function buildSteps(boss, data, lang) {
    lang = lang || "zh";
    var tr = function (k) { return trIn(lang, k); };
    var T = {}, M = {};
    (data.targets || []).forEach(function (x) { T[x.id] = x; });
    (data.maps || []).forEach(function (x) { M[x.id] = x; });
    var species = data.species || {};
    var steps = [];

    var groups = [];       // {key, cave, caveId, artifacts:[ids]}
    var byKey = {};
    (boss.artifacts || []).forEach(function (aid) {
      var a = T[aid] || null;
      var caveId = a && a.cave_id ? a.cave_id : "";
      if (!caveId) {
        var aName = a ? nameIn(a, lang) : (aid + " " + tr("unknown_ref"));
        steps.push({ kind: "artifact", ids: [aid], vkey: aid,
          title: fmt(tr("st_find"), { artifact: aName }),
          sub: a && a.coord ? a.coord : tr("unknown") });
        return;
      }
      if (!has(byKey, caveId)) {
        byKey[caveId] = { key: caveId, caveId: caveId, cave: T[caveId] || null, artifacts: [] };
        groups.push(byKey[caveId]);
        steps.push(null); // 佔位，保持首次出現順序
        byKey[caveId].placeholder = steps.length - 1;
      }
      byKey[caveId].artifacts.push(aid);
    });
    groups.forEach(function (g) {
      var cave = g.cave;
      var caveName = cave ? nameIn(cave, lang) : (g.caveId + " " + tr("unknown_ref"));
      var names = g.artifacts.map(function (aid) { return T[aid] ? nameIn(T[aid], lang) : aid + " " + tr("unknown_ref"); });
      var sub = names.join("、");
      if (cave && cave.coord) sub += "　" + cave.coord;
      steps[g.placeholder] = { kind: "cave", ids: [g.caveId].concat(g.artifacts), vkey: g.caveId,
        title: fmt(tr("st_go"), { cave: caveName, n: g.artifacts.length }), sub: sub };
    });

    (boss.recommended_species || []).forEach(function (sp) {
      var s = has(species, sp) ? species[sp] : null;
      var key = "species:" + sp;
      var title, sub, page = "";
      if (s) {
        var jp = jpOf(s);
        var label = (lang === "ja" && jp) ? (jp + "（" + sp + "）") : (sp + (jp ? "（" + jp + "）" : ""));
        title = fmt(tr("st_prepare"), { sp: label });
        var mapNames = (s.maps || []).map(function (mid) { return M[mid] ? nameIn(M[mid], lang) : mid; });
        sub = fmt(tr("spawn_maps"), { list: mapNames.length ? mapNames.join("、") : tr("none") });
        if (s.tamed_count) sub += "・" + fmt(tr("tamed_n"), { n: s.tamed_count });
        page = s.page || "";
      } else {
        title = fmt(tr("st_prepare"), { sp: sp });
        sub = tr("not_in_species");
      }
      steps.push({ kind: "species", ids: [key], vkey: key, title: title, sub: sub, page: page, species: sp });
    });

    steps.push({ kind: "tribute", ids: [boss.id], vkey: boss.id, title: tr("st_tribute"), sub: boss.tribute || tr("unknown") });
    steps.push({ kind: "boss", ids: [boss.id], vkey: boss.id,
      title: fmt(tr("st_fight"), { boss: nameIn(boss, lang), diff: boss.difficulty ? " " + boss.difficulty : "" }),
      sub: tr("confidence") + " " + (boss.confidence || tr("unknown")) + "・" + tr("checked") + " " + (boss.checked || tr("unknown")) });
    return steps;
  }

  /**
   * 時間軸資料（任務單 C4 第 3～7 條，單一純函式；不碰 DOM、不帶語言字串，顯示字由畫面層翻）。
   * 只讀契約既有鍵 episodes／verification／maps／targets／species。
   * opts：{ mapId: ""（全部）| map id（篩選）, showRelease: true }。
   * 回傳 { items, groups, undated, stats, byId }：
   *   items   ＝ 上軸的項目（有日期），由舊到新；同日再依 kind 序（地圖進度 → 集數 → 事件）。
   *   groups  ＝ [{ month: "2026-02", days: [{ date: "2026-02-16", items: [...] }] }]，月份只列有項目的月。
   *   undated ＝ 沒有日期的項目（目前＝L2／L3 但 date 空的驗證事件；集數無日期也會落到這裡）。
   *   stats   ＝ { episodes, events, undated, mapProgress, first, last, episodesNoMap }（episodesNoMap＝篩單一地圖時被隱藏的未填地圖集數）。
   * 項目：
   *   集數   { kind:"episode", id:"ep:<no>", date, no, title, highlight, vod, map_id }
   *   事件   { kind:"event", id:"ev:<verification 鍵>", key, date, level, episode, note, ref:"species"|"target", species?, target? }
   *            只收 level L2／L3（L1 為攻略目標表自動推，171 筆會淹沒軸）。
   *   地圖   { kind:"map", id:"mp:<map id>:<which>", which:"started"|"finished"|"release", date, map_id }
   */
  function buildTimeline(data, opts) {
    opts = opts || {};
    var mapId = opts.mapId || "";
    var showRelease = opts.showRelease !== false;
    var M = {}, T = {};
    (data.maps || []).forEach(function (m) { M[m.id] = m; });
    (data.targets || []).forEach(function (x) { T[x.id] = x; });
    var species = data.species || {};
    var KIND_ORDER = { map: 0, episode: 1, event: 2 };
    var all = [], undated = [], byId = {};
    var episodesNoMap = 0;

    (data.episodes || []).forEach(function (e) {
      if (mapId && e.map_id !== mapId) { if (!e.map_id) episodesNoMap += 1; return; }
      all.push({ kind: "episode", id: "ep:" + e.no, date: e.date || "", no: e.no, title: e.title || "", highlight: e.highlight || "", vod: e.vod || "", map_id: e.map_id || "" });
    });

    Object.keys(data.verification || {}).sort().forEach(function (key) {
      var v = data.verification[key];
      var lv = v && v.level ? String(v.level).toUpperCase() : "";
      if (lv !== "L2" && lv !== "L3") return;
      var item = { kind: "event", id: "ev:" + key, key: key, date: v.date || "", level: lv, episode: v.episode ? String(v.episode) : "", note: v.note || "" };
      if (key.indexOf("species:") === 0) {
        item.ref = "species"; item.species = key.slice("species:".length);
        var sp = species[item.species] || null;
        if (mapId && !(sp && (sp.maps || []).indexOf(mapId) >= 0)) return;
      } else {
        item.ref = "target"; item.target = key;
        var tg = T[key] || null;
        if (mapId && !(tg && tg.map_id === mapId)) return;
      }
      all.push(item);
    });

    (data.maps || []).forEach(function (m) {
      if (mapId && m.id !== mapId) return;
      ["started", "finished", "release"].forEach(function (which) {
        if (!m[which]) return;
        if (which === "release" && !showRelease) return;
        all.push({ kind: "map", id: "mp:" + m.id + ":" + which, which: which, date: m[which], map_id: m.id });
      });
    });

    var dated = [];
    all.forEach(function (it) {
      byId[it.id] = it;
      if (DATE_RE.test(it.date)) dated.push(it); else undated.push(it);
    });
    dated.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      if (KIND_ORDER[a.kind] !== KIND_ORDER[b.kind]) return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      if (a.kind === "episode") return a.no - b.no;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

    var groups = [], curMonth = null, curDay = null;
    dated.forEach(function (it) {
      var month = it.date.slice(0, 7), day = it.date.slice(0, 10);
      if (!curMonth || curMonth.month !== month) { curMonth = { month: month, days: [] }; groups.push(curMonth); curDay = null; }
      if (!curDay || curDay.date !== day) { curDay = { date: day, items: [] }; curMonth.days.push(curDay); }
      curDay.items.push(it);
    });

    var count = function (lst, kind) { return lst.filter(function (x) { return x.kind === kind; }).length; };
    var stats = {
      episodes: count(dated, "episode"),
      events: count(dated, "event"),
      undated: undated.length,
      mapProgress: dated.filter(function (x) { return x.kind === "map" && x.which !== "release"; }).length,
      first: dated.length ? dated[0].date.slice(0, 10) : "",
      last: dated.length ? dated[dated.length - 1].date.slice(0, 10) : "",
      episodesNoMap: episodesNoMap
    };
    return { items: dated, groups: groups, undated: undated, stats: stats, byId: byId };
  }

  /* node（unittest 走 subprocess）只要純函式；瀏覽器才往下跑 */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { buildSteps: buildSteps, buildTimeline: buildTimeline, I18N: I18N, nameIn: nameIn, jpOf: jpOf, levelOf: levelOf };
    return;
  }

  /* ---------- 以下為瀏覽器端 ---------- */
  var T0 = (window.performance && performance.now) ? performance.now() : Date.now();

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") e.className = v;
        else if (k === "text") e.textContent = v;
        else e.setAttribute(k, v);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return e;
  }
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* 私密模式等 */ } }
  function readQuery() {
    var out = {};
    var q = window.location.search.replace(/^\?/, "");
    if (!q) return out;
    q.split("&").forEach(function (p) {
      if (!p) return;
      var i = p.indexOf("=");
      var k = i < 0 ? p : p.slice(0, i), v = i < 0 ? "" : p.slice(i + 1);
      try { out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " ")); } catch (e) { out[k] = v; }
    });
    return out;
  }
  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/["\\]/g, "\\$&");
  }

  /* ---------- 狀態 ---------- */
  var S = {
    lang: "zh",
    view: "flow",
    mapId: null,        // 流程：選中的圖
    targetId: null,     // 流程：選中的目標（Boss 則進走一趟）
    step: 0,            // 走一趟目前步（0 起算）
    focus: null,        // 全景：{kind:"map"|"target"|"species", id}
    expanded: {},       // 全景：map id -> true
    focusSig: null,     // 全景：設焦點當下的 mapId|targetId（切回全景時判斷焦點是否陳舊）
    error: null,        // 失敗畫面：[{key, tail}]，切語言時依此重繪
    tlMap: "",          // 時間軸：地圖篩選（""＝全部；網址 map=）
    tlSel: null,        // 時間軸：選中項目 id（"ep:45"／"ev:species:Rex"／"mp:ragnarok:started"；網址 ep=／ev=）
    tlRelease: true,    // 時間軸：顯示 ASA 推出小標（側欄開關，不進網址）
    stress: false,
    rendered: { flow: false, grid: false, timeline: false }
  };
  function t(key) { return trIn(S.lang, key); }
  function tOr(prefix, raw) { // 狀態／類型等值的翻譯；查無回原文
    var k = prefix + raw;
    var d = I18N[S.lang] || I18N.zh;
    if (has(d, k)) return d[k];
    if (has(I18N.zh, k)) return I18N.zh[k];
    return raw || t("none");
  }
  function nameOf(obj) { return nameIn(obj, S.lang); }
  function subName(obj) { // 另一語的名稱當副標；缺值就不出
    var jp = jpOf(obj);
    if (!jp) return "";
    return (S.lang === "ja") ? (obj.name || "") : jp;
  }
  function speciesName(key) {
    var jp = jpOf(D.species[key]);
    return (S.lang === "ja" && jp) ? jp : key;
  }
  function targetLabel(tg) { return nameOf(tg) + (tg.difficulty ? " " + tg.difficulty : ""); }
  function numOr(v) { return (v === null || v === undefined) ? t("none") : String(v); }

  /* ---------- 資料載入與驗證 ---------- */
  var D = null;
  var IDX = { map: {}, target: {}, targetsByMap: {} };

  function showError(msgs) { // msgs＝[{key, tail}]：存鍵不存字，切語言時 setLang 依 S.error 重繪
    S.error = msgs;
    var box = $("#error");
    box.innerHTML = "";
    var card = el("div", { class: "error", role: "alert" }, [el("h2", { text: t("err_title") })]);
    msgs.forEach(function (m) { card.appendChild(el("p", { text: t(m.key) + (m.tail || "") })); });
    box.appendChild(card);
    box.hidden = false;
    $("#view-flow").hidden = true;
    $("#view-grid").hidden = true;
    $("#view-switch").hidden = true;
  }

  function loadData() {
    if (typeof window.ISLAND_DATA !== "object" || window.ISLAND_DATA === null) {
      showError([{ key: "err_no_data" }]);
      return false;
    }
    var missing = REQUIRED_KEYS.filter(function (k) { return !has(window.ISLAND_DATA, k); });
    if (missing.length) {
      showError([{ key: "err_missing", tail: missing.join(", ") }]);
      return false;
    }
    D = window.ISLAND_DATA;
    if (S.stress) applyStress();
    D.maps.forEach(function (m) { IDX.map[m.id] = m; IDX.targetsByMap[m.id] = []; });
    D.targets.forEach(function (tg) {
      IDX.target[tg.id] = tg;
      if (IDX.targetsByMap[tg.map_id]) IDX.targetsByMap[tg.map_id].push(tg);
    });
    return true;
  }

  // ?stress=1：記憶體內把每圖物種補到 50 種（契約第五節）；不寫進檔。
  function applyStress() {
    D.maps.forEach(function (m) {
      var lst = D.species_by_map[m.id] = (D.species_by_map[m.id] || []).slice();
      var n = 0;
      while (lst.length < 50) {
        n += 1;
        var key = "Mock " + m.name + " " + n;
        D.species[key] = { name_jp: "", category: "Mock", tameable: (n % 3 !== 0), maps: [m.id], difficulty: "", tamed_count: 0, page: "" };
        lst.push(key);
      }
      m.species_count = lst.length;
    });
  }

  /* ---------- 驗證查詢 ---------- */
  function verifOf(key) { return (D.verification && D.verification[key]) || null; }
  function verifClass(key) { var lv = levelOf(D, key); return lv ? "v-" + lv.toLowerCase() : "v-none"; }
  function verifLabel(key) {
    var lv = levelOf(D, key);
    return lv === "L3" ? t("v_l3") : lv === "L2" ? t("v_l2") : lv === "L1" ? t("v_l1") : t("v_none");
  }
  function verifBadge(key) { return el("span", { class: "vbadge " + verifClass(key), text: verifLabel(key) }); }
  function verifCounts() {
    var c = { l3: 0, l2: 0, l1: 0, none: 0 };
    function count(key) {
      var lv = levelOf(D, key);
      if (lv === "L3") c.l3 += 1; else if (lv === "L2") c.l2 += 1; else if (lv === "L1") c.l1 += 1; else c.none += 1;
    }
    Object.keys(D.species).forEach(function (k) { count("species:" + k); });
    D.targets.forEach(function (tg) { count(tg.id); });
    return c;
  }
  function renderStatsInto(box) {
    box.innerHTML = "";
    var c = verifCounts();
    box.appendChild(el("h2", { text: t("stats_title") }));
    box.appendChild(el("div", { class: "stat-row" }, [
      el("span", { class: "stat" }, [el("span", { class: "legend-ring v-l3" }), t("v_l3") + " " + c.l3]),
      el("span", { class: "stat" }, [el("span", { class: "legend-ring v-l2" }), t("v_l2") + " " + c.l2]),
      el("span", { class: "stat" }, [el("span", { class: "legend-ring v-l1" }), t("v_l1") + " " + c.l1]),
      el("span", { class: "stat" }, [el("span", { class: "legend-ring v-none" }), t("v_none") + " " + c.none])
    ]));
    if (S.stress) box.appendChild(el("p", { class: "meta", text: t("stress") }));
  }
  function renderMetaInto(box) {
    box.innerHTML = "";
    var meta = D.meta || {};
    var ver = String(meta.version || "");
    box.appendChild(el("div", {}, [t("generated") + "：" + (meta.generated_at || t("none"))]));
    box.appendChild(el("div", {}, [t("version") + "：" + (ver || t("none")) + " ", ver.indexOf("-mock") >= 0 ? el("span", { class: "mock", text: "（" + t("mock") + "）" }) : null]));
  }

  /* ---------- 網址狀態（?view=&map=&target=&step=；時間軸 ?view=timeline&map=&ep=&ev=；語言只存 localStorage） ---------- */
  function writeUrl() {
    var parts = ["view=" + S.view];
    if (S.view === "timeline") {
      if (S.tlMap) parts.push("map=" + encodeURIComponent(S.tlMap));
      if (S.tlSel && S.tlSel.indexOf("ep:") === 0) parts.push("ep=" + encodeURIComponent(S.tlSel.slice(3)));
      else if (S.tlSel && S.tlSel.indexOf("ev:") === 0) parts.push("ev=" + encodeURIComponent(S.tlSel.slice(3)));
    } else {
      if (S.mapId) parts.push("map=" + encodeURIComponent(S.mapId));
      if (S.targetId) parts.push("target=" + encodeURIComponent(S.targetId));
      if (S.targetId && IDX.target[S.targetId] && IDX.target[S.targetId].type === "boss" && S.step > 0) parts.push("step=" + (S.step + 1));
    }
    if (S.stress) parts.push("stress=1");
    var url = window.location.pathname + "?" + parts.join("&") + window.location.hash;
    try { window.history.replaceState(null, "", url); } catch (e) { /* 某些 file:// 環境不允許；狀態仍在記憶體 */ }
  }
  function readUrlState() {
    var q = readQuery();
    S.stress = q.stress === "1";
    S.view = VIEWS.indexOf(q.view) >= 0 ? q.view : "flow";
    return q;
  }

  /* ---------- 共用：目標詳情（流程右欄、全景側欄、時間軸側欄共用；mode＝"flow"|"grid"|"tl"；"tl" 的參照同 flow 走流程視圖） ---------- */
  function refBtn(mode, kind, id, label) {
    if (mode !== "grid") return el("button", { type: "button", class: "linkish", "data-act": "flow-" + kind, "data-id": id, text: label });
    return el("button", { type: "button", class: "linkish", "data-focus-kind": kind, "data-focus-id": id, text: label });
  }
  function speciesRef(mode, id) {
    var sp = D.species[id];
    if (!sp) return el("span", { text: id + " " + t("unknown_ref") });
    if (mode !== "grid") {
      return sp.page ? el("a", { href: sp.page, target: "_blank", rel: "noopener", text: speciesName(id) }) : el("span", { text: speciesName(id) });
    }
    return refBtn(mode, "species", id, speciesName(id));
  }
  function refList(mode, ids, kindOfRef) { // id 清單 → 可點名稱；查無標「?」
    if (!ids || !ids.length) return el("span", { text: t("none") });
    var ul = el("ul");
    ids.forEach(function (id) {
      if (kindOfRef === "species") ul.appendChild(el("li", {}, speciesRef(mode, id)));
      else if (kindOfRef === "map") ul.appendChild(el("li", {}, IDX.map[id] ? refBtn(mode, "map", id, nameOf(IDX.map[id])) : el("span", { text: id + " " + t("unknown_ref") })));
      else ul.appendChild(el("li", {}, IDX.target[id] ? refBtn(mode, "target", id, targetLabel(IDX.target[id])) : el("span", { text: id + " " + t("unknown_ref") })));
    });
    return ul;
  }
  function dlRow(dl, label, valueNode) {
    dl.appendChild(el("dt", { text: label }));
    dl.appendChild(el("dd", {}, typeof valueNode === "string" ? [valueNode] : valueNode));
  }
  function verifRows(dl, key, mode) {
    var v = verifOf(key);
    dlRow(dl, t("verification"), el("span", {}, [el("span", { class: "legend-ring " + verifClass(key) }), " " + verifLabel(key)]));
    if (v) {
      if (v.date) dlRow(dl, t("v_date"), v.date);
      if (v.episode) dlRow(dl, t("v_episode"), String(v.episode));
      if (v.note) dlRow(dl, t("v_note"), v.note);
      // C4 第 8 條：有 date 的 L2／L3 才在時間軸上，給一顆「在時間軸看」；時間軸自己的詳情不再給
      if (mode !== "tl" && v.date && (levelOf(D, key) === "L2" || levelOf(D, key) === "L3")) {
        dlRow(dl, t("tl_title"), el("button", { type: "button", class: "linkish", "data-act": "to-timeline", "data-key": key, text: t("to_timeline") + " →" }));
      }
    }
  }
  function sourceNode(src) {
    if (!src) return el("span", { text: t("none") });
    var parts = String(src).split(/[；;]\s*/).filter(Boolean);
    var span = el("span");
    parts.forEach(function (p, i) {
      if (i) span.appendChild(document.createTextNode("；"));
      span.appendChild(/^https?:\/\//.test(p) ? el("a", { href: p, target: "_blank", rel: "noopener", text: p }) : document.createTextNode(p));
    });
    return span;
  }
  function targetDetailDl(tg, mode) {
    var dl = el("dl");
    dlRow(dl, t("map"), IDX.map[tg.map_id] ? refBtn(mode, "map", tg.map_id, nameOf(IDX.map[tg.map_id])) : el("span", { text: tg.map_id + " " + t("unknown_ref") }));
    dlRow(dl, t("type"), t("t_" + tg.type));
    if (tg.type === "boss") dlRow(dl, t("difficulty"), tg.difficulty || t("none"));
    if (tg.type === "boss") dlRow(dl, t("artifacts"), refList(mode, tg.artifacts, "target"));
    if (tg.type === "cave") dlRow(dl, t("produces"), refList(mode, tg.artifacts, "target"));
    if (tg.type === "artifact") dlRow(dl, t("cave"), tg.cave_id ? refList(mode, [tg.cave_id], "target") : t("cave_unknown"));
    if (tg.type === "boss") dlRow(dl, t("recommended"), refList(mode, tg.recommended_species, "species"));
    if (tg.type === "boss") dlRow(dl, t("tribute"), tg.tribute || t("unknown"));
    dlRow(dl, t("coord"), tg.coord || t("none"));
    dlRow(dl, t("source"), sourceNode(tg.source));
    dlRow(dl, t("confidence"), tg.confidence || t("none"));
    dlRow(dl, t("checked"), tg.checked || t("none"));
    verifRows(dl, tg.id, mode);
    return dl;
  }
  // 地圖詳情（全景側欄與時間軸側欄共用）
  function mapDetailDl(m) {
    var dl = el("dl");
    dlRow(dl, t("kind"), tOr("kd_", m.kind));
    dlRow(dl, t("status"), tOr("st_", m.status));
    dlRow(dl, t("release"), m.release || t("none"));
    dlRow(dl, t("started"), m.started || t("none"));
    dlRow(dl, t("finished_at"), m.finished || t("none"));
    dlRow(dl, t("boss_progress"), m.boss_progress || t("none"));
    dlRow(dl, t("species_count"), numOr(m.species_count));
    dlRow(dl, t("target_count"), numOr(m.target_count));
    return dl;
  }
  // 物種詳情（全景側欄 mode＝"grid" 可聚焦；時間軸 mode＝"tl" 地圖連到流程視圖）
  function speciesDetailDl(key, mode) {
    var sp = D.species[key];
    var dl = el("dl");
    dlRow(dl, t("category"), sp.category || t("none"));
    dlRow(dl, t("tameable"), sp.tameable ? t("yes") : t("no"));
    dlRow(dl, t("difficulty"), sp.difficulty || t("none"));
    dlRow(dl, t("tamed_count"), numOr(sp.tamed_count));
    dlRow(dl, t("maps"), refList(mode === "grid" ? "grid" : "flow", sp.maps, "map"));
    dlRow(dl, t("page"), sp.page ? el("a", { href: sp.page, target: mode === "grid" ? null : "_blank", rel: mode === "grid" ? null : "noopener", text: t("open_page") }) : el("span", { class: "meta", text: t("no_page") }));
    verifRows(dl, "species:" + key, mode);
    return dl;
  }

  /* ================= 流程視圖（三欄） ================= */
  function defaultMapId() {
    var cur = null, firstWithTargets = null;
    D.maps.forEach(function (m) {
      if (!cur && m.is_current) cur = m;
      if (!firstWithTargets && (IDX.targetsByMap[m.id] || []).length) firstWithTargets = m;
    });
    var m = cur || firstWithTargets || D.maps[0];
    return m ? m.id : null;
  }
  function selectedBoss() {
    var tg = S.targetId ? IDX.target[S.targetId] : null;
    return (tg && tg.type === "boss") ? tg : null;
  }
  function currentSteps() { // 同時把 S.step 夾到 0～n-1（網址 step= 超範圍時，中欄連動與右欄一致）
    var b = selectedBoss();
    var steps = b ? buildSteps(b, D, S.lang) : [];
    S.step = steps.length ? Math.max(0, Math.min(steps.length - 1, S.step | 0)) : 0;
    return steps;
  }

  function renderFlow() {
    renderStatsInto($("#stats"));
    renderMapIndex();
    renderCard();
    renderWalk();
    renderMetaInto($("#flow-meta"));
  }

  function renderMapIndex() {
    var box = $("#map-index");
    box.innerHTML = "";
    box.appendChild(el("h2", { text: t("idx_title") }));
    box.appendChild(el("p", { class: "meta", text: fmt(t("idx_sub"), { maps: D.maps.length, targets: D.targets.length }) }));
    var ol = el("ol", { class: "idx" });
    D.maps.forEach(function (m, i) {
      var n = (IDX.targetsByMap[m.id] || []).length;
      var off = m.status === "未推出" || m.status === "未購買";
      var cls = "idx-item " + (STATUS_CLASS[m.status] || "") + (m.id === S.mapId ? " sel" : "") + (off ? " off" : "") + (m.is_current ? " is-current" : "");
      var li = el("li", { class: cls, "data-act": "pick-map", "data-id": m.id, role: "button", tabindex: "0",
        "aria-pressed": m.id === S.mapId ? "true" : "false" }, [
        el("span", { class: "no", text: String(i + 1).padStart(2, "0") }),
        el("span", { class: "nm" }, [
          el("span", { class: "nm-main" }, [nameOf(m), m.is_current ? el("span", { class: "cur-mark", title: t("current"), text: " ★" }) : null]),
          el("small", { text: (subName(m) ? subName(m) + "・" : "") + tOr("st_", m.status) })
        ]),
        el("span", { class: "ct" }, [
          el("span", { class: "ct-targets", title: t("target_count"), text: n + " " + t("target_count") }),
          el("small", { title: t("species_count"), text: numOr(m.species_count) + " " + t("species_count") })
        ])
      ]);
      ol.appendChild(li);
    });
    box.appendChild(ol);
    revealSelectedTab(ol);
    // 首次繪製時直捲軸可能在之後才出現、籤列變窄：下一幀再對一次
    if (window.requestAnimationFrame) requestAnimationFrame(function () { revealSelectedTab(ol); });
  }
  // ≤900px 籤列模式：只捲籤列本身（scrollLeft），不用 scrollIntoView 以免頁面跟著橫／直捲
  function revealSelectedTab(ol) {
    var sel = ol.querySelector(".idx-item.sel");
    if (!sel || ol.scrollWidth <= ol.clientWidth + 1) return;
    var r = sel.getBoundingClientRect(), o = ol.getBoundingClientRect(), pad = 8;
    if (r.left < o.left) ol.scrollLeft += r.left - o.left - pad;
    else if (r.right > o.right) ol.scrollLeft += r.right - o.right + pad;
  }

  function relationSummary(tg) {
    if (tg.type === "cave") {
      var names = (tg.artifacts || []).map(function (id) { return IDX.target[id] ? nameOf(IDX.target[id]) : id + " " + t("unknown_ref"); });
      return fmt(t("rel_produces"), { list: names.length ? names.join("、") : t("none") });
    }
    if (tg.type === "artifact") {
      if (!tg.cave_id) return t("cave_unknown");
      return fmt(t("rel_in_cave"), { cave: IDX.target[tg.cave_id] ? nameOf(IDX.target[tg.cave_id]) : tg.cave_id + " " + t("unknown_ref") });
    }
    return fmt(t("rel_boss"), { n: (tg.artifacts || []).length, m: (tg.recommended_species || []).length });
  }

  function renderCard() {
    var box = $("#card");
    box.innerHTML = "";
    var m = S.mapId ? IDX.map[S.mapId] : null;
    box.appendChild(el("h2", { text: t("card_title") }));
    if (!m) { box.appendChild(el("p", { class: "empty", text: t("card_hint") })); return; }
    var idx = D.maps.indexOf(m);
    var tgs = IDX.targetsByMap[m.id] || [];
    var l3 = tgs.filter(function (x) { return levelOf(D, x.id) === "L3"; }).length;

    var head = el("div", { class: "card-head " + (STATUS_CLASS[m.status] || "") });
    head.appendChild(el("h3", {}, [
      el("span", { class: "card-no", text: String(idx + 1).padStart(2, "0") }),
      " " + nameOf(m) + " ",
      subName(m) ? el("span", { class: "card-sub", text: subName(m) }) : null,
      m.is_current ? el("span", { class: "cell-badge current", text: "★ " + t("current") }) : null
    ]));
    var pills = el("div", { class: "pills" }, [
      el("span", { class: "pill st " + (STATUS_CLASS[m.status] || ""), text: tOr("st_", m.status) }),
      el("span", { class: "pill", text: tOr("kd_", m.kind) }),
      m.release ? el("span", { class: "pill", text: t("release") + " " + m.release }) : null,
      m.started ? el("span", { class: "pill", text: t("started") + " " + m.started }) : null,
      m.finished ? el("span", { class: "pill", text: t("finished_at") + " " + m.finished }) : null
    ]);
    head.appendChild(pills);
    head.appendChild(el("div", { class: "nums" }, [
      el("span", { class: "num" }, [el("b", { text: numOr(m.species_count) }), el("small", { text: t("species_count") })]),
      el("span", { class: "num" }, [el("b", { text: String(tgs.length) }), el("small", { text: t("target_count") })]),
      el("span", { class: "num v-l3" }, [el("b", { text: String(l3) }), el("small", { text: t("done_count") })])
    ]));
    box.appendChild(head);

    if (!tgs.length) {
      var empty = el("div", { class: "empty" }, [el("p", { text: t("empty_targets") })]);
      if (m.status === "未推出") empty.appendChild(el("p", { text: t("empty_unreleased") }));
      if (m.status === "未購買") empty.appendChild(el("p", { text: t("empty_unowned") }));
      box.appendChild(empty);
      return;
    }

    var steps = currentSteps();
    var lit = {}, done = {};
    if (steps.length) {
      (steps[S.step] ? steps[S.step].ids : []).forEach(function (id) { lit[id] = 1; });
      steps.slice(0, S.step).forEach(function (st) { st.ids.forEach(function (id) { done[id] = 1; }); });
    }
    function row(tg) {
      var cls = "trow t-" + tg.type;
      if (tg.id === S.targetId) cls += " sel";
      if (steps.length) cls += lit[tg.id] ? " step-lit" : done[tg.id] ? " step-done" : " dim";
      var li = el("li", { class: cls, "data-act": "pick-target", "data-id": tg.id, role: "button", tabindex: "0" }, [
        el("span", { class: "dot " + verifClass(tg.id), title: verifLabel(tg.id) }),
        el("span", { class: "tt" }, [
          el("span", { class: "tt-name" }, [
            nameOf(tg),
            tg.difficulty ? el("span", { class: "diff d-" + tg.difficulty.toLowerCase(), text: tg.difficulty }) : null,
            subName(tg) ? el("span", { class: "tt-sub", text: subName(tg) }) : null
          ]),
          el("small", { text: relationSummary(tg) })
        ]),
        el("span", { class: "tr" }, [
          el("span", { text: verifLabel(tg.id) }),
          tg.coord ? el("small", { text: tg.coord }) : null
        ])
      ]);
      return li;
    }
    function section(titleKey, type) {
      var list = tgs.filter(function (x) { return x.type === type; });
      var h = el("h4", { text: t(titleKey) + "（" + list.length + "）" });
      if (!list.length) return el("div", { class: "sec sec-" + type + " sec-empty" }, [h, el("p", { class: "empty sec-empty-msg", text: t("empty_sec_" + type) })]);
      var ul = el("ul", { class: "tl" });
      list.forEach(function (tg) { ul.appendChild(row(tg)); });
      return el("div", { class: "sec sec-" + type }, [h, ul]);
    }
    // 三段永遠依序出現；沒資料的段顯示一行空狀態（整張圖零目標時已在上面整卡空狀態 return）
    [section("sec_cave", "cave"), section("sec_artifact", "artifact"), section("sec_boss", "boss")].forEach(function (s) { box.appendChild(s); });
  }

  function renderWalk() {
    var box = $("#walk");
    box.innerHTML = "";
    var tg = S.targetId ? IDX.target[S.targetId] : null;
    if (!tg) {
      box.appendChild(el("h2", { text: t("walk_title") }));
      box.appendChild(el("p", { class: "empty", text: t("walk_hint") }));
      return;
    }
    if (tg.type !== "boss") {
      box.appendChild(el("h2", { text: t("detail_title") }));
      box.appendChild(el("h3", {}, [targetLabel(tg), subName(tg) ? el("span", { class: "card-sub", text: subName(tg) }) : null, " ", verifBadge(tg.id)]));
      box.appendChild(targetDetailDl(tg, "flow"));
      return;
    }
    var steps = currentSteps();
    box.appendChild(el("h2", { text: t("walk_title") }));
    box.appendChild(el("h3", { class: "walk-boss" }, [fmt(t("st_fight"), { boss: nameOf(tg), diff: tg.difficulty ? " " + tg.difficulty : "" }), " ", verifBadge(tg.id)]));
    box.appendChild(el("p", { class: "meta", text: fmt(t("steps_n"), { n: steps.length }) + "・" + fmt(t("step_no"), { n: S.step + 1 }) }));
    var chain = el("ol", { class: "chain", "aria-label": "steps" });
    steps.forEach(function (st, i) {
      chain.appendChild(el("li", { class: "chip-step " + (i === S.step ? "cur" : i < S.step ? "done" : ""), "data-act": "goto-step", "data-step": String(i), role: "button", tabindex: "0", title: st.title, text: String(i + 1) }));
    });
    box.appendChild(chain);
    var ol = el("ol", { class: "log" });
    steps.forEach(function (st, i) {
      var titleNode;
      if (st.kind === "species" && st.page) titleNode = el("a", { href: st.page, target: "_blank", rel: "noopener", text: st.title });
      else titleNode = el("span", { text: st.title });
      ol.appendChild(el("li", { class: "step k-" + st.kind + (i === S.step ? " cur" : i < S.step ? " done" : ""), "data-act": "goto-step", "data-step": String(i) }, [
        el("span", { class: "k", text: fmt(t("step_no"), { n: i + 1 }) + "・" + t("step_" + st.kind) }),
        el("b", {}, [titleNode, " ", verifBadge(st.vkey)]),
        el("span", { class: "s", text: st.sub })
      ]));
    });
    box.appendChild(ol);
    var last = S.step >= steps.length - 1;
    box.appendChild(el("div", { class: "ctl" }, [
      el("button", { type: "button", "data-act": "prev-step", disabled: S.step === 0 ? "disabled" : null, text: "◀ " + t("prev") }),
      el("button", { type: "button", class: "pri", "data-act": "next-step", disabled: last ? "disabled" : null, text: last ? t("finished") + " ✓" : t("next") + " ▶" })
    ]));
    var det = el("details", { class: "walk-detail" }, [el("summary", { text: t("detail_toggle") }), targetDetailDl(tg, "flow")]);
    box.appendChild(det);
  }

  function pickMap(mid) {
    if (!IDX.map[mid]) return;
    S.mapId = mid; S.targetId = null; S.step = 0;
    renderMapIndex(); renderCard(); renderWalk(); writeUrl();
    $("#walk").scrollTop = 0; // 右欄內捲回頂（換圖＝步數歸零）
    var card = $("#card");
    if (card && window.innerWidth <= 900 && card.scrollIntoView) card.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  function pickTarget(tid) {
    var tg = IDX.target[tid];
    if (!tg) return;
    var mapChanged = tg.map_id !== S.mapId;
    S.mapId = tg.map_id; S.targetId = tid; S.step = 0;
    if (mapChanged) renderMapIndex();
    renderCard(); renderWalk(); writeUrl();
    $("#walk").scrollTop = 0; // 換 Boss＝步數歸零，右欄內捲回第 1 步
    if (window.innerWidth <= 900) { var w = $("#walk"); if (w && w.scrollIntoView) w.scrollIntoView({ block: "start", behavior: "smooth" }); }
  }
  function gotoStep(i) {
    var n = currentSteps().length;
    if (!n) return;
    S.step = Math.max(0, Math.min(n - 1, i));
    renderCard(); renderWalk(); writeUrl();
    followStep();
  }
  // 換步後讓目前步可見：右欄步驟清單項與步驟鏈節點（桌機鏈在右欄內 sticky），中欄被點亮的列。
  function followStep() {
    var walk = $("#walk");
    if (!walk || !walk.scrollIntoView) return;
    var chain = $(".chain", walk), chip = $(".chain .chip-step.cur", walk), item = $(".log .step.cur", walk);
    if (window.innerWidth <= 900) {
      // 單欄堆疊（C3d 第 7 項）：只捲清單項。步驟鏈不黏頂，再捲它會把清單項推出畫面；留出黏性頁首高度
      if (item) {
        var top = $(".top");
        item.style.scrollMarginTop = ((top ? top.offsetHeight : 56) + 8) + "px";
        item.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      return;
    }
    if (item) {
      // 桌機步驟鏈 sticky 在右欄頂端：留出鏈高，免得清單項捲到鏈底下
      item.style.scrollMarginTop = (chain ? chain.offsetHeight + 8 : 64) + "px";
      item.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    if (chip) chip.scrollIntoView({ block: "nearest", inline: "nearest" });
    var lits = document.querySelectorAll("#card .trow.step-lit");
    if (lits.length) {
      lits[lits.length - 1].scrollIntoView({ block: "nearest" });
      lits[0].scrollIntoView({ block: "nearest" });
    }
  }

  function onFlowClick(ev) {
    var a = ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (!a) return;
    if (ev.target.closest && ev.target.closest("a[href]")) return; // 物種頁連結放行
    var act = a.getAttribute("data-act");
    if (act === "pick-map") pickMap(a.getAttribute("data-id"));
    else if (act === "pick-target") pickTarget(a.getAttribute("data-id"));
    else if (act === "goto-step") gotoStep(parseInt(a.getAttribute("data-step"), 10) || 0);
    else if (act === "prev-step") gotoStep(S.step - 1);
    else if (act === "next-step") gotoStep(S.step + 1);
    else if (act === "flow-target") pickTarget(a.getAttribute("data-id"));
    else if (act === "flow-map") pickMap(a.getAttribute("data-id"));
    else if (act === "to-timeline") toTimeline(a.getAttribute("data-key"));
  }

  /* ================= 全景視圖（分頁；無線） ================= */
  function renderGrid() {
    var app = $("#app");
    app.innerHTML = "";
    var grid = el("div", { class: "grid" });
    D.maps.forEach(function (m) { grid.appendChild(renderCell(m)); });
    app.appendChild(grid);
    renderStatsInto($("#grid-stats"));
    renderDetail();
    renderLegend();
    renderMetaInto($("#meta"));
  }

  function renderCell(m) {
    var sc = STATUS_CLASS[m.status] || "st-notstarted";
    var cls = "cell " + sc + (m.is_current ? " is-current" : "") + (S.expanded[m.id] ? " expanded" : "");
    if (S.focus && S.focus.kind === "map" && S.focus.id === m.id) cls += " focused";
    var cell = el("div", { class: cls, "data-map": m.id, "data-act": "cell", role: "button", tabindex: "0",
      title: nameOf(m) + " · " + tOr("st_", m.status) + " · " + tOr("kd_", m.kind) });
    var head = el("div", { class: "cell-head" }, [
      el("span", { class: "cell-name", text: nameOf(m) }),
      subName(m) ? el("span", { class: "cell-sub", text: subName(m) }) : null,
      m.is_current ? el("span", { class: "cell-badge current", text: "★ " + t("current") }) : null,
      el("button", { type: "button", class: "cell-flow", "data-act": "to-flow", "data-map": m.id, title: t("to_flow"), text: t("to_flow") + " →" })
    ]);
    cell.appendChild(head);
    cell.appendChild(el("div", { class: "cell-status", text: tOr("st_", m.status) + " · " + tOr("kd_", m.kind) + (m.release ? " · " + m.release : "") }));
    cell.appendChild(el("div", { class: "cell-counts" }, [
      el("span", { text: t("species_count") + " " + numOr(m.species_count) }),
      el("span", { text: t("target_count") + " " + numOr(m.target_count) })
    ]));
    var tgs = IDX.targetsByMap[m.id] || [];
    if (tgs.length) {
      var nodes = el("div", { class: "nodes" });
      ["boss", "cave", "artifact"].forEach(function (type) {
        var group = tgs.filter(function (x) { return x.type === type; });
        if (!group.length) return;
        var g = el("span", { class: "node-group" }, [el("span", { class: "node-group-label", text: t("t_" + type) })]);
        group.forEach(function (tg) { g.appendChild(renderNode(tg)); });
        nodes.appendChild(g);
      });
      cell.appendChild(nodes);
    }
    if (S.expanded[m.id]) cell.appendChild(renderSpeciesPanel(m));
    return cell;
  }

  function renderNode(tg) {
    var d = (tg.difficulty || "").toLowerCase();
    var cls = "node t-" + tg.type + (tg.type === "boss" ? " d-" + (d || "none") : "") + " " + verifClass(tg.id);
    if (S.focus && S.focus.kind === "target" && S.focus.id === tg.id) cls += " focused";
    var glyph = tg.type === "boss" ? (d === "gamma" ? "Γ" : d === "beta" ? "β" : d === "alpha" ? "α" : "B") : tg.type === "cave" ? "C" : "A";
    var tip = [targetLabel(tg), t("t_" + tg.type)];
    if (tg.difficulty) tip.push(t("difficulty") + " " + tg.difficulty);
    tip.push(t("confidence") + " " + (tg.confidence || t("none")));
    tip.push(t("verification") + " " + verifLabel(tg.id));
    return el("span", { class: cls, "data-id": tg.id, "data-act": "node", role: "button", tabindex: "0", title: tip.join(" · ") }, [el("span", { text: glyph })]);
  }

  function renderSpeciesPanel(m) {
    var wrap = el("div", { class: "species-wrap" });
    var lst = D.species_by_map[m.id] || [];
    wrap.appendChild(el("div", { class: "species-title" }, [
      el("span", { text: t("species_list") + "（" + lst.length + "）" }),
      el("button", { type: "button", class: "collapse", "data-act": "collapse", "data-map": m.id, text: t("collapse") })
    ]));
    var g = el("div", { class: "species-grid" });
    lst.forEach(function (key) {
      var sp = D.species[key] || {};
      var vk = "species:" + key;
      var cls = "chip " + verifClass(vk);
      if (S.focus && S.focus.kind === "species" && S.focus.id === key) cls += " focused";
      var chip = el("div", { class: cls, "data-species": key, "data-act": "chip", role: "button", tabindex: "0", title: speciesName(key) + " · " + verifLabel(vk) });
      if (sp.page) chip.appendChild(el("a", { class: "en", href: sp.page, "data-act": "page", text: key }));
      else chip.appendChild(el("span", { class: "en nopage", text: key + "（" + t("no_page") + "）" }));
      chip.appendChild(el("span", { class: "jp", text: jpOf(sp) }));
      var tags = el("span", { class: "tags" });
      tags.appendChild(el("span", { class: sp.tameable ? "tag-yes" : "tag-no", text: t("tameable") + "：" + (sp.tameable ? t("yes") : t("no")) }));
      if (sp.difficulty) tags.appendChild(el("span", { text: t("difficulty") + "：" + sp.difficulty }));
      tags.appendChild(el("span", { text: verifLabel(vk) }));
      chip.appendChild(tags);
      g.appendChild(chip);
    });
    wrap.appendChild(g);
    return wrap;
  }

  function renderDetail() {
    var box = $("#detail");
    box.innerHTML = "";
    box.appendChild(el("h2", { text: t("detail_title") }));
    if (!S.focus) { box.appendChild(el("p", { class: "meta", text: t("grid_hint") })); return; }
    if (S.focus.kind === "map") {
      var m = IDX.map[S.focus.id];
      if (!m) { box.appendChild(el("p", { text: S.focus.id + " " + t("unknown_ref") })); return; }
      box.appendChild(el("h3", { text: nameOf(m) + (subName(m) ? "　" + subName(m) : "") + (m.is_current ? "　★ " + t("current") : "") }));
      box.appendChild(mapDetailDl(m));
      var tgs = IDX.targetsByMap[m.id] || [];
      box.appendChild(el("h3", { text: t("targets") + "（" + tgs.length + "）" }));
      box.appendChild(refList("grid", tgs.map(function (x) { return x.id; }), "target"));
      var eps = (D.episodes || []).filter(function (e) { return e.map_id === m.id; });
      if (eps.length) {
        box.appendChild(el("h3", { text: t("episodes") + "（" + eps.length + "）" }));
        var ul = el("ul");
        eps.forEach(function (e) {
          var label = "#" + e.no + " " + (e.date || "") + " " + (e.title || "") + (e.highlight ? "：" + e.highlight : "");
          ul.appendChild(el("li", {}, e.vod ? el("a", { href: e.vod, target: "_blank", rel: "noopener", text: label }) : el("span", { text: label })));
        });
        box.appendChild(ul);
      }
      box.appendChild(el("p", {}, [
        el("button", { type: "button", class: "linkish", "data-act": S.expanded[m.id] ? "collapse" : "expand", "data-map": m.id, text: S.expanded[m.id] ? t("collapse") : t("expand") }),
        " ",
        el("button", { type: "button", class: "linkish", "data-act": "to-flow", "data-map": m.id, text: t("to_flow") + " →" })
      ]));
      return;
    }
    if (S.focus.kind === "target") {
      var tg = IDX.target[S.focus.id];
      if (!tg) { box.appendChild(el("p", { text: S.focus.id + " " + t("unknown_ref") })); return; }
      box.appendChild(el("h3", { text: targetLabel(tg) + (subName(tg) ? "　" + subName(tg) : "") }));
      box.appendChild(targetDetailDl(tg, "grid"));
      box.appendChild(el("p", {}, el("button", { type: "button", class: "linkish", "data-act": "to-flow", "data-map": tg.map_id, "data-target": tg.id, text: t("to_flow") + " →" })));
      return;
    }
    var key = S.focus.id;
    var sp = D.species[key];
    if (!sp) { box.appendChild(el("p", { text: key + " " + t("unknown_ref") })); return; }
    box.appendChild(el("h3", { text: speciesTitle(key) }));
    box.appendChild(speciesDetailDl(key, "grid"));
  }
  function speciesTitle(key) {
    var sp = D.species[key] || {};
    return speciesName(key) + ((S.lang === "ja" && jpOf(sp)) ? "　" + key : (jpOf(sp) ? "　" + jpOf(sp) : ""));
  }

  function renderLegend() {
    var box = $("#legend");
    box.innerHTML = "";
    box.appendChild(el("h2", { text: t("legend_title") }));
    box.appendChild(el("h3", { text: t("legend_nodes") }));
    box.appendChild(el("div", { class: "legend-row" }, [el("span", { class: "node t-boss d-gamma v-none" }, el("span", { text: "Γ" })), el("span", { class: "node t-boss d-beta v-none" }, el("span", { text: "β" })), el("span", { class: "node t-boss d-alpha v-none" }, el("span", { text: "α" })), el("span", { text: t("node_boss") })]));
    box.appendChild(el("div", { class: "legend-row" }, [el("span", { class: "node t-cave v-none" }, el("span", { text: "C" })), el("span", { text: t("node_cave") })]));
    box.appendChild(el("div", { class: "legend-row" }, [el("span", { class: "node t-artifact v-none" }, el("span", { text: "A" })), el("span", { text: t("node_artifact") })]));
    box.appendChild(el("h3", { text: t("legend_verif") }));
    [["v-l3", "v_l3"], ["v-l2", "v_l2"], ["v-l1", "v_l1"], ["v-none", "v_none"]].forEach(function (p) {
      box.appendChild(el("div", { class: "legend-row" }, [el("span", { class: "legend-ring " + p[0] }), el("span", { text: t(p[1]) })]));
    });
    box.appendChild(el("h3", { text: t("legend_status") }));
    [["st-unreleased", "未推出"], ["st-notstarted", "未開始"], ["st-active", "進行中"], ["st-done", "完成"], ["st-unowned", "未購買"]].forEach(function (p) {
      box.appendChild(el("div", { class: "legend-row" }, [el("span", { class: "legend-swatch " + p[0] }), el("span", { text: tOr("st_", p[1]) })]));
    });
  }

  function setFocus(kind, id) {
    S.focus = { kind: kind, id: id };
    if (kind === "map") { S.mapId = id; S.targetId = null; S.step = 0; }
    else if (kind === "target" && IDX.target[id]) { S.mapId = IDX.target[id].map_id; S.targetId = id; S.step = 0; }
    S.focusSig = flowSig();
    // 只更新 focused 標記與側欄，不重建格層
    var all = document.querySelectorAll("#app .focused");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("focused");
    var sel = kind === "map" ? '.cell[data-map="' + cssEscape(id) + '"]' : kind === "target" ? '.node[data-id="' + cssEscape(id) + '"]' : '.chip[data-species="' + cssEscape(id) + '"]';
    var nodes = document.querySelectorAll(sel);
    for (var j = 0; j < nodes.length; j++) nodes[j].classList.add("focused");
    renderDetail();
    writeUrl();
  }
  function flowSig() { return (S.mapId || "") + "|" + (S.targetId || ""); }
  // 切到全景時：焦點若是在流程視圖改圖／改目標之前設的（陳舊），改成目前的目標或地圖
  function syncGridFocus() {
    if (S.focus && S.focusSig === flowSig()) return;
    if (S.targetId && IDX.target[S.targetId]) S.focus = { kind: "target", id: S.targetId };
    else if (S.mapId) S.focus = { kind: "map", id: S.mapId };
    else S.focus = null;
    S.focusSig = flowSig();
  }
  function toggleExpand(mid, force) {
    var next = (force === undefined) ? !S.expanded[mid] : !!force;
    if (next) S.expanded[mid] = true; else delete S.expanded[mid];
    renderGrid();
  }
  function toFlow(mid, tid) {
    S.mapId = IDX.map[mid] ? mid : S.mapId;
    S.targetId = (tid && IDX.target[tid]) ? tid : null;
    S.step = 0;
    setView("flow");
  }
  function onAppClick(ev) {
    var tgt = ev.target;
    var actEl = tgt.closest ? tgt.closest("[data-act]") : null;
    if (!actEl) return;
    var act = actEl.getAttribute("data-act");
    if (act === "page") return; // 物種頁連結：放行瀏覽器預設導向
    if (act === "to-flow") { ev.stopPropagation(); toFlow(actEl.getAttribute("data-map"), actEl.getAttribute("data-target")); return; }
    if (act === "node") { ev.stopPropagation(); setFocus("target", actEl.getAttribute("data-id")); return; }
    if (act === "chip") { ev.stopPropagation(); setFocus("species", actEl.getAttribute("data-species")); return; }
    if (act === "collapse") { ev.stopPropagation(); toggleExpand(actEl.getAttribute("data-map"), false); return; }
    if (act === "cell") {
      var mid = actEl.getAttribute("data-map");
      var wasFocused = S.focus && S.focus.kind === "map" && S.focus.id === mid;
      S.focus = { kind: "map", id: mid };
      S.mapId = mid; S.targetId = null; S.step = 0;
      S.focusSig = flowSig();
      // 已展開且已是焦點 → 收合；否則展開並聚焦
      if (S.expanded[mid] && wasFocused) toggleExpand(mid, false);
      else toggleExpand(mid, true);
      writeUrl();
    }
  }
  function onSideClick(ev) {
    var b = ev.target.closest ? ev.target.closest("[data-focus-kind],[data-act]") : null;
    if (!b) return;
    if (b.hasAttribute("data-focus-kind")) {
      var kind = b.getAttribute("data-focus-kind"), id = b.getAttribute("data-focus-id");
      setFocus(kind, id);
      var sel = kind === "map" ? '.cell[data-map="' + cssEscape(id) + '"]' : kind === "target" ? '.node[data-id="' + cssEscape(id) + '"]' : '.chip[data-species="' + cssEscape(id) + '"]';
      var n = $(sel);
      if (n && n.scrollIntoView) n.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }
    var act = b.getAttribute("data-act");
    if (act === "expand") toggleExpand(b.getAttribute("data-map"), true);
    else if (act === "collapse") toggleExpand(b.getAttribute("data-map"), false);
    else if (act === "to-flow") toFlow(b.getAttribute("data-map"), b.getAttribute("data-target"));
    else if (act === "to-timeline") toTimeline(b.getAttribute("data-key"));
  }

  /* ================= 時間軸視圖（任務單 C4） ================= */
  var TL = null; // 最近一次 buildTimeline 結果（依目前篩選／開關）
  function tlBuild() { TL = buildTimeline(D, { mapId: S.tlMap, showRelease: S.tlRelease }); return TL; }
  function tlMapName(mid) { return IDX.map[mid] ? nameOf(IDX.map[mid]) : (mid + " " + t("unknown_ref")); }
  function tlEventLabel(it) { // 事件主標：物種＝英文名＋name_jp；目標＝目標名＋地圖名
    if (it.ref === "species") {
      var sp = D.species[it.species];
      var jp = sp ? jpOf(sp) : "";
      if (!sp) return it.species + " " + t("unknown_ref");
      return (S.lang === "ja" && jp) ? (jp + "（" + it.species + "）") : (it.species + (jp ? "（" + jp + "）" : ""));
    }
    var tg = IDX.target[it.target];
    if (!tg) return it.target + " " + t("unknown_ref");
    return targetLabel(tg) + "・" + tlMapName(tg.map_id);
  }
  function tlEventBadge(it) {
    var k = it.ref === "species" ? (it.level === "L3" ? "tl_ev_l3" : "tl_ev_l2") : (it.level === "L3" ? "tl_ev_target_l3" : "tl_ev_target_l2");
    return el("span", { class: "vbadge v-" + it.level.toLowerCase(), text: t(k) });
  }
  function tlMapTitle(it) {
    var k = it.which === "started" ? "tl_started" : it.which === "finished" ? "tl_finished" : "tl_release";
    return fmt(t(k), { map: tlMapName(it.map_id) });
  }
  // 項目列（軸上與日期未定區共用）：點整列＝選中；列內另有直達動作（VOD／物種頁／看流程）
  function tlItemRow(it) {
    var cls = "tl-item k-" + it.kind + (it.kind === "event" ? " v-" + it.level.toLowerCase() : "") + (it.kind === "map" ? " w-" + it.which : "") + (S.tlSel === it.id ? " sel" : "");
    var li = el("li", { class: cls, "data-act": "tl-pick", "data-id": it.id, role: "button", tabindex: "0", "aria-pressed": S.tlSel === it.id ? "true" : "false" });
    li.appendChild(el("span", { class: "tl-bar", "aria-hidden": "true" }));
    var body = el("span", { class: "tl-body" });
    if (it.kind === "episode") {
      body.appendChild(el("span", { class: "tl-name" }, [el("b", { text: "#" + it.no }), " " + it.title]));
      var sub = [];
      if (it.highlight) sub.push(el("span", { class: "tl-hl", text: it.highlight }));
      sub.push(it.map_id ? el("span", { text: tlMapName(it.map_id) }) : el("span", { class: "tl-faint", text: t("tl_map_unfilled") }));
      body.appendChild(el("small", {}, sub.reduce(function (acc, n, i) { if (i) acc.push("・"); acc.push(n); return acc; }, [])));
      li.appendChild(body);
      li.appendChild(el("span", { class: "tl-act" }, it.vod ? el("a", { href: it.vod, target: "_blank", rel: "noopener", text: t("tl_vod") + " ↗" }) : null));
    } else if (it.kind === "event") {
      body.appendChild(el("span", { class: "tl-name" }, [tlEventLabel(it), " ", tlEventBadge(it)]));
      var subs = [];
      if (it.episode) subs.push(el("button", { type: "button", class: "linkish", "data-act": "tl-pick", "data-id": "ep:" + it.episode, text: fmt(t("tl_ep"), { n: it.episode }) }));
      if (it.note) subs.push(el("span", { text: it.note }));
      if (subs.length) body.appendChild(el("small", {}, subs.reduce(function (acc, n, i) { if (i) acc.push("・"); acc.push(n); return acc; }, [])));
      li.appendChild(body);
      if (it.ref === "species") {
        var sp = D.species[it.species];
        li.appendChild(el("span", { class: "tl-act" }, (sp && sp.page) ? el("a", { href: sp.page, target: "_blank", rel: "noopener", text: t("open_page") + " ↗" }) : null));
      } else {
        var tg = IDX.target[it.target];
        li.appendChild(el("span", { class: "tl-act" }, tg ? el("button", { type: "button", class: "linkish", "data-act": "to-flow", "data-map": tg.map_id, "data-target": tg.id, text: t("to_flow") + " →" }) : null));
      }
    } else {
      body.appendChild(el("span", { class: "tl-name" }, [tlMapTitle(it)]));
      li.appendChild(body);
      li.appendChild(el("span", { class: "tl-act" }, el("button", { type: "button", class: "linkish", "data-act": "to-flow", "data-map": it.map_id, text: t("to_flow") + " →" })));
    }
    return li;
  }
  function renderTimeline() {
    var tl = tlBuild();
    if (S.tlSel && !tl.byId[S.tlSel]) {
      // 選中項目被篩選隱藏仍保留選取（詳情照資料畫）；查無（網址亂給）才清掉
      var full = buildTimeline(D, { mapId: "", showRelease: true });
      if (!full.byId[S.tlSel]) S.tlSel = null;
    }
    renderTimelineAxis(tl);
    renderTimelineSide(tl);
  }
  function renderTimelineAxis(tl) {
    var box = $("#tl-main");
    box.innerHTML = "";
    box.appendChild(el("h2", { text: t("tl_title") }));
    var hasContent = tl.stats.episodes + tl.stats.events + tl.stats.undated + tl.stats.mapProgress > 0;
    if (!hasContent) {
      box.appendChild(el("p", { class: "empty", text: t("tl_empty") }));
      return;
    }
    box.appendChild(el("p", { class: "meta", text: t("tl_hint") }));
    var axis = el("div", { class: "tl-axis" });
    tl.groups.forEach(function (g) {
      var sec = el("section", { class: "tl-month" }, [el("h3", { class: "tl-month-h", text: g.month })]);
      g.days.forEach(function (d) {
        var ul = el("ul", { class: "tl-items" });
        d.items.forEach(function (it) { ul.appendChild(tlItemRow(it)); });
        sec.appendChild(el("div", { class: "tl-day", "data-date": d.date }, [el("div", { class: "tl-date" }, [el("span", { class: "tl-dot", "aria-hidden": "true" }), el("time", { datetime: d.date, text: d.date })]), ul]));
      });
      axis.appendChild(sec);
    });
    box.appendChild(axis);
    // 日期未定區（第 5 條）：固定在軸底下
    var und = el("section", { class: "tl-undated" }, [el("h3", { text: t("tl_undated") + "（" + tl.undated.length + "）" }), el("p", { class: "meta", text: t("tl_undated_hint") })]);
    if (tl.undated.length) {
      var ul2 = el("ul", { class: "tl-items" });
      tl.undated.forEach(function (it) { ul2.appendChild(tlItemRow(it)); });
      und.appendChild(ul2);
    } else {
      und.appendChild(el("p", { class: "empty sec-empty-msg", text: t("none") }));
    }
    box.appendChild(und);
  }
  function renderTimelineSide(tl) {
    // 頂：統計＋篩選
    var st = $("#tl-stats");
    st.innerHTML = "";
    st.appendChild(el("h2", { text: t("tl_stats_title") }));
    st.appendChild(el("div", { class: "stat-row" }, [
      el("span", { class: "stat" }, [el("span", { class: "tl-sw k-episode" }), t("tl_n_episodes") + " " + tl.stats.episodes]),
      el("span", { class: "stat" }, [el("span", { class: "tl-sw k-event" }), t("tl_n_events") + " " + tl.stats.events]),
      el("span", { class: "stat" }, [t("tl_n_undated") + " " + tl.stats.undated]),
      el("span", { class: "stat" }, [t("tl_range") + "：" + (tl.stats.first ? tl.stats.first + " ～ " + tl.stats.last : t("none"))])
    ]));
    var sel = el("select", { id: "tl-map-filter", "aria-label": t("tl_filter") });
    sel.appendChild(el("option", { value: "", text: t("tl_all") }));
    D.maps.forEach(function (m) { sel.appendChild(el("option", { value: m.id, text: nameOf(m) })); });
    sel.value = S.tlMap;
    st.appendChild(el("label", { class: "tl-filter" }, [el("span", { text: t("tl_filter") }), sel]));
    if (S.tlMap && tl.stats.episodesNoMap) st.appendChild(el("p", { class: "meta tl-nomap", text: fmt(t("tl_no_map_n"), { n: tl.stats.episodesNoMap }) }));
    if (S.stress) st.appendChild(el("p", { class: "meta", text: t("stress") }));
    // 中：選中項目詳情
    renderTimelineDetail(tl);
    // 下：圖例＋ASA 推出開關＋meta
    var lg = $("#tl-legend");
    lg.innerHTML = "";
    lg.appendChild(el("h2", { text: t("tl_legend") }));
    [["k-episode", "tl_k_episode"], ["k-event v-l3", "tl_k_event"], ["k-map", "tl_k_map"], ["k-map w-release", "tl_k_release"]].forEach(function (p) {
      lg.appendChild(el("div", { class: "legend-row" }, [el("span", { class: "tl-sw " + p[0] }), el("span", { text: t(p[1]) })]));
    });
    [["v-l3", "v_l3"], ["v-l2", "v_l2"]].forEach(function (p) {
      lg.appendChild(el("div", { class: "legend-row" }, [el("span", { class: "legend-ring " + p[0] }), el("span", { text: t(p[1]) })]));
    });
    var cb = el("input", { type: "checkbox", id: "tl-release-toggle" });
    cb.checked = S.tlRelease;
    lg.appendChild(el("label", { class: "tl-toggle" }, [cb, " " + t("tl_show_release")]));
    renderMetaInto($("#tl-meta"));
  }
  function renderTimelineDetail(tl) {
    var box = $("#tl-detail");
    box.innerHTML = "";
    box.appendChild(el("h2", { text: t("detail_title") }));
    var it = S.tlSel ? (tl.byId[S.tlSel] || buildTimeline(D, { mapId: "", showRelease: true }).byId[S.tlSel]) : null;
    if (!it) { box.appendChild(el("p", { class: "meta", text: t("tl_hint") })); return; }
    if (it.kind === "episode") {
      box.appendChild(el("h3", {}, [fmt(t("tl_ep"), { n: it.no }), " ", el("span", { class: "card-sub", text: it.date || t("none") })]));
      var dl = el("dl");
      dlRow(dl, t("tl_ep_no"), "#" + it.no);
      dlRow(dl, t("tl_ep_date"), it.date || t("none"));
      dlRow(dl, t("map"), it.map_id ? refBtn("flow", "map", it.map_id, tlMapName(it.map_id)) : el("span", { class: "tl-faint", text: t("tl_map_unfilled") }));
      dlRow(dl, t("tl_ep_title"), it.title || t("none"));
      if (it.highlight) dlRow(dl, t("tl_ep_highlight"), it.highlight);
      dlRow(dl, t("tl_vod"), it.vod ? el("a", { href: it.vod, target: "_blank", rel: "noopener", text: t("tl_open_vod") + " ↗" }) : el("span", { class: "meta", text: t("tl_no_vod") }));
      box.appendChild(dl);
      // 同集事件：verification.episode＝本集集數者（契約有欄、目前真資料無值）
      var same = Object.keys(tl.byId).filter(function (id) { var x = tl.byId[id]; return x.kind === "event" && x.episode === String(it.no); });
      if (same.length) {
        box.appendChild(el("h3", { text: t("tl_with_ep") + "（" + same.length + "）" }));
        var ul = el("ul");
        same.forEach(function (id) { ul.appendChild(el("li", {}, el("button", { type: "button", class: "linkish", "data-act": "tl-pick", "data-id": id, text: tlEventLabel(tl.byId[id]) }))); });
        box.appendChild(ul);
      }
      return;
    }
    if (it.kind === "event") {
      if (it.ref === "species") {
        var sp = D.species[it.species];
        if (!sp) { box.appendChild(el("p", { text: it.species + " " + t("unknown_ref") })); return; }
        box.appendChild(el("h3", {}, [speciesTitle(it.species), " ", tlEventBadge(it)]));
        box.appendChild(speciesDetailDl(it.species, "tl"));
        return;
      }
      var tg = IDX.target[it.target];
      if (!tg) { box.appendChild(el("p", { text: it.target + " " + t("unknown_ref") })); return; }
      box.appendChild(el("h3", {}, [targetLabel(tg), subName(tg) ? el("span", { class: "card-sub", text: subName(tg) }) : null, " ", verifBadge(tg.id)]));
      box.appendChild(targetDetailDl(tg, "tl"));
      box.appendChild(el("p", {}, el("button", { type: "button", class: "linkish", "data-act": "to-flow", "data-map": tg.map_id, "data-target": tg.id, text: t("to_flow") + " →" })));
      return;
    }
    var m = IDX.map[it.map_id];
    if (!m) { box.appendChild(el("p", { text: it.map_id + " " + t("unknown_ref") })); return; }
    box.appendChild(el("h3", { text: tlMapTitle(it) + "　" + it.date }));
    box.appendChild(mapDetailDl(m));
    box.appendChild(el("p", {}, el("button", { type: "button", class: "linkish", "data-act": "to-flow", "data-map": m.id, text: t("to_flow") + " →" })));
  }
  function tlPick(id, scroll) {
    S.tlSel = id;
    // 只換選中標記與側欄，不重建整條軸
    var all = document.querySelectorAll("#tl-main .tl-item.sel");
    for (var i = 0; i < all.length; i++) { all[i].classList.remove("sel"); all[i].setAttribute("aria-pressed", "false"); }
    var hits = document.querySelectorAll('#tl-main .tl-item[data-id="' + cssEscape(id) + '"]');
    for (var j = 0; j < hits.length; j++) { hits[j].classList.add("sel"); hits[j].setAttribute("aria-pressed", "true"); }
    renderTimelineDetail(TL || tlBuild());
    writeUrl();
    if (scroll && hits.length && hits[0].scrollIntoView) hits[0].scrollIntoView({ block: "center" });
    if (window.innerWidth <= 900) { var d = $("#tl-detail"); if (d && d.scrollIntoView && !scroll) d.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  }
  function setTlMap(mid) {
    S.tlMap = IDX.map[mid] ? mid : "";
    renderTimeline(); writeUrl();
  }
  // 從流程／全景詳情「在時間軸看」：切到時間軸、選中並捲到該事件；篩選會把它藏起來就改回全部
  function toTimeline(key) {
    var id = "ev:" + key;
    if (S.tlMap && !buildTimeline(D, { mapId: S.tlMap, showRelease: S.tlRelease }).byId[id]) S.tlMap = "";
    S.tlSel = id;
    setView("timeline");
    var hit = $('#tl-main .tl-item[data-id="' + cssEscape(id) + '"]');
    if (hit && hit.scrollIntoView) hit.scrollIntoView({ block: "center" });
  }
  function onTimelineClick(ev) {
    var a = ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (!a) return;
    if (ev.target.closest && ev.target.closest("a[href]")) return; // VOD／物種頁連結放行
    var act = a.getAttribute("data-act");
    if (act === "tl-pick") { ev.stopPropagation(); tlPick(a.getAttribute("data-id"), a.tagName === "BUTTON"); }
    else if (act === "to-flow") { ev.stopPropagation(); toFlow(a.getAttribute("data-map"), a.getAttribute("data-target")); }
    else if (act === "flow-target") { ev.stopPropagation(); var tg = IDX.target[a.getAttribute("data-id")]; if (tg) toFlow(tg.map_id, tg.id); }
    else if (act === "flow-map") { ev.stopPropagation(); toFlow(a.getAttribute("data-id"), null); }
  }
  function onTimelineChange(ev) {
    var tgt = ev.target;
    if (!tgt) return;
    if (tgt.id === "tl-map-filter") setTlMap(tgt.value);
    else if (tgt.id === "tl-release-toggle") { S.tlRelease = !!tgt.checked; renderTimeline(); }
  }

  /* ---------- 視圖切換 ---------- */
  function setView(view) {
    S.view = VIEWS.indexOf(view) >= 0 ? view : "flow";
    $("#view-flow").hidden = S.view !== "flow";
    $("#view-grid").hidden = S.view !== "grid";
    $("#view-timeline").hidden = S.view !== "timeline";
    var btns = document.querySelectorAll("#view-switch [data-view]");
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-view") === S.view ? "true" : "false");
    var first = !S.rendered[S.view];
    // 首次繪製計時起點：第一個視圖從腳本開始（T0），之後切換的視圖從切換當下起算
    var tStart = first ? ((S.rendered.flow || S.rendered.grid || S.rendered.timeline) ? performance.now() : T0) : null;
    if (S.view === "flow") {
      if (!S.mapId) S.mapId = defaultMapId();
      renderFlow();
    } else if (S.view === "timeline") {
      renderTimeline();
    } else {
      syncGridFocus();
      renderGrid();
    }
    writeUrl();
    if (first) { S.rendered[S.view] = true; measurePaint(S.view, tStart); }
  }
  function renderAll() {
    if (S.view === "flow") renderFlow(); else if (S.view === "timeline") renderTimeline(); else renderGrid();
  }

  /* ---------- 使用說明浮層（任務單 C3d；文字全在 I18N help_* 鍵） ---------- */
  function helpIsOpen() { var box = $("#help"); return !!box && !box.hidden; }
  function renderHelp() {
    var box = $("#help");
    if (!box) return;
    box.innerHTML = "";
    var panel = el("div", { class: "help-panel", tabindex: "-1" });
    panel.appendChild(el("h2", { id: "help-title", text: t("help_title") }));
    function sec(hKey, body) { panel.appendChild(el("section", { class: "help-sec" }, [el("h3", { text: t(hKey) })].concat(body))); }
    function p(key) { return el("p", { text: t(key) }); }
    sec("help_what_h", [p("help_what")]);
    sec("help_cols_h", [el("ol", {}, ["help_cols_1", "help_cols_2", "help_cols_3"].map(function (k) { return el("li", { text: t(k) }); }))]);
    sec("help_walk_h", [p("help_walk")]);
    // 色點示意：沿用 island.css 四態驗證色（v-l3／v-l2／v-l1／v-none），不用圖片
    sec("help_dots_h", [el("ul", { class: "help-dots" }, [["v-l3", "help_dot_l3"], ["v-l2", "help_dot_l2"], ["v-l1", "help_dot_l1"], ["v-none", "help_dot_none"]].map(function (d) {
      return el("li", {}, [el("span", { class: "hdot " + d[0], "aria-hidden": "true" }), el("span", { text: t(d[1]) })]);
    }))]);
    sec("help_grid_h", [p("help_grid")]);
    sec("help_tl_h", [p("help_tl")]);
    sec("help_url_h", [p("help_url")]);
    sec("help_src_h", [p("help_src")]);
    panel.appendChild(el("div", { class: "help-ctl" }, [el("button", { type: "button", class: "pri", "data-act": "help-close", text: t("help_close") })]));
    box.appendChild(panel);
  }
  function focusHelp() {
    var panel = $("#help .help-panel");
    if (!panel) return;
    panel.scrollTop = 0;
    try { panel.focus({ preventScroll: true }); } catch (e) { panel.focus(); }
  }
  function openHelp() {
    var box = $("#help");
    if (!box) return;
    renderHelp();
    box.hidden = false;
    document.documentElement.classList.add("help-open");
    focusHelp();
  }
  function closeHelp() {
    var box = $("#help");
    if (!box || box.hidden) return;
    box.hidden = true;
    document.documentElement.classList.remove("help-open");
    var b = $("#help-toggle");
    if (b) b.focus();
  }
  function onHelpClick(ev) { // 點遮罩（浮層外框本身）或「知道了」都關
    var box = $("#help");
    if (ev.target === box || (ev.target.closest && ev.target.closest('[data-act="help-close"]'))) closeHelp();
  }
  // 首次開頁：鍵不存在才彈並寫入；資料載入失敗時 boot 已先 return，不會走到這裡
  function autoOpenHelpOnce() {
    if (lsGet(HELP_KEY) !== null) return;
    lsSet(HELP_KEY, "1");
    openHelp();
  }

  /* ---------- 語言 ---------- */
  function applyLang() {
    document.documentElement.setAttribute("lang", S.lang === "ja" ? "ja" : "zh-Hant");
    document.title = t("title") + (S.lang === "ja" ? " / 全景" : " / 全景図");
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    var btn = $("#lang-toggle");
    if (btn) btn.textContent = t("lang_btn");
    var hb = $("#help-toggle");
    if (hb) { hb.setAttribute("aria-label", t("help_btn")); hb.setAttribute("title", t("help_btn")); }
    if (helpIsOpen()) { renderHelp(); focusHelp(); } // 開著時切語言：內文跟著換
  }
  function setLang(lang) {
    S.lang = lang === "ja" ? "ja" : "zh";
    lsSet(LS_KEY, S.lang);
    applyLang();
    if (D) renderAll();
    else if (S.error) showError(S.error);
  }

  /* ---------- 鍵盤 ---------- */
  function onKey(ev) {
    if (helpIsOpen()) { // 浮層開著：Esc 關閉、Tab 留在浮層內，其餘鍵（含 ← →）不動到底下頁面
      if (ev.key === "Escape" || ev.key === "Esc") { ev.preventDefault(); closeHelp(); }
      else if (ev.key === "Tab") { ev.preventDefault(); var c = $('#help [data-act="help-close"]'); if (c) c.focus(); }
      return;
    }
    var tag = ev.target && ev.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (S.view === "flow" && selectedBoss() && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) {
      ev.preventDefault();
      gotoStep(S.step + (ev.key === "ArrowRight" ? 1 : -1));
      return;
    }
    if (ev.key !== "Enter" && ev.key !== " ") return;
    var a = ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (!a || a.tagName === "A" || a.tagName === "BUTTON" || a.tagName === "SUMMARY") return;
    ev.preventDefault();
    a.click();
  }

  /* ---------- 效能 ---------- */
  function measurePaint(view, tStart) {
    var built = Math.round((performance.now() - tStart) * 10) / 10;
    window.ISLAND_PERF = window.ISLAND_PERF || { stress: S.stress, views: {} };
    window.ISLAND_PERF.views[view] = { build_ms: built, paint_ms: null };
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var painted = Math.round((performance.now() - tStart) * 10) / 10;
        window.ISLAND_PERF.views[view].paint_ms = painted;
        console.info("[island] first paint (" + view + "): build " + built + " ms, painted " + painted + " ms" +
          (S.stress ? " (stress)" : "") + ", maps " + D.maps.length + ", targets " + D.targets.length + ", species " + Object.keys(D.species).length);
      });
    });
  }

  /* ---------- 啟動 ---------- */
  function boot() {
    S.lang = (lsGet(LS_KEY) === "ja") ? "ja" : "zh";
    var q = readUrlState();
    var lb = $("#lang-toggle");
    if (lb) lb.addEventListener("click", function () { setLang(S.lang === "ja" ? "zh" : "ja"); });
    var hb = $("#help-toggle"), hbox = $("#help");
    if (hb) hb.addEventListener("click", openHelp);
    if (hbox) hbox.addEventListener("click", onHelpClick);
    if (!loadData()) { document.addEventListener("keydown", onKey); applyLang(); return; } // 失敗畫面不自動彈說明
    // 網址狀態還原：map／target 查無就退回預設
    if (S.view === "timeline") {
      // 時間軸：map= 是篩選、ep=／ev= 是選中項目（查無者 renderTimeline 會清掉）
      if (q.map && IDX.map[q.map]) S.tlMap = q.map;
      if (q.ep) S.tlSel = "ep:" + q.ep; else if (q.ev) S.tlSel = "ev:" + q.ev;
    } else {
      if (q.target && IDX.target[q.target]) { S.targetId = q.target; S.mapId = IDX.target[q.target].map_id; }
      if (!S.targetId && q.map && IDX.map[q.map]) S.mapId = q.map;
    }
    if (!S.mapId && S.view !== "timeline") S.mapId = defaultMapId();
    var st = parseInt(q.step || "0", 10);
    S.step = (selectedBoss() && st > 0) ? st - 1 : 0;
    currentSteps(); // 夾到實際步數範圍
    if (S.view === "grid") {
      syncGridFocus();
    }
    $("#view-switch").addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("[data-view]") : null;
      if (b) setView(b.getAttribute("data-view"));
    });
    $("#view-flow").addEventListener("click", onFlowClick);
    $("#app").addEventListener("click", onAppClick);
    $("#side").addEventListener("click", onSideClick);
    $("#view-timeline").addEventListener("click", onTimelineClick);
    $("#view-timeline").addEventListener("change", onTimelineChange);
    document.addEventListener("keydown", onKey);
    applyLang();
    setView(S.view);
    if (S.view === "flow" && S.step > 0) followStep(); // 網址帶 step= 重新整理時也跟到目前步
    if (S.view === "timeline" && S.tlSel) { // 網址帶 ep=／ev= 重新整理時捲到該項目
      var hit = $('#tl-main .tl-item[data-id="' + cssEscape(S.tlSel) + '"]');
      if (hit && hit.scrollIntoView) hit.scrollIntoView({ block: "center" });
    }
    autoOpenHelpOnce();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
