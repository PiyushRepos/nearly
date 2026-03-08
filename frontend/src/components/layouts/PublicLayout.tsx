import { Outlet } from "react-router";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
