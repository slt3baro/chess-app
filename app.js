const game = new Chess();
const themes = {
  Green:["#eeeed2","#769656"],
  Brown:["#f0d9b5","#b58863"],
  Blue:["#dee3e6","#8ca2ad"],
  Purple:["#e8e0f0","#8877b3"],
  Coral:["#f4e1d2","#c97b63"],
  Dark:["#9a9a9a","#4a4a4a"]
};
const sets = ["cburnett","merida","alpha","staunty","cardinal","tatiana","pixel"];
const BASE = "https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece/";
const N = [0,1,2,3,4,5,6,7];
let selected = null, flipped = false, arrows = [];
let pieceSet = "cburnett";
try { pieceSet = localStorage.getItem("pieces") || pieceSet; } catch (e) {}
if (!sets.includes(pieceSet)) pieceSet = "cburnett";

function pieceUrl(set, color, type) {
  return BASE + set + "/" + color + type.toUpperCase() + ".svg";
}

function showTab(id, btn) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function setTheme(name) {
  const t = themes[name];
  document.documentElement.style.setProperty("--light", t[0]);
  document.documentElement.style.setProperty("--dark", t[1]);
  try { localStorage.setItem("theme", name); } catch (e) {}
  drawThemes(name);
}

function drawThemes(current) {
  const box = document.getElementById("themes");
  box.textContent = "";
  Object.keys(themes).forEach(n => {
    const s = document.createElement("div");
    s.className = "swatch" + (n === current ? " on" : "");
    themes[n].forEach(c => {
      const h = document.createElement("div");
      h.style.background = c;
      s.appendChild(h);
    });
    s.onclick = () => setTheme(n);
    box.appendChild(s);
  });
}

function setPieces(name) {
  pieceSet = name;
  try { localStorage.setItem("pieces", name); } catch (e) {}
  drawPieceSets();
  draw();
}

function drawPieceSets() {
  const box = document.getElementById("pieces");
  box.textContent = "";
  sets.forEach(n => {
    const d = document.createElement("div");
    d.className = "pset" + (n === pieceSet ? " on" : "");
    const img = document.createElement("img");
    img.src = pieceUrl(n, "w", "n");
    d.appendChild(img);
    d.onclick = () => setPieces(n);
    box.appendChild(d);
  });
}

function draw() {
  const el = document.getElementById("board");
  el.textContent = "";
  const targets = selected ? game.moves({square: selected, verbose: true}).map(m => m.to) : [];
  const hist = game.history({verbose: true});
  const last = hist.length ? hist[hist.length - 1] : null;

  N.forEach(r => {
    N.forEach(f => {
      const file = flipped ? 7 - f : f;
      const rank = flipped ? r + 1 : 8 - r;
      const name = "abcdefgh"[file] + rank;
      const p = game.get(name);
      const d = document.createElement("div");
      d.className = "sq " + (((file + rank) % 2 === 1) ? "dark" : "light");
      if (last && (name === last.from || name === last.to)) d.classList.add("last");
      if (name === selected) d.classList.add("sel");
      if (targets.includes(name)) d.classList.add("dot");
      if (f === 0) {
        const c = document.createElement("i");
        c.className = "co r";
        c.textContent = rank;
        d.appendChild(c);
      }
      if (r === 7) {
        const c = document.createElement("i");
        c.className = "co f";
        c.textContent = "abcdefgh"[file];
        d.appendChild(c);
      }
      if (p) {
        const img = document.createElement("img");
        img.className = "piece";
        img.src = pieceUrl(pieceSet, p.color, p.type);
        d.appendChild(img);
      }
      el.appendChild(d);
    });
  });

  let status = (game.turn() === "w" ? "White" : "Black") + " to move";
  if (game.in_checkmate()) status = "Checkmate! " + (game.turn() === "w" ? "Black" : "White") + " wins";
  else if (game.in_draw()) status = "Draw";
  else if (game.in_check()) status += " (check)";
  document.getElementById("status").textContent = status;

  let txt = "";
  game.history().forEach((mv, i) => {
    if (i % 2 === 0) txt += (i / 2 + 1) + ". " + mv + " ";
    else txt += mv + "  ";
  });
  document.getElementById("moves").textContent = txt || "No moves yet";
  if (window.renderArrows) renderArrows();
}

function clickSquare(name) {
  arrows = [];
  const p = game.get(name);
  if (selected && selected !== name) {
    const m = game.move({from: selected, to: name, promotion: "q"});
    if (m) { selected = null; draw(); return; }
  }
  selected = (p && p.color === game.turn()) ? name : null;
  draw();
}

function undo() { game.undo(); selected = null; arrows = []; draw(); }
function flipBoard() { flipped = !flipped; draw(); }
function newGame() { game.reset(); selected = null; arrows = []; draw(); }

const pc = document.createElement("div");
pc.className = "card";
const pt = document.createElement("b");
pt.textContent = "Piece set";
const pbox = document.createElement("div");
pbox.id = "pieces";
pc.appendChild(pt);
pc.appendChild(pbox);
document.getElementById("settings").appendChild(pc);

let saved = "Green";
try { saved = localStorage.getItem("theme") || "Green"; } catch (e) {}
if (!themes[saved]) saved = "Green";
setTheme(saved);
drawPieceSets();
draw();

const extra = document.createElement("script");
extra.src = "arrows.js";
document.body.appendChild(extra);
