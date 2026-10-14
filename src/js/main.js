
const BUILDER = { name: "Noryt_Eye", handle: "Genetyron", course: "" };

const $ = (s) => document.querySelector(s);
const K = { users: "kuha_users", session: "kuha_session", posts: "kuha_posts" }; 
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const msg = (t) => ($("#msg").textContent = t);
const B = document.body.dataset.base || "";           
const P = (p) => `${B}pages/${p}.html`;               
const me = () => load(K.users, []).find((u) => u.id === localStorage.getItem(K.session));

async function hash(t) {
  if (!crypto.subtle) return btoa(t); 
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

const mdb = new Promise((ok, no) => { const r = indexedDB.open("kuha_media", 1); r.onupgradeneeded = () => r.result.createObjectStore("m"); r.onsuccess = () => ok(r.result); r.onerror = no; });
const mput = async (k, f) => { const d = await mdb; return new Promise((ok) => { const t = d.transaction("m", "readwrite"); t.objectStore("m").put(f, k); t.oncomplete = ok; }); };
const mget = async (k) => { const d = await mdb; return new Promise((ok) => { const r = d.transaction("m").objectStore("m").get(k); r.onsuccess = () => ok(r.result); }); };
const mdel = async (k) => (await mdb).transaction("m", "readwrite").objectStore("m").delete(k);
async function hydrate(root) { // swap stored files into <img>/<video> tags
  for (const el of root.querySelectorAll("[data-mk]")) { const b = await mget(el.dataset.mk); b ? (el.src = URL.createObjectURL(b)) : el.remove(); }
}

function layout() {
  const u = me();
  document.body.insertAdjacentHTML("afterbegin", `<header class="bar"><a class="logo" href="${B}index.html">kuha<span>.</span></a><nav>
    ${u ? `<a href="${P("feed")}">Feed</a><a href="${P("profile")}">@${u.id}</a>` : `<a href="${P("login")}">Log in</a>`}
    <a href="${P("about")}">About</a><a href="${P("privacy")}">Privacy</a>
    ${u ? '<button id="out" class="btn sm ghost">Log out</button>' : `<a class="btn sm" href="${P("signup")}">Join Kuha</a>`}</nav></header>`);
  document.body.insertAdjacentHTML("beforeend", `<footer>Kuha has no trackers and no servers. Everything stays in your browser.<br>Built by ${esc(BUILDER.name)}. Made in Cagayan de Oro.</footer>`);
  $("#out")?.addEventListener("click", () => { localStorage.removeItem(K.session); location = B + "index.html"; });
}

function seed() {
  const t = Date.now();
  let ps = load(K.posts, null) || [];
  ps = ps.filter((p) => !(typeof p.id === "number" && p.id < 10)); 
  (typeof PORTFOLIO !== "undefined" ? PORTFOLIO : []).forEach((x, i) => {
    const id = "pf" + i, o = ps.find((p) => p.id === id);
    const n = { id, by: BUILDER.handle.toLowerCase(), name: BUILDER.name, text: x.title, tag: x.tag || "Photo", c: i % 4, t: o?.t ?? t - i * 1000, src: x.src, type: x.type, poster: x.poster, pin: !!x.pinned, likes: o?.likes ?? [] };
    o ? Object.assign(o, n) : ps.push(n);
  });
  save(K.posts, ps);
}

const isVid = (p) => (p.media?.type || p.type) === "video";
function mediaTag(p, full) {
  const v = isVid(p), a = full ? " controls playsinline" : " muted loop playsinline preload=metadata";
  if (p.media) return v ? `<video data-mk="${p.media.key}"${a}></video>` : `<img data-mk="${p.media.key}" alt="">`;
  if (p.src) { const s = esc(B + p.src); return v ? `<video src="${s}"${a} onerror="this.remove()"></video>` : `<img src="${s}" alt="" onerror="this.remove()">`; }
  return ""; 
}
const hides = (p) => load(K.users, []).find((x) => x.id === p.by)?.priv?.hideLikes;
const tile = (p) => `<button class="tile c${p.c}" data-open="${p.id}" aria-label="Open post by ${esc(p.name)}"><span class="poster">${esc(p.text)}</span>${mediaTag(p)}<span class="ic">${p.pin ? "📌" : ""}${isVid(p) ? " ▶" : ""}</span><span class="hov">${hides(p) ? "View" : "♥ " + p.likes.length}</span></button>`;
const sorted = (ps) => ps.sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.t - a.t);
function draw(list) { const el = $("#posts"); el.innerHTML = sorted(list).map(tile).join("") || '<p class="mut">Nothing here yet. Share your first frame on the feed.</p>'; hydrate(el); }

