# Memories — những gì đã làm & bài học

> Đọc file này trước khi bắt đầu việc mới. Làm xong việc gì đáng nhớ thì thêm 1 mục vào cuối.
> Mẫu: `## YYYY-MM-DD — Việc đã làm` → **Làm gì**, **Quyết định**, **Bài học / lỗi đã gặp**.

## Tổng quan dự án (cập nhật khi cấu trúc thay đổi)

- Portfolio dạng game 2D pixel art: **Phaser 3 + Vite**, JavaScript thuần (không TypeScript, không framework).
- Chạy: `npm install` → `npm run dev` (http://localhost:5173). Build: `npm run build` → thư mục `dist/`.
- Cấu trúc:
  - `src/content.js` — TOÀN BỘ nội dung (giới thiệu, dự án, liên hệ). Game và trang thường dùng chung.
  - `skill.md` — kỹ năng. Được import bằng `?raw` và parse `## Nhóm` / `- kỹ năng`.
  - `src/art.js` — hình pixel art tạm vẽ bằng code (nhân vật, 4 đồ vật, phòng).
  - `src/scenes/RoomScene.js` — phòng, va chạm, di chuyển, vùng kích hoạt (mảng `OBJECTS`).
  - `src/ui.js` — bảng thông tin HTML, nút Skip, trang thường, D-pad.
  - `src/touch.js` — trạng thái nút D-pad, scene đọc mỗi frame.
- Game 320×240, ô 16px, `pixelArt: true`, `Scale.FIT`. Tường trên cao 48px.

## 2026-10-19 — Dựng toàn bộ phiên bản đầu

**Làm gì**
1. Khung Vite + Phaser 3 (commit riêng).
2. Phòng + nhân vật + 4 đồ vật: khung ảnh = Giới thiệu, bàn máy tính = Dự án, kệ sách = Kỹ năng, hộp thư = Liên hệ.
3. D-pad cảm ứng, nút Skip → trang thường, link `#classic` / `#about|#projects|#skills|#contact`.

**Quyết định**
- Chữ/thông tin hiển thị bằng **HTML phủ trên canvas**, không vẽ chữ trong Phaser → chữ nét, cuộn được, có link bấm được, tiếng Việt chuẩn.
- Bảng thông tin **tự mở khi bước vào vùng**, tự đóng khi rời đi; bấm × thì không mở lại cho tới lần bước vào sau.
- Hình tạm **vẽ bằng code** thay vì tải asset itch.io → chạy được ngay, không lo bản quyền. Thay ảnh thật: xem README.
- Một nguồn nội dung duy nhất (`content.js` + `skill.md`) cho cả game lẫn trang thường.
- Điện thoại dọc: game trên, bảng giữa, D-pad dưới (bảng không che phòng, vẫn đi được khi đang đọc).

**Bài học / lỗi đã gặp**
- Vite báo **500 "Failed to resolve import"** ngay lúc đang tạo file mới → chỉ là tạm thời (file chưa tồn tại khi HMR chạy). Tải lại trang là hết.
- Nhãn chữ trong Phaser bị răng cưa vì `pixelArt: true` → vẽ chữ to (24px) rồi `setScale(1/3)` và `label.texture.setFilter(LINEAR)`.
- Phaser bật vòng lặp **ngay sau** sự kiện `ready` → muốn `game.loop.sleep()` lúc khởi động thì phải `setTimeout` 1 nhịp.
- Test tự động: `KeyboardEvent` giả không có `keyCode` nên Phaser bỏ qua → test di chuyển bằng cách bắn `pointerdown/pointerup` vào nút `#dpad`, hoặc dịch nhân vật bằng `game.scene.keys.Room.player.body.reset(x, y)` (`window.game` chỉ có khi `npm run dev`).
- Tab trình duyệt bị ẩn thì `requestAnimationFrame` không chạy → `game.loop.frame` đứng ở 0. Phải hiện tab lên mới test được.
- Chưa kiểm tra được bố cục **điện thoại xoay ngang** (giả lập không bật cảm ứng ở khổ ngang) → nên thử trên máy thật.
