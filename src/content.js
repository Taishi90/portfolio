// All portfolio content. Edit it here and both the game and the classic page update.
// Skills are read from skill.md in the project root.
import skillMd from '../skill.md?raw';

const play = (id) => `https://play.google.com/store/apps/details?id=${id}`;
// Google Play icon served at 192px (Google's image CDN resizes via the "=s<size>" suffix)
const icon = (id) => `https://play-lh.googleusercontent.com/${id}=s192`;

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
      image: icon('OlUw2jaZSxOI6F3sWYNBw-a4i2vJ8aWkgwiSvv3QV5UDBMwzGNXl625D4bE0RIhOi4UgzVzNv0pxA1kWhk67Ng'),
    },
    {
      name: 'Garden Guardians TD',
      desc: '50+ insect towers, 80+ levels of tower defense — now playable offline!',
      tags: ['Strategy', 'Tower Defense'],
      link: play('tech.element6.gardenguardians'),
      image: icon('to-R_KIAoQLqmO67Y75RDknO1OXLnmkQEn5vGkfBv7_W8fd0ShErVmj_FOgCN06FFCu6E58mukaeb9YT7o7Xqg'),
    },
    {
      name: 'Pop Clover',
      desc: 'Pop bubbles, fly and fight for survival.',
      tags: ['Casual'],
      link: play('tech.element6.bubblepop'),
      image: icon('dp-sklMpZ3N8DsNphbndOcGPdrTpzBJeqZi-tqqHIEU2nSNUS-vEYGd3efWSsr8kzr3rYVFdpcl-0ImRtgAwFA'),
    },
    {
      name: 'Dunk Beetle',
      desc: 'Feel the beat, tap at the right time, make the shot, and then repeat.',
      tags: ['Casual'],
      link: play('tech.element6.dunkbeetle'),
      image: icon('CvVjh5T6QjYjrDuplmGYHeT02bgyQHG2zBTJTN6Rb_4Y2CY9V-T2fi7MzkIRc0f71JE5KsWi7q6_qexIgtw1'),
    },
    {
      name: 'Bomber Wasp',
      desc: 'Fun bomb game: show your lightning-fast reflexes, avoid bombsquad to stay alive.',
      tags: ['Casual', 'Action'],
      link: play('tech.element6.bomb'),
      image: icon('y88jlPsXR7bFZBSoavKxdXuQzUH8mKN0w9f3sOEkThTzhwi8lNTMeoWh5st1-8Q0Ka3F-PO6o6-fE4UmsYl_IQ'),
    },
    {
      name: 'Winged Survivors Rush',
      desc: 'Fun & unique endless flying gameplay. Push your reflex skill to the max level.',
      tags: ['Casual'],
      link: play('tech.element6.flow'),
      image: icon('YgFn_JF7VnvzNZUIxrTaK6UWn2cltOWNOsSYnq3W_VppWheQ2LItPY3xE0z_WRj_URVrsXulY0_twBtyg4-wxw'),
    },
    {
      name: 'SwatzZapz',
      desc: 'Immerse in a lively insect game, 100+ levels: fly swatting, matching game & more.',
      tags: ['Casual'],
      link: play('tech.element6.SwatzZapz'),
      image: icon('SpR8682IkzywBafYLBCyIQlX0TjuA3mEsIZdAUi0VxcpVL8Pe748wV947pO8CdD_6dZztxZ14Dk4nwwaFYOFlS4'),
    },
  ],
  contact: [
    { label: 'Email', value: 'you@email.com', href: 'mailto:you@email.com' },
    { label: 'GitHub', value: 'github.com/your-name', href: 'https://github.com/' },
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
            <img src="${esc(p.image)}" alt="${esc(p.name)} icon" width="64" height="64" loading="lazy" referrerpolicy="no-referrer" />
            <div>
              <h3><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.name)}</a></h3>
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
