import "./globals.css";
import "leaflet/dist/leaflet.css";  // ← FIX: guaranteed loading order

export const metadata = {
  title: "OATHZ Security Dashboard",
  description: "Trackblock device monitoring UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
