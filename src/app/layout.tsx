import type { Metadata } from 'next';
import { ToastProvider } from '@/components/toast-provider';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biblioteca ETE — Sistema de Gestão Escolar',
  description: 'Sistema completo de gestão de biblioteca escolar da ETE',
  icons: {
    icon: '/ete-logo.png',
    shortcut: '/ete-logo.png',
    apple: '/ete-logo.png',
  },
};

const themeInitializer = `
  (function () {
    try {
      var savedTheme = localStorage.getItem('biblioteca-theme') || localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    } catch (_) {}
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
