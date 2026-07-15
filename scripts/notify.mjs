#!/usr/bin/env node
// scripts/notify.mjs
// LINE通知を送る汎用スクリプト。ローカルからも Actions からも同じ叩き方。
//
// 使い方:
//   node scripts/notify.mjs "作業終わった"
//   node scripts/notify.mjs "daily-digest 書けたよ" daily-digest
//
// 必要な環境変数:
//   NOTIFY_URL     https://<ai-agent-company>.workers.dev/notify
//   NOTIFY_SECRET  Cloudflare Workers 側と同じシークレット
//
// 未設定なら「通知しなかった」と表示して exit 0 で終わる（=CIを止めない）

const [, , text, sender] = process.argv;

if (!text) {
  console.error("usage: node scripts/notify.mjs <text> [sender]");
  process.exit(2);
}

const url = process.env.NOTIFY_URL;
const secret = process.env.NOTIFY_SECRET;

if (!url || !secret) {
  console.log("notify skipped: NOTIFY_URL / NOTIFY_SECRET not set");
  process.exit(0);
}

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ text, sender }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`notify failed: ${res.status} ${body}`);
  process.exit(1);
}

const json = await res.json();
console.log(`notify sent: ${JSON.stringify(json)}`);
