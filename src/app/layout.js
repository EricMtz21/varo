import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Varo",
  description: "Tu gestor de finanzas personales",
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/favicon-light.png?v=2',
        href: '/favicon-light.png?v=2',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/favicon-dark.png?v=2',
        href: '/favicon-dark.png?v=2',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Varo",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#07090F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${nunitoSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
