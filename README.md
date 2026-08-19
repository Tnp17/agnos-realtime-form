# Agnos Real-Time Form System

ระบบกรอกฟอร์มลงทะเบียนคนไข้แบบ Real-time ที่ช่วยให้เจ้าหน้าที่ (Staff) ติดตามสถานะและรับข้อมูลจากคนไข้ (Patient) ได้ทันทีในขณะกำลังกรอก โดยไม่ต้องรอ Refresh หน้าจอ

---

## 🔗 Live Application & Repository
* **Deployed Application:** [https://agnos-realtime-form.netlify.app](https://agnos-realtime-form.netlify.app)
* **GitHub Repository:** [https://github.com/Tnp17/agnos-realtime-form](https://github.com/Tnp17/agnos-realtime-form)

---

## 🛠️ Tech Stack & Libraries
* **Framework:** Next.js 16 (App Router, JavaScript)
* **Styling:** Tailwind CSS
* **Real-time Engine:** Pusher (WebSockets)

---

## 🚀 Setup & Installation Guide

1. **Clone the Repository:**  
   `git clone https://github.com/Tnp17/agnos-realtime-form.git`  
   `cd agnos-realtime-form`

2. **Install Dependencies:**  
   `npm install`

3. **Configure Environment Variables:**  
   สร้างไฟล์ `.env.local` ไว้ที่ root ของโปรเจกต์ แล้วใส่ค่า Credentials จาก Pusher:
   * `PUSHER_APP_ID=your_app_id`
   * `NEXT_PUBLIC_PUSHER_KEY=your_pusher_key`
   * `PUSHER_SECRET=your_pusher_secret`
   * `NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster`

4. **Run Development Server:**  
   `npm run dev`  
   เข้าใช้งานได้ที่ `http://localhost:3000`

---

## 🏗️ Development Planning Documentation

```text
📁 1. Project Structure
agnos-realtime-form/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── pusher-event/
│   │   │       └── route.js        # API Route สำหรับ Trigger เหตุการณ์ผ่าน Pusher Server
│   │   ├── patient/
│   │   │   └── page.jsx            # หน้าสำหรับคนไข้กรอกฟอร์ม (/patient)
│   │   ├── staff/
│   │   │   └── page.jsx            # หน้าสำหรับเจ้าหน้าที่ดูข้อมูลเรียลไทม์ (/staff)
│   │   ├── globals.css             # Tailwind Stylesheet
│   │   ├── layout.js               # Root Layout
│   │   └── page.js                 # หน้าแรกสำหรับเลือก Role เข้าใช้งาน (Landing Page)
│   ├── components/
│   │   ├── PatientForm.jsx         # Component จัดการ Form และส่งสถานะ Debounce
│   │   └── StaffDashboard.jsx      # Component รับ Event และแสดงผลบน Dashboard
│   └── lib/
│       ├── pusher-client.js        # Pusher Client instance (สำหรับ Subscribe)
│       └── pusher-server.js        # Pusher Server instance (สำหรับ Trigger)
├── jsconfig.json                   # ตั้งค่า Path Alias (@/*) สำหรับ JavaScript
└── package.json

🎨 2. UI/UX & Responsive Design
- Mobile-First Grid Layout: ใช้ระบบ Grid ของ Tailwind CSS (grid-cols-1 md:grid-cols-2, grid-cols-3) ปรับการแสดงผลตามขนาดหน้าจอ
- Status Badges & Visual Cues: ใช้สีและแอนิเมชันสำหรับบอกสถานะชัดเจนที่หน้า Staff (Actively filling in, Inactive in the form, Submitted)
- Form UX: ฟอร์มถูกแบ่งตามประเภทข้อมูลอย่างเป็นระเบียบ และกำหนด required ในฟิลด์ที่จำเป็น

🧩 3. Component Architecture
- PatientForm.jsx (Client Component): จัดการ State ข้อมูลคนไข้ทั้งหมด ตรวจจับ Event onChange ส่งอัปเดตผ่าน API ทันที พร้อมระบบ Debounce Timer (3 วินาที)
- StaffDashboard.jsx (Client Component): Subscribe เข้ากับ Channel และ Event ของ Pusher เพื่อรับและอัปเดตข้อมูลบน UI ทันที
- pusher-event/route.js (API Route): รับ Payloads จาก PatientForm แล้วสั่ง pusherServer.trigger เพื่อกระจายข้อมูล (Broadcast)

🔄 4. Real-time Synchronization Flow
1. User Types: คนไข้พิมพ์ข้อมูลลงในช่องกรอกบนหน้า /patient
2. Debounce & Update Event: ฟังก์ชัน handleChange อัปเดต Local State และยิง HTTP POST ไปที่ /api/pusher-event พร้อมสถานะ Actively filling in
3. Pusher Trigger: API Route รับข้อมูลแล้วสั่ง pusherServer.trigger() กระจายข้อมูลไปยัง Channel patient-session บน Event update-form
4. WebSocket Push: Pusher Broadcast ข้อมูลไปยัง Client ที่ต่อ WebSocket ฟังอยู่อัตโนมัติ
5. Staff UI Render: หน้า /staff รับ Data Payload ผ่าน WebSocket แล้วสั่ง Re-render หน้าจอและเปลี่ยน Badge สถานะทันที
6. Inactivity Detection: หากหยุดพิมพ์ครบ 3 วินาที Timer จะยิง Event ปรับสถานะเป็น Inactive in the form อัตโนมัติ