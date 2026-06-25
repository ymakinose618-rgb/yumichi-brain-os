export const DEFAULT_FOLDERS = [
  { id: 'work',          name: '仕事' },
  { id: 'dx-ai',         name: 'DX / AI' },
  { id: 'sns',           name: 'SNS / 広報' },
  { id: 'kids',          name: '子ども' },
  { id: 'tasks',         name: '今月のタスク' },
  { id: 'relationships', name: '人間関係' },
  { id: 'side',          name: '副業 / 起業' },
  { id: 'emotion',       name: '感情ログ' },
  { id: 'ideas',         name: 'アイデア保管庫' },
  { id: 'inbox',         name: '未処理タスク' },
];

// 領域は独立しない。構造的に影響しあう関係を線で可視化する。
export const EDGES = [
  ['dx-ai', 'work'],
  ['dx-ai', 'side'],
  ['dx-ai', 'sns'],
  ['work', 'relationships'],
  ['work', 'sns'],
  ['kids', 'emotion'],
  ['kids', 'relationships'],
  ['tasks', 'inbox'],
  ['ideas', 'side'],
  ['emotion', 'relationships'],
];

// 観察の4類型 — タスクの入れ物ではなく、構造を観るための分類。
export const NOTE_TYPES = {
  observation: { label: '観察',       color: '#7b7470', desc: 'なにが起きたか' },
  hypothesis:  { label: '構造仮説',   color: '#9b6a65', desc: 'なぜ起きるのか' },
  friction:    { label: '違和感',     color: '#d64545', desc: '非効率の検知' },
  system:      { label: '自動化候補', color: '#a85050', desc: '再現性化できる' },
};

export const DEFAULT_NOTE_TYPE = 'observation';

// 軸 — コアに巡回表示する基準。
export const AXIS_STATEMENTS = [
  '構造で考える',
  '違和感を観察する',
  '繰り返しは自動化する',
  '軸で人を見る',
  '理念で繋がる',
  'AI を前提に集まり方を設計する',
];
