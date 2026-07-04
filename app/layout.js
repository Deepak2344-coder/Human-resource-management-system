import "./globals.css";
import { getSession } from "@/lib/auth";
import Navbar from "./Navbar";

export const metadata = {
  title: "HRMS - Payroll & Notifications",
  description: "Human Resource Management System",
};

export default async function RootLayout({ children }) {
  const user = await getSession();

  return (
    <html lang="en">
      <body>
        {user && <Navbar user={user} />}
        <main>{children}</main>
      </body>
    </html>
  );
}
