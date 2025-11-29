import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { LoginProvider } from "@/hooks/LoginContext";

export const metadata: Metadata = {
  title: "NotNotMike's Achievement Tracker",
  description:
    "Site for tracking the achievements, Halo skulls and terminals, and more.",
};

type LayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex flex-col">
          <LoginProvider>
            <Navigation />
            <main className="py-4 px-4 md:px-8">{children}</main>
          </LoginProvider>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
