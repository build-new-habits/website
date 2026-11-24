/*
 * edit-plan/edit-plan.js
 * 24 Nov 2026 v2
 *
 * v2 — P-45 THE LIVE LINK. A link that carries a live link (&live=<id>.<key>
 *   after the #) and a relay that is set up (relay-config.js): Send back also
 *   sends the changes straight to their phone, sealed here with the link's
 *   key (live-link.js), so the relay only ever holds locked bytes. The
 *   privacy line says so. If it can't be sent, said, and the link is the way.
 *   With no live link, or the relay not set up, the page is as v1 and makes
 *   no call to anyone.
 * v1 — P-44 S3: the physio's editing page. Reads the plan after the #,
 *   shows each list and exercise to change (name, sets, reps or time, a
 *   note), Take out and Add an exercise, a line for the person, and Send
 *   back: a link to the app with the changes after its #. Nothing is sent
 *   anywhere and nothing is stored.
 *
 * WCAG 2.2 AA: one h1 that takes focus; each exercise a fieldset named by
 * the exercise; every field labelled, with its rule as a hint; a mistake is
 * said beside the field, the field marked, and focus moved to the first;
 * results said in a status line; nothing relies on colour.
 */
import { decodePlan, encodePlan, checkPlan, linkFor, LIMITS, NOT_COMPLETE } from "./plan-link.js";
import { RELAY } from "./relay-config.js";
import { relayClient, readLive, seal } from "./live-link.js";

export let client = relayClient(RELAY);
/** For the gate: a stand-in relay. */
export const _useClient = c => { client = c; };

export const APP = "https://app.buildnewhabits.co.uk/";
const root = document.getElementById("ep-app");
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let out = null;           // the plan as it came
let lists = [];           // [{ g, items: [{ i?, l?, n, s, r, nt, was, gone, fresh }] }]
let say = "";
let backLink = "";
let live = null;          // { id, key } when the link carries a live link and the relay is set up
let sent = null;          // null, "yes" or "no": sent straight to their phone

function status(msg) {
  const s = document.getElementById("ep-status");
  if (!s) return;
  s.textContent = "";
  setTimeout(() => { s.textContent = msg; }, 30);
}

function exHtml(li, xi, x) {
  const id = `ex-${li}-${xi}`;
  const title = x.fresh ? "New exercise" : x.was;
  return `<fieldset class="ep-ex${x.gone ? " is-out" : ""}" id="${id}">
    <legend>${esc(title)}</legend>
    ${x.gone ? "" : `
    <div class="ep-row"><label for="${id}-n">Name</label>
      <input id="${id}-n" data-f="n" data-li="${li}" data-xi="${xi}" maxlength="${LIMITS.name}" value="${esc(x.n)}" autocomplete="off" aria-describedby="${id}-n-err">
      <p class="ep-err" id="${id}-n-err" hidden></p></div>
    <div class="ep-two">
      <div class="ep-row"><label for="${id}-s">Sets</label>
        <input id="${id}-s" data-f="s" data-li="${li}" data-xi="${xi}" inputmode="numeric" maxlength="2" value="${x.s ?? ""}" aria-describedby="${id}-s-hint ${id}-s-err">
        <span class="ep-hint" id="${id}-s-hint">1 to ${LIMITS.sets}, or leave empty</span>
        <p class="ep-err" id="${id}-s-err" hidden></p></div>
      <div class="ep-row"><label for="${id}-r">Reps or time</label>
        <input id="${id}-r" data-f="r" data-li="${li}" data-xi="${xi}" maxlength="${LIMITS.reps}" value="${esc(x.r)}" aria-describedby="${id}-r-hint">
        <span class="ep-hint" id="${id}-r-hint">For example 12, or 30 seconds each side</span></div>
    </div>
    <div class="ep-row"><label for="${id}-nt">Note for them <span class="ep-hint">(optional)</span></label>
      <textarea id="${id}-nt" data-f="nt" data-li="${li}" data-xi="${xi}" maxlength="${LIMITS.note}" rows="2">${esc(x.nt)}</textarea></div>`}
    <div class="ep-acts"><button type="button" class="ep-btn ep-btn--plain" data-toggle="${li}:${xi}" aria-describedby="${id}">${x.gone ? "Put it back" : "Take it out"}</button></div>
  </fieldset>`;
}

