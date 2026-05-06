export const metadata = {
  title: "Betabnews",
  description: "A news aggregator for the Brazilian startup ecosystem.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Layout UI (e.g. Nav) */}
        <main>{children}</main>
      </body>
    </html>
  );
}
