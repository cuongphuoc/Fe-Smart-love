# Scripts Khởi Tạo Database

Các script này giúp khởi tạo cấu trúc database và tạo dữ liệu mẫu cho ứng dụng.

## Cấu Trúc Database

Database "SLD" gồm hai collections chính:

1. **couplefunds**: Lưu trữ thông tin về quỹ chung của cặp đôi
   - Thông tin quỹ (tên, số dư)
   - Thông tin đối tác (tên, email, đóng góp)
   - Lịch sử giao dịch (số tiền, loại, danh mục, mô tả, ngày tạo, người tạo)
   - Mục tiêu (tên, số tiền, hạn chót, trạng thái)

2. **tasks**: Lưu trữ danh sách công việc
   - Tiêu đề công việc
   - Trạng thái hoàn thành
   - Hạn hoàn thành
   - Thời gian tạo/cập nhật

## Cách Sử Dụng Scripts

### Khởi Tạo Quỹ Chung (Couple Fund)

Chạy lệnh sau để khởi tạo collection "couplefunds" và tạo dữ liệu mẫu:

```bash
node ./src/scripts/initCoupleFund.js
```

Script sẽ:
- Kiểm tra nếu đã có dữ liệu
- Nếu chưa có, sẽ tạo dữ liệu mẫu
- Nếu đã có, sẽ hỏi bạn có muốn xóa và tạo lại không

### Khởi Tạo Danh Sách Công Việc (Tasks)

Chạy lệnh sau để khởi tạo collection "tasks" và tạo dữ liệu mẫu:

```bash
node ./src/scripts/initTasks.js
```

Script sẽ:
- Kiểm tra nếu đã có dữ liệu
- Nếu chưa có, sẽ tạo các tasks mẫu
- Nếu đã có, sẽ hiển thị danh sách hiện tại và hỏi bạn có muốn xóa và tạo lại không

## Xác Nhận Kết Quả

Sau khi chạy các script, bạn có thể:

1. Kiểm tra thông qua MongoDB Atlas
2. Hoặc truy cập API để xem dữ liệu:
   - `/api/couple-fund` - để xem quỹ chung
   - `/api/tasks` - để xem danh sách công việc 