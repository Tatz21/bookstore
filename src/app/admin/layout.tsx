import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden lg:flex-row">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="animate-float-slow absolute -left-24 top-0 h-[420px] w-[420px] rounded-full blur-[130px]"
          style={{ background: "var(--aura-1)" }}
        />
        <div
          className="animate-pulse-glow absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full blur-[130px]"
          style={{ background: "var(--aura-2)" }}
        />
        <div className="aura-grid-bg absolute inset-0 opacity-[0.25]" />
      </div>

      <AdminSidebar userEmail={session.user.email || "Admin"} />
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
