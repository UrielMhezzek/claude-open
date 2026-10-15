// Prüft Pfad-Validierung und Link-Aufbau der index.html. Aufruf: node test.js [pfad/zur/index.html]
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync(process.argv[2] ?? require("path").join(__dirname, "index.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function run(search) {
  const els = {}; const el = id => els[id] ??= { hidden: true, href: "#", textContent: "" };
  const win = { location: { search, href: "https://x/" } };
  vm.runInNewContext(script, { window: win, document: { getElementById: el }, URLSearchParams });
  return { redirect: win.location.href, ok: !el("ok").hidden, fehler: !el("fehler").hidden, knopf: els.knopf?.href, link: els.link?.textContent };
}
const fälle = [
  ["?p=cowork/cse_01HhWoAVycsgLkkTHvGHGhsG", "claude://claude.ai/cowork/cse_01HhWoAVycsgLkkTHvGHGhsG"],
  ["?p=chat/4c7c0889-485f-4cea-bf7c-fb7de3bb8bcd", "claude://claude.ai/chat/4c7c0889-485f-4cea-bf7c-fb7de3bb8bcd"],
  ["?p=project/0f1e2d3c-aaaa-bbbb-cccc-111122223333", "claude://claude.ai/project/0f1e2d3c-aaaa-bbbb-cccc-111122223333"],
  ["?p=code/session_01Mp1RsRXCxtaEutHJ4vVx4M", "claude://claude.ai/code/session_01Mp1RsRXCxtaEutHJ4vVx4M"],
  ["?p=codex/x", null],
  ["?p=https://evil.com", null], ["?p=chat/../../evil", null], ["?p=chat/abc%0Aevil", null],
  ["?p=chat/", null], ["?p=settings/x", null], ["?p=chat/a/b", null], ["?p=javascript:alert(1)", null], ["", null],
];
let fail = 0;
for (const [q, soll] of fälle) {
  const r = run(q);
  const gut = soll ? r.redirect === soll && r.knopf === soll && r.link === soll && r.ok && !r.fehler
                   : r.redirect === "https://x/" && !r.ok && r.fehler;
  if (!gut) fail++;
  console.log(gut ? "OK  " : "FAIL", q || "(leer)", "->", soll ? r.redirect : "abgelehnt");
}
process.exit(fail ? 1 : 0);
