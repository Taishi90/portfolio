// All portfolio content. Edit it here and both the game and the classic page update.
// Skills are read from skill.md in the project root.
import skillMd from '../skill.md?raw';

const SUGA_STUDIO = 'https://appmagic.rocks/publisher/suga-studio/2_1497860569';
const play = (id) => `https://play.google.com/store/apps/details?id=${id}`;
// Game icons (192px, from each Google Play page) stored in public/assets/projects/
const icon = (name) => `assets/projects/${name}.webp`;

export const PROFILE = {
  name: 'Linh Nguyen',
  role: 'Game Development Lead',
  about: [
    "Hi! I'm Linh.",
    'Game Development Lead and Unity developer with 10+ years in mobile games. I lead development teams of 7 people, set up workflows, and turn product requirements into clear, actionable roadmaps — while staying hands-on with gameplay systems and architecture.',
    "With my teams, I've shipped 10 titles across sports management, tower defense, casual, idle RPG and racing, mentored developers, and worked closely with product and creative teams from prototype to launch.",
  ],
  // Released games, in this order. Name, short description and icon come from each Google Play page.
  projects: [
    {
      id: 'tactic-manager',
      name: 'Tactic Manager: Road To Glory',
      desc: 'Build your dream team, manage tactics & lead your club to glory!',
      tags: ['Sports'],
      link: play('com.hiangames.tacticmanager'),
      image: icon('tactic-manager'),
    },
    {
      id: 'garden-guardians',
      name: 'Garden Guardians TD',
      desc: '50+ insect towers, 80+ levels of tower defense — now playable offline!',
      tags: ['Strategy', 'Tower Defense'],
      link: play('tech.element6.gardenguardians'),
      image: icon('garden-guardians'),
    },
    {
      id: 'pop-clover',
      name: 'Pop Clover',
      desc: 'Pop bubbles, fly and fight for survival.',
      tags: ['Casual'],
      link: play('tech.element6.bubblepop'),
      image: icon('pop-clover'),
    },
    {
      id: 'dunk-beetle',
      name: 'Dunk Beetle',
      desc: 'Feel the beat, tap at the right time, make the shot, and then repeat.',
      tags: ['Casual'],
      link: play('tech.element6.dunkbeetle'),
      image: icon('dunk-beetle'),
    },
    {
      id: 'bomber-wasp',
      name: 'Bomber Wasp',
      desc: 'Fun bomb game: show your lightning-fast reflexes, avoid bombsquad to stay alive.',
      tags: ['Casual', 'Action'],
      link: play('tech.element6.bomb'),
      image: icon('bomber-wasp'),
    },
    {
      id: 'winged-survivors-rush',
      name: 'Winged Survivors Rush',
      desc: 'Fun & unique endless flying gameplay. Push your reflex skill to the max level.',
      tags: ['Casual'],
      link: play('tech.element6.flow'),
      image: icon('winged-survivors-rush'),
    },
    {
      id: 'swatzzapz',
      name: 'SwatzZapz',
      desc: 'Immerse in a lively insect game, 100+ levels: fly swatting, matching game & more.',
      tags: ['Casual'],
      link: play('tech.element6.SwatzZapz'),
      image: icon('swatzzapz'),
    },
    // Suga Studio games, no longer on the stores (info and icons from AppMagic): they link to the studio's AppMagic page.
    // desc = first two sentences of the official store description, verbatim
    {
      id: 'i-am-hero',
      name: 'I Am Hero: AFK Teamfight',
      desc: 'I Am Hero presents unique gameplay with the combination of idle RPG elements with the tactics of auto chess teamfight. Our AFK game lets you build a powerful team to auto fight on your behalf.',
      tags: ['Idle RPG', 'Auto Battler'],
      link: SUGA_STUDIO,
      image: icon('i-am-hero'),
    },
    {
      id: 'overload',
      name: 'Overload: Online Car Shooting',
      desc: 'Overload - the must-have racing action title for your mobile device. Experience the thrill of multiplayer, fast-paced car firing and shooting with amazing graphics and adrenaline pumping action.',
      tags: ['Racing', 'Action'],
      link: SUGA_STUDIO,
      image: icon('overload'),
    },
    {
      id: 'overleague',
      name: 'Overleague',
      desc: 'The ultimate combat racing game is here! Overleague is one of the best racing games packed with guns, action, shooting and explosions.',
      tags: ['Racing', 'Action'],
      link: SUGA_STUDIO,
      image: icon('overleague'),
    },
  ],
  contact: [
    { label: 'Email', value: 'linhnc2312@gmail.com', href: 'mailto:linhnc2312@gmail.com' },
    { label: 'LinkedIn', value: 'linkedin.com/in/linh-nguyen-in-profile', href: 'https://www.linkedin.com/in/linh-nguyen-in-profile/' },
  ],
};

// Highlight numbers in the classic page hero
export const STATS = [
  { value: '10+', label: 'Years in mobile games' },
  { value: String(PROFILE.projects.length), label: 'Games released' },
  { value: 'Unity', label: 'Main engine' },
];

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

export const esc = (s) =>
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
          (p) => `<article class="project" data-project="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(p.name)}: show details">
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
      `<div class="skill-groups">${SKILLS.map(
        (g) =>
          `<div class="skill-group"><h3>${esc(g.title)}</h3><ul class="chips">${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>`,
      ).join('')}</div>`,
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
