// All portfolio content. Edit it here and both the game and the classic page update.
// Skills are read from skill.md in the project root.
import skillMd from '../skill.md?raw';

const SUGA_STUDIO = 'https://appmagic.rocks/publisher/suga-studio/2_1497860569';
const play = (id) => `https://play.google.com/store/apps/details?id=${id}`;
// Game icons (192px, from each Google Play page) stored in public/assets/projects/
const icon = (name) => `assets/projects/${name}.webp`;

export const PROFILE = {
  name: 'Linh Nguyen',
  role: 'Game Developer',
  about: [
    "Hi! I'm Linh.",
    'A game developer with over 5 years of experience in mobile game development using Unity, passionate about creating diverse game genres and delivering exceptional experiences to players.',
  ],
  // Released games, in this order. Name, short description and icon come from each Google Play page.
  projects: [
    {
      name: 'Tactic Manager: Road To Glory',
      desc: 'Build your dream team, manage tactics & lead your club to glory!',
      tags: ['Sports'],
      link: play('com.hiangames.tacticmanager'),
      image: icon('tactic-manager'),
    },
    {
      name: 'Garden Guardians TD',
      desc: '50+ insect towers, 80+ levels of tower defense — now playable offline!',
      tags: ['Strategy', 'Tower Defense'],
      link: play('tech.element6.gardenguardians'),
      image: icon('garden-guardians'),
    },
    {
      name: 'Pop Clover',
      desc: 'Pop bubbles, fly and fight for survival.',
      tags: ['Casual'],
      link: play('tech.element6.bubblepop'),
      image: icon('pop-clover'),
    },
    {
      name: 'Dunk Beetle',
      desc: 'Feel the beat, tap at the right time, make the shot, and then repeat.',
      tags: ['Casual'],
      link: play('tech.element6.dunkbeetle'),
      image: icon('dunk-beetle'),
    },
    {
      name: 'Bomber Wasp',
      desc: 'Fun bomb game: show your lightning-fast reflexes, avoid bombsquad to stay alive.',
      tags: ['Casual', 'Action'],
      link: play('tech.element6.bomb'),
      image: icon('bomber-wasp'),
    },
    {
      name: 'Winged Survivors Rush',
      desc: 'Fun & unique endless flying gameplay. Push your reflex skill to the max level.',
      tags: ['Casual'],
      link: play('tech.element6.flow'),
      image: icon('winged-survivors-rush'),
    },
    {
      name: 'SwatzZapz',
      desc: 'Immerse in a lively insect game, 100+ levels: fly swatting, matching game & more.',
      tags: ['Casual'],
      link: play('tech.element6.SwatzZapz'),
      image: icon('swatzzapz'),
    },
    // Suga Studio games, no longer on the stores (info and icons from AppMagic): they link to the studio's AppMagic page
    {
      name: 'I Am Hero: Superheroes Epic Battles',
      desc: 'Recruit superheroes from manga, comics and legends, build a powerful team and win through strategic combat.',
      tags: ['RPG'],
      link: SUGA_STUDIO,
      image: icon('i-am-hero'),
    },
    {
      name: 'Overload: Online Car Shooting',
      desc: 'Multiplayer car shooting: load your guns and missiles and blast away players from all over the world.',
      tags: ['Racing', 'Action'],
      link: SUGA_STUDIO,
      image: icon('overload'),
    },
    {
      name: 'Overleague',
      desc: 'Fast-paced multiplayer combat racing packed with guns, explosions and 10+ cars to choose from.',
      tags: ['Racing', 'Action'],
      link: SUGA_STUDIO,
      image: icon('overleague'),
    },
  ],
  contact: [
    { label: 'Email', value: 'linhnc2312@gmail.com', href: 'mailto:linhnc2312@gmail.com' },
    { label: 'LinkedIn', value: 'linkedin.com/in/linh-nguyen-profile', href: 'https://www.linkedin.com/in/linh-nguyen-in-87b965214' },
  ],
};

// Parse skill.md: "## Group" and "- skill"
export function parseSkills(md) {
  const groups = [];
  let cur = null;
  for (const line of md.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    const h = line.match(/^##\s+(.+)/);
    if (h) {
      cur = { title: h[1].trim(), items: [] };
      groups.push(cur);
      continue;
    }
    const li = line.match(/^\s*[-*]\s+(.+)/);
    if (li && cur) cur.items.push(li[1].trim());
  }
  return groups;
}

export const SKILLS = parseSkills(skillMd);

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Each section = 1 object in the room = 1 section on the classic page
export const SECTIONS = [
  {
    id: 'about',
    title: 'About',
    html: () => PROFILE.about.map((p) => `<p>${esc(p)}</p>`).join(''),
  },
  {
    id: 'projects',
    title: 'Projects',
    html: () =>
      `<div class="projects">${PROFILE.projects
        .map(
          (p) => `<article class="project">
            <img src="${esc(p.image)}" alt="${esc(p.name)} icon" width="64" height="64" loading="lazy" />
            <div>
              <h3>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h3>
              <p>${esc(p.desc)}</p>
              <ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            </div>
          </article>`,
        )
        .join('')}</div>`,
  },
  {
    id: 'skills',
    title: 'Skills',
    html: () =>
      SKILLS.map(
        (g) => `<h3>${esc(g.title)}</h3><ul class="chips">${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`,
      ).join(''),
  },
  {
    id: 'contact',
    title: 'Contact',
    html: () =>
      `<ul class="contact">${PROFILE.contact
        .map((c) => `<li><span>${esc(c.label)}</span> <a href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.value)}</a></li>`)
        .join('')}</ul>`,
  },
];
