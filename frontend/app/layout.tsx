import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import UserSelector from "@/components/UserSelector";
import NavLinks from "@/components/NavLinks";

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Limited Inventory Order System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <UserProvider>
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <NavLinks />
              </div>
              <UserSelector />
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
