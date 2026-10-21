// HTML UI layered over the game: info panel, Skip button, classic page, touch D-pad
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

// Called when the room starts: show the in-game hint and D-pad (hidden during the intro)
export function enterRoom() {
  document.body.classList.remove('intro');
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
      <button id="play-btn" type="button">🎮 Play the game</button>
    </header>
    ${body}`;
  $('play-btn').addEventListener('click', () => setMode('game'));
}

let game;

// sectionId: scroll to that section on the classic page (e.g. link .../#projects)
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
    $('hint').textContent = 'Use the arrow buttons to walk up to the objects';
  }
  initDpad();

  // Open the classic page directly via .../#classic or a specific section such as #projects
  const hash = location.hash.slice(1);
  if (hash === 'classic' || SECTIONS.some((s) => s.id === hash)) {
    // Phaser starts its loop right AFTER the 'ready' event, so wait one tick before putting it to sleep
    game.events.once('ready', () => setTimeout(() => setMode('classic', hash === 'classic' ? null : hash)));
  }
}
