import "./globals.css";

export const metadata = {
  title: "Agnos Realtime Form",
  description: "Real-time patient form monitoring system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}