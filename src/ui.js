// Phần giao diện HTML nằm trên game: bảng thông tin, nút Skip, trang thường, D-pad cảm ứng
import { PROFILE, SECTIONS } from './content.js';
import { touch } from './touch.js';

const $ = (id) => document.getElementById(id);

export function showPanel(section) {
  $('panel-title').textContent = section.title;
  $('panel-body').innerHTML = section.html();
  $('panel-body').scrollTop = 0;
  $('panel').hidden = false;
  $('hint').hidden = true;
}

export function hidePanel() {
  $('panel').hidden = true;
}

function renderClassic() {
  const nav = SECTIONS.map((s) => `<a href="#${s.id}">${s.title}</a>`).join('');
  const body = SECTIONS.map((s) => `<section id="${s.id}"><h2>${s.title}</h2>${s.html()}</section>`).join('');
  $('classic').innerHTML = `
    <header>
      <h1>${PROFILE.name}</h1>
      <p>${PROFILE.role}</p>
      <nav>${nav}</nav>
      <button id="play-btn" type="button">🎮 Chơi bản game</button>
    </header>
    ${body}`;
  $('play-btn').addEventListener('click', () => setMode('game'));
}

let game;

// sectionId: cuộn tới mục đó trên trang thường (vd. link .../#projects)
function setMode(mode, sectionId) {
  const classic = mode === 'classic';
  $('classic').hidden = !classic;
  $('game-view').hidden = classic;
  document.body.classList.toggle('classic-mode', classic);
  if (classic) {
    if (!$('classic').innerHTML) renderClassic();
    game.loop.sleep();
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView();
    } else {
      history.replaceState(null, '', '#classic');
      window.scrollTo(0, 0);
    }
  } else {
    game.loop.wake();
    history.replaceState(null, '', location.pathname);
  }
}

function initDpad() {
  for (const btn of document.querySelectorAll('#dpad button')) {
    const dir = btn.dataset.dir;
    const press = (e) => {
      e.preventDefault();
      touch[dir] = true;
      btn.classList.add('active');
    };
    const release = () => {
      touch[dir] = false;
      btn.classList.remove('active');
    };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

export function initUI(phaserGame) {
  game = phaserGame;
  $('skip-btn').addEventListener('click', () => setMode('classic'));
  $('panel-close').addEventListener('click', hidePanel);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hidePanel();
  });
  if (matchMedia('(pointer: coarse)').matches) {
    $('hint').textContent = 'Dùng các nút mũi tên để đi tới các đồ vật';
  }
  initDpad();

  // Mở thẳng trang thường bằng link .../#classic hoặc một mục cụ thể như #projects
  const hash = location.hash.slice(1);
  if (hash === 'classic' || SECTIONS.some((s) => s.id === hash)) {
    // Phaser bật vòng lặp ngay SAU sự kiện 'ready', nên đợi 1 nhịp rồi mới cho game ngủ
    game.events.once('ready', () => setTimeout(() => setMode('classic', hash === 'classic' ? null : hash)));
  }
}
