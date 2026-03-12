import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Star-Log',
  description: '데이터로 읽는 당신의 인생 지도',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh antialiased relative">
        {/* 배경 이미지: 가장 뒤 레이어 (::before/::after 오버레이·별보다 뒤) */}
        <div
          className="fixed inset-0 -z-[2] bg-[#0a1128] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/main-bg.jpg')" }}
          aria-hidden
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

