const TOTAL = 4;
const ACS   = ['#7c6dfa', '#f0a500', '#00c97a', '#ff3365'];

let cur  = 0;
let busy = false;
let open = false;

const slides = document.querySelectorAll('.slide');
const items  = document.querySelectorAll('.nav-item');
const segs   = document.querySelectorAll('.page-seg');
const panels = document.querySelectorAll('.panel');
const drawer = document.getElementById('drawer');
const toggle = document.getElementById('toggle');
const dbar   = document.getElementById('dbar');

function render() {
  slides.forEach((s, i) => {
    s.classList.remove('active', 'above');
    if (i === cur)      s.classList.add('active');
    else if (i < cur)   s.classList.add('above');
  });
  items.forEach((it, i)  => it.classList.toggle('on', i === cur));
  segs.forEach((s, i)    => s.classList.toggle('on', i === cur));
  panels.forEach((p, i)  => p.classList.toggle('on', i === cur));
  dbar.style.width      = ((cur + 1) / TOTAL * 100) + '%';
  dbar.style.background = ACS[cur];
}

function go(i) {
  if (busy || i === cur || i < 0 || i >= TOTAL) return;
  busy = true;

  const prev = cur;
  cur = i;

  // Non-adjacent slides would animate through the viewport if not snapped first.
  // Mark them no-transition, let the browser paint the new position, then restore.
  slides.forEach((s, idx) => {
    if (idx !== prev && idx !== cur) s.classList.add('no-transition');
  });

  render();

  // Two rAF: first lets the DOM update, second confirms paint before re-enabling transitions.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      slides.forEach(s => s.classList.remove('no-transition'));
    });
  });

  setTimeout(() => { busy = false; }, 920);
}

function openDrawer()   { open = true;  drawer.classList.add('open');    toggle.classList.add('open'); }
function closeDrawer()  { open = false; drawer.classList.remove('open'); toggle.classList.remove('open'); }
function toggleDrawer() { open ? closeDrawer() : openDrawer(); }

// Nav items
items.forEach(item => {
  item.addEventListener('click', () => go(Number(item.dataset.i)));
});

// Bottom pager segments
segs.forEach(seg => {
  seg.addEventListener('click', () => go(Number(seg.dataset.i)));
});

// "展开详情" buttons inside slides
document.querySelectorAll('.js-open-drawer').forEach(btn => {
  btn.addEventListener('click', openDrawer);
});

// Drawer toggle button
toggle.addEventListener('click', toggleDrawer);

// Wheel with debounce
let wt = null;
window.addEventListener('wheel', e => {
  e.preventDefault();
  if (wt) return;
  if (e.deltaY > 20)       go(cur + 1);
  else if (e.deltaY < -20) go(cur - 1);
  wt = setTimeout(() => { wt = null; }, 1050);
}, { passive: false });

// Keyboard
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown'  || e.key === 'ArrowRight') go(cur + 1);
  if (e.key === 'ArrowUp'    || e.key === 'ArrowLeft')  go(cur - 1);
  if (e.key === 'Escape')                               closeDrawer();
});

// Touch
let ty = 0;
window.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', e => {
  const d = ty - e.changedTouches[0].clientY;
  if (Math.abs(d) > 48) { d > 0 ? go(cur + 1) : go(cur - 1); }
});

render();
