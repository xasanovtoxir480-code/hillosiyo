---
Task ID: 2
Agent: Main Agent
Task: Admin panel ga toliq funksionallik qoshish

Work Log:
- Yangilangan Prisma schema: WarehouseStock modeli qoshildi (ombor-mahsulot boglanish)
- Baza qayta seed qilindi: 4 ombor x 24 mahsulot = 96 ta ombor-mahsulot yozuvi
- API routes yaratildi:
  - /api/auth (POST) - login/parol tasdiqlash
  - /api/warehouses (GET/POST/PATCH/DELETE) - ombor CRUD
  - /api/stock (GET/POST/PATCH) - ombor mahsulot boshqaruvi
  - /api/transfer (POST) - mahsulot omborlar orasida o'tkazish
- Admin panel toliq qayta yozildi:
  - Login ekran (admin/admin123) - token asosida autentifikatsiya
  - 4 ta tab: Buyurtmalar, Omborlar, Buyurtma+, O'tkazish
  - Ombor detail sahifa: mahsulotlar ro'yxati, qo'shish, o'tkazish
  - Buyurtma yaratish formasi
  - Ombor qo'shish/o'chirish
- Prisma client cache muammosi hal qilindi (db.ts ni soddalashtirish)

Stage Summary:
- Admin panel toliq ishlaydi
- Login: admin / admin123
- Omborlar CRUD ishlaydi
- Mahsulot o'tkazish ishlaydi
- Buyurtma yaratish ishlaydi
- Barcha API endpointlari testdan o'tdi
