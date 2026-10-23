import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { AppProviders } from '@/components/AppContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Adhikar — Citizen Welfare & Government Schemes Portal',
  description:
    'Comprehensive Indian Government schemes directory, eligibility guidance, and scam verification portal for citizens.',
  keywords: [
    'Government Schemes',
    'Sarkari Yojana',
    'Adhikar',
    'PM Kisan',
    'Ayushman Bharat',
    'Scheme Verification',
    'Indian Citizen Portal',
  ],
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flicker script for dark mode on reload */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('adhikar_theme');
                  var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.classList.remove('dark');
                  }
                  var savedLang = localStorage.getItem('adhikar_language');
                  if (savedLang === 'Hindi') document.documentElement.lang = 'hi';
                  else if (savedLang === 'Marathi') document.documentElement.lang = 'mr';
                  else if (savedLang === 'Hinglish') document.documentElement.lang = 'hinglish';
                  else document.documentElement.lang = 'en';
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppProviders>
          <Nav />
          <main className="container">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
