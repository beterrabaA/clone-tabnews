import type { Metadata } from "next";
import { ReactNode } from "react";

export const meta: Metadata = {
  title: "Clone Tabnews",
  description: "A clone of Tabnews",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
