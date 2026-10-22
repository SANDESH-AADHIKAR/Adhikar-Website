import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Link from 'next/link';

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
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-links">
              <a href="https://www.india.gov.in" target="_blank" rel="noreferrer">
                National Portal of India (india.gov.in) ↗
              </a>
              <a href="https://www.mygov.in" target="_blank" rel="noreferrer">
                MyGov Platform ↗
              </a>
              <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer">
                Digital India ↗
              </a>
              <Link href="/schemes">Schemes Directory</Link>
              <Link href="/guard">SchemeGuard</Link>
              <Link href="/assistant">Citizen Assistant</Link>
              <Link href="/feedback">Feedback</Link>
            </div>
            <p className="footer-copy">
              Adhikar is an informational civic portal designed to simplify access to welfare schemes. All official applications, circulars, and guidelines must be verified directly on official government websites (ending in <strong>.gov.in</strong> or <strong>.nic.in</strong>). Never share banking OTPs, PINs, or Aadhaar credentials on unofficial platforms.
            </p>
            <div className="footer-bottom">
              © {new Date().getFullYear()} Adhikar · Verified Citizen Portal
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