function render(focusSel) {
  const who = out.by ? `${out.by}’s exercises` : "Someone’s exercises";
  const sent = new Date(out.at).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  root.innerHTML = `
    <p class="big">${esc(who)} from Alongside: Move, sent on ${esc(sent)}. Change what you need, then press <strong>Send back</strong> at the bottom.</p>
    <p class="ep-private"><span aria-hidden="true">&#128274;</span><span>${live
      ? "When you press Send back, your changes go straight to their phone, locked on this device so only their phone can read them. We can\u2019t read them, and they are deleted once their phone has them (30 days at most)."
      : "Nothing you type is sent to us or kept. It is all in the link, so it goes only where you send it."}</span></p>
    ${lists.map((l, li) => `<section class="ep-list" aria-labelledby="ep-l-${li}">
      <h2 id="ep-l-${li}">${esc(l.g)}</h2>
      ${l.items.map((x, xi) => exHtml(li, xi, x)).join("")}
      <button type="button" class="ep-btn" data-add="${li}">Add an exercise to ${esc(l.g)}</button>
    </section>`).join("")}
    <section class="ep-send" aria-labelledby="ep-say-h">
      <div class="ep-row"><label for="ep-say" id="ep-say-h">A line for them <span class="ep-hint">(optional, shown at the top of your changes)</span></label>
        <textarea id="ep-say" maxlength="${LIMITS.say}" rows="3">${esc(say)}</textarea></div>
      <button type="button" class="cta" id="ep-make">Send back</button>
      <p class="ep-status" id="ep-status" role="status" aria-live="polite"></p>
    </section>
    <div id="ep-back-box">${backLink ? backHtml() : ""}</div>`;
  wire();
  if (focusSel) document.querySelector(focusSel)?.focus();
}

function backHtml() {
  const head = sent === "yes" ? "Sent straight to their phone" : "Your changes are ready to send";
  const line = sent === "yes" ? "They\u2019ll see your changes next time they open Alongside: Move, and choose what to keep. If you\u2019d like, send them this link too."
    : sent === "no" ? "They couldn\u2019t be sent straight to their phone just now. Send them this link instead, the way they sent theirs."
    : "Send this link back to them, the way they sent theirs. They will see each change and choose what to keep.";
  return `<section class="ep-back" aria-labelledby="ep-back-h">
    <h2 id="ep-back-h" tabindex="-1">${head}</h2>
    <p>${line}</p>
    <label class="ep-hint" for="ep-link">The link</label>
    <textarea id="ep-link" readonly>${esc(backLink)}</textarea>
    <div class="ep-acts">
      ${navigator.share ? `<button type="button" class="ep-btn" id="ep-share">Share the link…</button>` : ""}
      <button type="button" class="ep-btn" id="ep-copy">Copy the link</button>
      <a class="ep-btn ep-btn--plain" id="ep-mail" href="mailto:?subject=${encodeURIComponent("Your exercises, changed")}&amp;body=${encodeURIComponent(`I've changed your exercises. Open this link and choose what to keep:\n\n${backLink}`)}">Email it</a>
    </div>
    <p class="ep-hint">Changed something else? Change it above and press Send back again for a new link.</p>
  </section>`;
}

function readFields() {
  document.querySelectorAll("[data-f]").forEach(el => {
    const x = lists[+el.dataset.li].items[+el.dataset.xi];
    x[el.dataset.f] = el.value;
  });
  const s = document.getElementById("ep-say");
  if (s) say = s.value;
}

function check() {
  const bad = [];
  document.querySelectorAll(".ep-err").forEach(p => { p.hidden = true; p.textContent = ""; });
  document.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
  lists.forEach((l, li) => l.items.forEach((x, xi) => {
    if (x.gone) return;
    const id = `ex-${li}-${xi}`;
    const mark = (f, msg) => {
      const el = document.getElementById(`${id}-${f}`), p = document.getElementById(`${id}-${f}-err`);
      el?.setAttribute("aria-invalid", "true");
      if (p) { p.hidden = false; p.textContent = msg; }
      bad.push(`#${id}-${f}`);
    };
    if (!String(x.n || "").replace(/[<>]/g, "").trim()) mark("n", "Give it a name, or take it out.");
    const s = String(x.s ?? "").trim();
    if (s && !(/^\d{1,2}$/.test(s) && +s >= 1 && +s <= LIMITS.sets)) mark("s", `Sets: a whole number from 1 to ${LIMITS.sets}, or leave it empty.`);
  }));
  return bad;
}

