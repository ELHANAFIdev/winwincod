import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto p-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-blue-700">WinWinCOD 🚀</h1>
        <nav className="flex gap-4">
          {session ? (
            <Link 
              href={session.user.role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard'}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200"
            >
              لوحة التحكم
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600 px-4 py-2">
                دخول
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
                ابدأ البيع الآن
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          تاجر بدون رأس مال <br />
          <span className="text-blue-600">بنظام الدفع عند الاستلام</span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          نوفر لك المنتجات، التخزين، والتوصيل. مهمتك الوحيدة هي التسويق وجني الأرباح.
          منصة WinWinCOD هي شريكك للنجاح في التجارة الإلكترونية.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
            انشئ حساب بائع مجاناً
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon="📦" 
              title="بدون مخزون" 
              desc="لا داعي لشراء المنتجات مسبقاً. اختر من كتالوجنا وبع فوراً." 
            />
            <FeatureCard 
              icon="🚚" 
              title="شحن وتوصيل" 
              desc="نتكفل بتوصيل الطلبات لزبائنك وتحصيل الأموال نيابة عنك." 
            />
            <FeatureCard 
              icon="💰" 
              title="أرباح مضمونة" 
              desc="اسحب أرباحك فور تسليم الطلبات بكل سهولة وشفافية." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <p>© 2024 WinWinCOD Platform. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}