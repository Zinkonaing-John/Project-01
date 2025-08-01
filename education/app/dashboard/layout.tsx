import Header from "@/app/components/layout/Header";
import Sidebar from "@/app/components/layout/Sidebar";
import { SidebarProvider } from "@/app/components/layout/SidebarContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-grow">
          <Sidebar />
          <main className="flex-grow p-4 sm:px-6 lg:px-8 transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
