import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        <Sidebar />
        <main className="flex-grow p-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
