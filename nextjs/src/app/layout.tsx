import "@/styles/globals.css";

export const metadata = {
  title: "Next.js + Mermaid",
  description: "Next.js + Mermaid",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased border-8">{children}</body>
    </html>
  );
}
