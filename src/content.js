// All portfolio content. Edit it here and both the game and the classic page update.
// Skills are read from skill.md in the project root.
import skillMd from '../skill.md?raw';

export const PROFILE = {
  name: 'Linh Nguyen',
  role: 'Developer', // TODO: your job title
  about: [
    "Hi! I'm Linh.",
    'A game developer with over 5 years of experience in mobile game development using Unity, passionate about creating diverse game genres and delivering exceptional experiences to players.',
  ],
  projects: [
    {
      name: 'Pixel Portfolio',
      desc: 'This very site: a portfolio as a 2D pixel art game.',
      tech: ['Phaser 3', 'Vite'],
      link: '',
    },
    {
      name: 'Sample project',
      desc: 'A short description of the project. (Replace with a real one)',
      tech: ['JavaScript'],
      link: '',
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
      PROFILE.projects
        .map(
          (p) => `<article class="project">
            <h3>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h3>
            <p>${esc(p.desc)}</p>
            <ul class="chips">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          </article>`,
        )
        .join(''),
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
