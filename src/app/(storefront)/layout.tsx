import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Ambient New-Age Aura Mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="animate-float-slow absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full blur-[120px]"
          style={{ background: "var(--aura-1)" }}
        />
        <div
          className="animate-float-slow absolute -right-24 top-1/4 h-[460px] w-[460px] rounded-full blur-[130px]"
          style={{ background: "var(--aura-2)", animationDelay: "-4s" }}
        />
        <div
          className="animate-pulse-glow absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-[140px]"
          style={{ background: "var(--aura-3)" }}
        />
        <div className="aura-grid-bg absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
