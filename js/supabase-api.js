// DEMO backend: fake data only, in memory. Same interface as supabase-api.js (sbApiGet / sbApiPost).
const DEMO_PRODUCTS = [
  ['Aurora Home', 'AUR-LED-9W', '8850000010011'], ['Aurora Home', 'AUR-LED-15W', '8850000010028'], ['Aurora Home', 'AUR-DESK-LAMP', '8850000010035'],
  ['Brisa Kitchen', 'BRS-PAN-24', '8850000020018'], ['Brisa Kitchen', 'BRS-KETTLE-1L', '8850000020025'], ['Brisa Kitchen', 'BRS-KNIFE-SET', '8850000020032'],
  ['Cobalt Audio', 'CBA-SPK-BT', '8850000030015'], ['Cobalt Audio', 'CBA-EARBUD', '8850000030022'], ['Cobalt Audio', 'CBA-CABLE-2M', '8850000030039'],
  ['Delta Sport', 'DLS-BOTTLE-750', '8850000040012'], ['Delta Sport', 'DLS-YOGA-MAT', '8850000040029'], ['Delta Sport', 'DLS-BAND-SET', '8850000040036'],
  ['Evergreen Care', 'EVG-TOWEL-L', '8850000050019'], ['Evergreen Care', 'EVG-SOAP-3', '8850000050026'], ['Fjord Tech', 'FJT-HUB-USB', '8850000060016'], ['Fjord Tech', 'FJT-STAND-LAP', '8850000060023']
];
const pad2 = n => String(n).padStart(2, '0');
function demoNow(minAgo) {
  const d = new Date(Date.now() - (minAgo || 0) * 60000);
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
  const m = {}; p.forEach(x => m[x.type] = x.value);
  return `${m.year}-${m.month}-${m.day} ${m.hour}:${m.minute}:${m.second}`;
}
const demoProducts = DEMO_PRODUCTS.map((p, i) => ({ brand: p[0], skuMerchant: p[1], gtin: p[2], rowIndex: i + 1 }));
const ORDER_ITEMS = [
  ['AUR-LED-9W (2), BRS-PAN-24 (1)'], ['CBA-SPK-BT (1)'], ['DLS-YOGA-MAT (1), DLS-BOTTLE-750 (2)'], ['EVG-TOWEL-L (3)'], ['FJT-HUB-USB (1), CBA-CABLE-2M (2)'],
  ['AUR-LED-9W (2), BRS-PAN-24 (1), CBA-SPK-BT (1)'], ['BRS-KETTLE-1L (1)'], ['AUR-DESK-LAMP (1), AUR-LED-15W (2)'], ['DLS-BAND-SET (2)'], ['CBA-EARBUD (1), CBA-CABLE-2M (1)'],
  ['BRS-KNIFE-SET (1)'], ['EVG-SOAP-3 (4), EVG-TOWEL-L (1)'], ['FJT-STAND-LAP (1)'], ['DLS-BOTTLE-750 (1)']
];
const demoOrders = ORDER_ITEMS.map((it, i) => {
  const done = i < 5;
  return { trackingNo: 'TH2610001' + String(i + 1).padStart(3, '0'), itemsStr: it[0], items: [], status: done ? 'Completed' : 'รอดำเนินการ', qcTime: done ? demoNow(12 * (5 - i)) : '-', rowIndex: i + 1 };
});
const mk = (p, n) => Array.from({ length: n }, (_, i) => p + String(i + 1).padStart(3, '0'));
const L = { kw: mk('TH2610A', 18), ky: mk('TH2610B', 24), wk: mk('TH2610C', 12), ying: mk('TH2610D', 30), fl: mk('TH2610F', 20) };
const demoChecked = [].concat(L.kw.slice(0, 9), L.ky.slice(0, 12), L.wk.slice(0, 6), L.ying.slice(0, 15), L.fl.slice(0, 11));
const demoShipped = [].concat(L.kw.slice(14), L.ky.slice(20), L.wk.slice(10), L.ying.slice(26), L.fl.slice(16)).map(t => t.toLowerCase());
function summarize(list) {
  const ship = new Set(demoShipped), chk = new Set(demoChecked.map(t => t.toLowerCase()));
  let found = 0, missing = 0, shipped = 0, pending = 0;
  list.forEach(t => { const k = t.toLowerCase(); if (ship.has(k)) { shipped++; return; } pending++; if (chk.has(k)) found++; else missing++; });
  return { total: list.length, found, missing, shipped, pending };
}
function demoFuay() {
  const n = Math.max(L.kw.length, L.ky.length, L.wk.length, L.ying.length, L.fl.length, demoChecked.length), data = [];
  for (let r = 0; r < n; r++) data.push({ col1: L.kw[r] || '', col2: L.ky[r] || '', col3: L.wk[r] || '', col4: L.ying[r] || '', col5: L.fl[r] || '', col6: demoChecked[r] || '' });
  const summary = { kangWikrit: summarize(L.kw), kangYing: summarize(L.ky), wikrit: summarize(L.wk), ying: summarize(L.ying), flash: summarize(L.fl) };
  summary.yingWikritTotal = summary.ying.total + summary.wikrit.total;
  return { success: true, headers: ['ค้าง ว', 'ค้าง ย', 'วิกฤติ', 'ยิง', 'แฟลช', 'เช็ค'], data, summary, shippedTracks: demoShipped };
}
const SCAN_ROWS = [
  [3, 'TH2610001008', 'PACK-01', 'app:chrome'], [4, 'TH2610001007', 'PACK-01', 'app:chrome'], [6, 'SPX2610000412', 'PACK-02', 'app:excel'], [7, 'TH2610001006', 'QC-DESK', 'pageScan'],
  [9, 'TH2610001005', 'QC-DESK', 'pageScan'], [11, 'TH2610009999', 'PACK-02', 'app:chrome'], [13, 'SPX2610000377', 'PACK-01', 'app:LINE'], [15, 'TH2610001004', 'QC-DESK', 'pageScan'],
  [18, 'TH2610001003', null, 'pageScan'], [21, 'TH2610001002', 'PACK-02', 'app:chrome'], [24, 'TH2610001001', 'PACK-01', 'app:chrome'], [27, 'SPX2610000301', 'PACK-02', 'app:excel']
];
async function sbApiGet(action, params) {
  if (action === 'getAllData') return { orders: demoOrders, products: demoProducts, replacements: [], cuts: [] };
  if (action === 'getFuayData') return demoFuay();
  if (action === 'getScanLog') {
    const rows = SCAN_ROWS.map((r, i) => ({ id: i + 1, code: r[1], kind: 'scanned', page: r[3], inputId: null, machine: r[2], time: demoNow(r[0]) }));
    return { success: true, rows };
  }
  return { success: true, rows: [] };
}
async function sbApiPost(action, payload) { return { success: true, message: 'ok' }; }
