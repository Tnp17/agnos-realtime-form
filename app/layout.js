import "./globals.css";

export const metadata = {
  title: "Agnos Realtime Form System",
  description: "Real-time patient form monitoring system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning className="m-0 p-0 w-full min-h-screen">
      <body className="m-0 p-0 w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}