// Toàn bộ nội dung portfolio. Sửa ở đây là cả game lẫn trang thường đều đổi theo.
// Riêng phần Kỹ năng được đọc từ file skill.md ở thư mục gốc.
import skillMd from '../skill.md?raw';

export const PROFILE = {
  name: 'Linh Nguyen',
  role: 'Developer', // TODO: chức danh của bạn
  about: [
    'Xin chào! Mình là Linh. (Sửa đoạn giới thiệu này trong src/content.js)',
    'Mình thích làm web, game nhỏ và những thứ vui vui có tính tương tác.',
  ],
  projects: [
    {
      name: 'Pixel Portfolio',
      desc: 'Chính là trang này: portfolio dạng game 2D pixel art.',
      tech: ['Phaser 3', 'Vite'],
      link: '',
    },
    {
      name: 'Dự án mẫu',
      desc: 'Mô tả ngắn về dự án. (Thay bằng dự án thật)',
      tech: ['JavaScript'],
      link: '',
    },
  ],
  contact: [
    { label: 'Email', value: 'ban@email.com', href: 'mailto:ban@email.com' },
    { label: 'GitHub', value: 'github.com/ten-ban', href: 'https://github.com/' },
  ],
};

// Đọc skill.md: "## Nhóm" và "- kỹ năng"
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

// Mỗi section = 1 đồ vật trong phòng = 1 mục trên trang thường
export const SECTIONS = [
  {
    id: 'about',
    title: 'Giới thiệu',
    html: () =>
      `<p class="lead"><strong>${esc(PROFILE.name)}</strong> · ${esc(PROFILE.role)}</p>` +
      PROFILE.about.map((p) => `<p>${esc(p)}</p>`).join(''),
  },
  {
    id: 'projects',
    title: 'Dự án',
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
    title: 'Kỹ năng',
    html: () =>
      SKILLS.map(
        (g) => `<h3>${esc(g.title)}</h3><ul class="chips">${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`,
      ).join(''),
  },
  {
    id: 'contact',
    title: 'Liên hệ',
    html: () =>
      `<ul class="contact">${PROFILE.contact
        .map((c) => `<li><span>${esc(c.label)}</span> <a href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.value)}</a></li>`)
        .join('')}</ul>`,
  },
];
