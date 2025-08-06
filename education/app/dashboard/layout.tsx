import Header from "@/app/components/layout/Header";
import { SidebarProvider } from "@/app/components/layout/SidebarContext";
import DashboardContent from "./DashboardContent";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
