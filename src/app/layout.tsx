import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Star-Log',
  description: '데이터로 읽는 당신의 인생 지도',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}

