import "./globals.css";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "./provider/theme-provider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} min-h-screen flex flex-col font-poppins`}>
        <ThemeProvider>
          <Navbar />

          {/* Main content grows to push footer down */}
          <main className="min-h-screen flex-1">
            {children}
          </main>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