function backPlan() {
  const p = { t: "back", at: new Date().toISOString(), of: out.at, lists: lists.map(l => ({ g: l.g, x: l.items.filter(x => !x.gone).map(x => {
    const one = { n: String(x.n).trim() };
    if (x.i) one.i = x.i;
    if (x.l && String(x.n).trim() === x.was) one.l = x.l;
    const s = String(x.s ?? "").trim(); if (s) one.s = +s;
    if (String(x.r || "").trim()) one.r = String(x.r).trim();
    if (String(x.nt || "").trim()) one.nt = String(x.nt).trim();
    return one;
  }) })) };
  if (say.trim()) p.say = say.trim();
  return checkPlan(p);
}

async function make() {
  readFields();
  const bad = check();
  if (bad.length) {
    status(`${bad.length === 1 ? "One thing" : `${bad.length} things`} to check before sending.`);
    document.querySelector(bad[0])?.focus();
    return;
  }
  const p = backPlan();
  if (!p) { status("This could not be made into a link. Check each exercise has a name."); return; }
  const code = await encodePlan(p);
  backLink = linkFor(APP, "back=" + code);
  sent = null;
  if (live) {
    try { sent = (await client.post(live.id, await seal(live.key, code))) != null ? "yes" : "no"; }
    catch { sent = "no"; }
  }
  document.getElementById("ep-back-box").innerHTML = backHtml();
  wireBack();
  document.getElementById("ep-back-h")?.focus();
}

function wireBack() {
  document.getElementById("ep-share")?.addEventListener("click", async () => {
    try { await navigator.share({ title: "Your exercises, changed", text: "I've changed your exercises. Open this link and choose what to keep.", url: backLink }); status("Shared."); }
    catch (e) { if (!e || e.name !== "AbortError") status("Sharing did not work here. Copy the link instead."); }
  });
  document.getElementById("ep-copy")?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(backLink); status("Link copied. Paste it in a message or an email to them."); }
    catch { const t = document.getElementById("ep-link"); t?.focus(); t?.select(); status("Copying is not allowed here, so the link is selected. Copy it from your menu."); }
  });
}

function wire() {
  document.querySelectorAll("[data-f]").forEach(el => el.addEventListener("input", () => {
    lists[+el.dataset.li].items[+el.dataset.xi][el.dataset.f] = el.value;
  }));
  document.getElementById("ep-say")?.addEventListener("input", e => { say = e.target.value; });
  document.querySelectorAll("[data-toggle]").forEach(b => b.addEventListener("click", () => {
    readFields();
    const [li, xi] = b.dataset.toggle.split(":").map(Number);
    const x = lists[li].items[xi];
    if (x.fresh && !x.gone) { lists[li].items.splice(xi, 1); render(`[data-add="${li}"]`); status("New exercise removed."); return; }
    x.gone = !x.gone;
    render(`[data-toggle="${li}:${xi}"]`);
    status(`${x.was}: ${x.gone ? "taken out. Put it back if that was a mistake." : "put back."}`);
  }));
  document.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
    readFields();
    const li = +b.dataset.add;
    const count = lists.reduce((n, l) => n + l.items.filter(x => !x.gone).length, 0);
    if (count >= LIMITS.exercises) { status(`There can be ${LIMITS.exercises} exercises at most.`); return; }
    lists[li].items.push({ n: "", s: "", r: "", nt: "", was: "", gone: false, fresh: true });
    const xi = lists[li].items.length - 1;
    render(`#ex-${li}-${xi}-n`);
    status(`New exercise added to ${lists[li].g}. Give it a name.`);
  }));
  document.getElementById("ep-make")?.addEventListener("click", make);
  if (backLink) wireBack();
}

export async function start(hash = location.hash) {
  const [codePart] = String(hash || "").split("&live=");
  live = client.on ? readLive(hash) : null;
  sent = null;
  const r = await decodePlan(codePart);
  if (!r.ok || r.plan.t !== "out") {
    root.innerHTML = `<p class="big">${esc(r.ok ? "This is a link with changes for the person. Open it on their phone, in Alongside: Move." : NOT_COMPLETE)}</p>
      <p class="ep-lead">Links from Alongside: Move are long. If it was copied by hand or cut short in a message, ask for it to be sent again.</p>`;
    document.getElementById("page-title")?.focus();
    return;
  }
  out = r.plan;
  lists = out.lists.map(l => ({ g: l.g, items: l.x.map(x => ({ i: x.i, l: x.l, n: x.n, s: x.s ?? "", r: x.r || "", nt: x.nt || "", was: x.n, gone: false, fresh: false })) }));
  say = ""; backLink = "";
  render();
  document.getElementById("page-title")?.focus();
}

start();
window.addEventListener("hashchange", () => start());
