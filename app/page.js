import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Real-Time Patient Form System</h1>
      <p className="text-gray-600">กรุณาเลือกบทบาทที่ต้องการเข้าใช้งาน:</p>

      <div className="flex gap-4">
        <Link
          href="/patient"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          ไปที่หน้า Patient Form (คนไข้)
        </Link>

        <Link
          href="/staff"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          ไปที่หน้า Staff Monitor (เจ้าหน้าที่)
        </Link>
      </div>
    </main>
  );
}