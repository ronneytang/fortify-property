import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="" subtitle="" />
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {children}
        </div>
      </main>
    </div>
  );
}
