import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthActionProvider } from "./../context/authContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MAGNET - Magang dan Monitoring Elektronik Terpadu",
  description: "Sistem Informasi pengelolaan data peserta magang",
  icons: '/assets/image/logo.png'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthActionProvider>
          {children}
        </AuthActionProvider>
      </body>
    </html>
  );
}
