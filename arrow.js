(function () {
  const css = `
  #board{position:relative;touch-action:none;box-shadow:0 6px 24px rgba(0,0,0,.5);border-radius:10px;}
  .piece{width:88%;height:88%;pointer-events:none;-webkit-user-drag:none;}
  .arrows{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;}
  .co{position:absolute;font:700 10px sans-serif;font-style:normal;z-index:1;}
  .co.r{top:2px;left:3px;}
  .co.f{bottom:1px;right:3px;}
  .light .co{color:var(--dark);}
  .dark .co{color:var(--light);}
  .pset{display:inline-block;width:66px;height:66px;margin:5px;border-radius:12px;background:#2a2d34;border:3px solid transparent;}
  .pset.on{border-color:var(--accent);}
  .pset img{width:100%;height:100%;}
  `;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  const board = document.getElementById("board");
  const NS = "http://www.w3.org/2000/svg";
  let down = null;

  function sqAt(e) {
    const r = board.getBoundingClientRect();
    const f = Math.floor((e.clientX - r.left) / r.width * 8);
    const rr = Math.floor((e.clientY - r.top) / r.height * 8);
    if (f < 0 || f > 7 || rr < 0 || rr > 7) return null;
    const file = flipped ? 7 - f : f;
    const rank = flipped ? rr + 1 : 8 - rr;
    return "abcdefgh"[file] + rank;
  }

  function center(name) {
    const file = "abcdefgh".indexOf(name[0]);
    const rank = Number(name[1]);
    return [(flipped ? 7 - file : file) + 0.5, (flipped ? rank - 1 : 8 - rank) + 0.5];
  }

  window.renderArrows = function () {
    const old = board.querySelector("svg");
    if (old) old.remove();
    const list = arrows.slice();
    if (down && down.arrow && down.to && down.to !== down.sq) list.push({from: down.sq, to: down.to});
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 8 8");
    svg.setAttribute("class", "arrows");
    list.forEach(a => {
      const c1 = center(a.from), c2 = center(a.to);
      const dx = c2[0] - c1[0], dy = c2[1] - c1[1];
      const len = Math.hypot(dx, dy);
      const ux = dx / len, uy = dy / len;
      const tx = c2[0] - ux * 0.1, ty = c2[1] - uy * 0.1;
      const bx = tx - ux * 0.4, by = ty - uy * 0.4;
      const g = document.createElementNS(NS, "g");
      g.setAttribute("opacity", "0.85");
      g.setAttribute("fill", "#ffaa00");
      g.setAttribute("stroke", "#ffaa00");
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", c1[0]);
      line.setAttribute("y1", c1[1]);
      line.setAttribute("x2", bx);
      line.setAttribute("y2", by);
      line.setAttribute("stroke-width", "0.16");
      line.setAttribute("stroke-linecap", "round");
      const head = document.createElementNS(NS, "polygon");
      head.setAttribute("stroke-width", "0");
      head.setAttribute("points",
        tx + "," + ty + " " +
        (bx - uy * 0.2) + "," + (by + ux * 0.2) + " " +
        (bx + uy * 0.2) + "," + (by - ux * 0.2));
      g.appendChild(line);
      g.appendChild(head);
      svg.appendChild(g);
    });
    board.appendChild(svg);
  };

  board.addEventListener("contextmenu", e => e.preventDefault());

  board.addEventListener("pointerdown", e => {
    down = {sq: sqAt(e), to: null, arrow: false, timer: null};
    if (e.pointerType === "mouse" && e.button === 2) {
      down.arrow = true;
      down.to = down.sq;
    } else {
      down.timer = setTimeout(() => {
        if (!down) return;
        down.arrow = true;
        down.to = down.sq;
        if (navigator.vibrate) navigator.vibrate(20);
        renderArrows();
      }, 350);
    }
  });

  board.addEventListener("pointermove", e => {
    if (!down) return;
    const s = sqAt(e);
    if (down.arrow) {
      if (s !== down.to) { down.to = s; renderArrows(); }
    } else if (s !== down.sq) {
      clearTimeout(down.timer);
    }
  });

  board.addEventListener("pointerup", e => {
    if (!down) return;
    clearTimeout(down.timer);
    const d = down;
    down = null;
    if (d.arrow) {
      if (d.to && d.sq && d.to !== d.sq) {
        const i = arrows.findIndex(a => a.from === d.sq && a.to === d.to);
        if (i >= 0) arrows.splice(i, 1);
        else arrows.push({from: d.sq, to: d.to});
      }
      renderArrows();
    } else {
      const sq = sqAt(e);
      if (sq) clickSquare(sq);
    }
  });

  board.addEventListener("pointercancel", () => {
    if (down) clearTimeout(down.timer);
    down = null;
    renderArrows();
  });

  renderArrows();
})();
