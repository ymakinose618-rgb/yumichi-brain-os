#!/usr/bin/env node
// scripts/daily-digest.mjs
// 21:07 JST の Actions から呼ばれる骨組み版（v0.1）。
// inbox Issue と ymakinose618-rgb 配下 全リポの当日 commit を素集約するだけ。
// v0.2 で Claude API を追加：構造化・違和感抽出・明日の問い推薦。

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const gh = (cmd) => execSync(`gh ${cmd}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }).trim();

// JST 今日
const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
const outPath = `notes/daily/${today}.md`;

const GH_USER = process.env.GH_USER || 'ymakinose618-rgb';
const HOME_REPO = `${GH_USER}/yumichi-brain-os`;

// 1) yumichi-brain-os の inbox ラベル open Issue
let inbox = [];
try {
  const raw = gh(`issue list -R ${HOME_REPO} --label inbox --state open --json number,title,body,createdAt,url --limit 100`);
  inbox = JSON.parse(raw);
} catch (e) {
  console.error('inbox fetch failed:', e.message);
}

// 2) GH_USER 配下の全リポで pushed_at が JST の今日のものだけ拾う
let repos = [];
try {
  const raw = gh(`repo list ${GH_USER} --limit 200 --json name,pushedAt`);
  repos = JSON.parse(raw);
} catch (e) {
  console.error('repo list failed:', e.message);
}
const active = repos.filter((r) => {
  const pushedJst = new Date(r.pushedAt).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  return pushedJst === today;
});

// 3) 各アクティブ repo から当日 commit を拾う
const commitsPerRepo = {};
for (const r of active) {
  try {
    // since= は ISO8601、JSTの当日 0:00 を境界に
    const sinceIso = `${today}T00:00:00%2B09:00`;
    const raw = gh(`api "repos/${GH_USER}/${r.name}/commits?since=${sinceIso}&per_page=50"`);
    const list = JSON.parse(raw);
    commitsPerRepo[r.name] = list.map((c) => ({
      sha: c.sha.slice(0, 7),
      msg: (c.commit?.message ?? '').split('\n')[0],
      author: c.commit?.author?.name ?? '',
    }));
  } catch (e) {
    console.error(`commits fetch failed for ${r.name}:`, e.message);
    commitsPerRepo[r.name] = [];
  }
}

// 4) Markdown 組み立て
let md = `# daily/${today}\n\n`;
md += `_自動生成 by .github/workflows/daily-digest.yml (v0.1 骨組み)_\n\n`;

md += `## 今日の inbox（${inbox.length}件）\n\n`;
if (inbox.length === 0) {
  md += `- なし\n\n`;
} else {
  for (const i of inbox) {
    md += `- [#${i.number}](${i.url}) ${i.title}\n`;
    const body = (i.body ?? '').trim();
    if (body) {
      const quoted = body.split('\n').map((l) => `  > ${l}`).join('\n');
      md += `${quoted}\n`;
    }
  }
  md += `\n`;
}

md += `## 今日動いた手（${active.length}リポ）\n\n`;
if (active.length === 0) {
  md += `- なし\n\n`;
} else {
  for (const r of active) {
    const cs = commitsPerRepo[r.name] ?? [];
    md += `### ${r.name}（${cs.length} commits）\n\n`;
    for (const c of cs) {
      md += `- \`${c.sha}\` ${c.msg} — ${c.author}\n`;
    }
    md += `\n`;
  }
}

md += `## 拾った違和感\n\n`;
md += `_v0.2 で inbox 本文と commit メッセージから \`#違和感\` タグを抽出予定_\n\n`;

md += `## 明日の問い1つ\n\n`;
md += `_v0.2 で Claude API に上記全部を渡して推薦してもらう予定_\n\n`;

// 5) 書き出し
if (!existsSync(dirname(outPath))) {
  mkdirSync(dirname(outPath), { recursive: true });
}
writeFileSync(outPath, md, 'utf8');
console.log(`wrote ${outPath}`);