function wire(redraw) { 
  document.body.insertAdjacentHTML("beforeend", '<dialog id="view"></dialog>');
  const view = $("#view"), same = (p, id) => String(p.id) === String(id);
  const show = (id) => {
    const p = load(K.posts, []).find((x) => same(x, id)), u = me();
    view.innerHTML = `<div class="vm"><div class="big c${p.c}"><span class="poster">${esc(p.text)}</span>${mediaTag(p, 1)}</div></div>
      <div class="vi"><h2>${esc(p.name)}</h2><small>@${esc(p.by)} on ${new Date(p.t).toLocaleDateString()}</small><p>${esc(p.text)}</p>
      <div class="row"><button class="btn sm" data-like="${p.id}">${p.likes.includes(u.id) ? "♥" : "♡"}${hides(p) ? "" : " " + p.likes.length}</button>
      ${p.by === u.id ? `<button class="btn sm ghost" data-del="${p.id}">Delete</button>` : ""}<button class="btn sm ghost" data-close>Close</button></div></div>`;
    hydrate(view); if (!view.open) view.showModal();
  };
  $("#posts").onclick = (e) => { const t = e.target.closest("[data-open]"); if (t) show(t.dataset.open); };
  view.onclick = (e) => {
    const t = e.target.closest("button"); if (!t) { if (e.target === view) view.close(); return; }
    if (t.dataset.close !== undefined) return view.close();
    const ps = load(K.posts, []), id = t.dataset.like || t.dataset.del, p = ps.find((x) => same(x, id));
    if (t.dataset.like) { const i = p.likes.indexOf(me().id); i < 0 ? p.likes.push(me().id) : p.likes.splice(i, 1); save(K.posts, ps); show(id); }
    else { if (p.media) mdel(p.media.key); save(K.posts, ps.filter((x) => x !== p)); view.close(); }
    redraw();
  };
  view.addEventListener("close", () => view.querySelectorAll("video").forEach((v) => v.pause()));
}

const pages = {
  signup() {
    $("#f").onsubmit = async (e) => {
      e.preventDefault(); const x = e.target, id = x.user.value.trim().toLowerCase(), us = load(K.users, []);
      if (!/^[a-z0-9_]{3,20}$/.test(id)) return msg("Username needs 3-20 letters, numbers or underscores.");
      if (x.pw.value.length < 6) return msg("Password needs at least 6 characters.");
      if (us.some((v) => v.id === id)) return msg("That username is taken. Try another.");
      us.push({ id, name: x.dn.value.trim() || id, bio: "", c: Math.floor(Math.random() * 4), priv: { hideLikes: false }, pass: await hash(x.pw.value) });
      save(K.users, us); localStorage.setItem(K.session, id); location = P("feed");
    };
  },
  login() {
    $("#f").onsubmit = async (e) => {
      e.preventDefault(); const x = e.target, u = load(K.users, []).find((v) => v.id === x.user.value.trim().toLowerCase());
      if (!u || u.pass !== (await hash(x.pw.value))) return msg("Wrong username or password.");
      localStorage.setItem(K.session, u.id); location = P("feed");
    };
  },
  feed() {
    let f = "All";
    const tabs = () => ($("#tags").innerHTML = ["All", "Photo", "Video", "BTS", "Tip"].map((t) => `<button class="tab${t === f ? " on" : ""}" data-t="${t}">${t}</button>`).join(""));
    const redraw = () => draw(load(K.posts, []).filter((p) => f === "All" || p.tag === f));
    $("#tags").onclick = (e) => { if (e.target.dataset.t) { f = e.target.dataset.t; tabs(); redraw(); } };
    $("#post-form").onsubmit = async (e) => {
      e.preventDefault(); const x = e.target, u = me(), text = x.text.value.trim(), file = x.file.files[0];
      if (!text && !file) return;
      if (file && file.size > 80e6) return alert("That file is over 80 MB. Please pick a smaller one.");
      const p = { id: Date.now(), by: u.id, name: u.name, text, tag: x.tag.value, c: +x.c.value, t: Date.now(), likes: [] };
      if (file) { p.media = { key: "m" + p.id, type: file.type.startsWith("video") ? "video" : "image" }; await mput(p.media.key, file); }
      const ps = load(K.posts, []); ps.push(p); save(K.posts, ps); x.reset(); redraw();
    };
    tabs(); wire(redraw); redraw();
  },
  profile() {
    const u = me(), saveMe = () => { const us = load(K.users, []); us[us.findIndex((v) => v.id === u.id)] = u; save(K.users, us); };
    const mine = () => load(K.posts, []).filter((p) => p.by === u.id);
    $("#me").innerHTML = `<div class="av c${u.c}">${esc(u.name[0].toUpperCase())}</div><div><h1>${esc(u.name)}</h1><b>@${u.id}</b><p>${esc(u.bio) || "No bio yet."}</p><small>${mine().length} posts</small></div>`;
    $("#bio").value = u.bio; $("#hl").checked = u.priv.hideLikes;
    $("#bio-form").onsubmit = (e) => { e.preventDefault(); u.bio = $("#bio").value.slice(0, 160); saveMe(); location.reload(); };
    $("#hl").onchange = (e) => { u.priv.hideLikes = e.target.checked; saveMe(); };
    $("#exp").onclick = () => { 
      const d = { ...u, pass: "(hidden)", posts: mine() };
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" })); a.download = "my-kuha-data.json"; a.click();
    };
    $("#del").onclick = () => {
      if (!confirm("Delete your account and all your posts? This cannot be undone.")) return;
      mine().forEach((p) => p.media && mdel(p.media.key));
      save(K.users, load(K.users, []).filter((v) => v.id !== u.id)); save(K.posts, load(K.posts, []).filter((p) => p.by !== u.id));
      localStorage.removeItem(K.session); location = B + "index.html";
    };
    const redraw = () => draw(mine()); wire(redraw); redraw();
  },
};

const { page, auth } = document.body.dataset;
seed();
if (auth === "required" && !me()) location = P("login");   
else if (auth === "guest" && me()) location = P("feed");   
else { layout(); pages[page]?.(); }
