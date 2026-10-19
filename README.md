# Pixel Portfolio

Portfolio dạng game 2D pixel art (Phaser 3 + Vite). Đi lại trong căn phòng, bước tới đồ vật để xem
**Giới thiệu · Dự án · Kỹ năng · Liên hệ**. Có nút **Skip** để xem bản trang thường, và D-pad cho điện thoại.

## Chạy

```bash
npm install
npm run dev
```

Build để đưa lên mạng: `npm run build` → upload thư mục `dist/` (GitHub Pages, Netlify, Vercel...).

## Sửa nội dung

| Muốn sửa | File |
|---|---|
| Tên, giới thiệu, dự án, liên hệ | `src/content.js` |
| Kỹ năng | `skill.md` |
| Vị trí đồ vật / vùng kích hoạt | mảng `OBJECTS` trong `src/scenes/RoomScene.js` |
| Màu sắc, bố cục bảng thông tin | `src/style.css` |

Link trực tiếp: `/#classic` mở trang thường, `/#projects` (hoặc `#about`, `#skills`, `#contact`) mở thẳng mục đó.

## Thay hình bằng asset thật (itch.io hoặc hình của bạn)

Hiện tại hình được vẽ bằng code trong `src/art.js`. Để thay:

1. Tải asset miễn phí trên itch.io (tìm "pixel art tileset", "pixel character 16x16"), **đọc kỹ license**.
2. Bỏ file vào `public/assets/`, ví dụ `public/assets/bookshelf.png`.
3. Thêm `preload()` vào `RoomScene` và load với **cùng key** đang dùng:
   ```js
   preload() {
     this.load.image('obj-skills', 'assets/bookshelf.png');
     this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 16 });
   }
   ```
4. Hình nào đã load từ file thì `src/art.js` tự bỏ qua, không cần xoá code. Riêng nhân vật dạng spritesheet có frame đánh số (0, 1, 2...) nên cần sửa tên frame trong animation ở `RoomScene.js`.

Ghi nguồn asset (credit) vào README nếu license yêu cầu.
