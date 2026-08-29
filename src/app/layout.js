import { cookies } from "next/headers";
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
  viewportFit: "cover",
};

// Resuelve el tema antes del primer pintado. Sin esto, un usuario en modo
// oscuro ve un destello claro mientras hidrata React. El servidor ya resuelve
// "dark"/"light" desde la cookie; este script solo decide el caso "system"
// (y adopta el valor viejo de localStorage la primera vez).
const THEME_SCRIPT = `(function(){try{
var read=function(n){var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):null;};
var save=function(n,v){document.cookie=n+'='+encodeURIComponent(v)+'; path=/; max-age=31536000; samesite=lax';};
// Migración: estas preferencias vivían en localStorage antes de usar cookie.
['theme','activeTab'].forEach(function(k){
  var legacy=localStorage.getItem(k);
  if(legacy){ if(!read(k)) save(k,legacy); localStorage.removeItem(k); }
});
var t=read('theme')||'system';
var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',dark);
}catch(e){}})();`;

export default async function RootLayout({ children }) {
  const theme = (await cookies()).get("theme")?.value ?? "system";

  return (
    <html
      lang="es"
      className={`${nunitoSans.variable} h-full ${theme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-full overscroll-y-none">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
