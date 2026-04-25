import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sidebar } from "./components/Sidebar";
import { StatsCards } from "./components/StatsCards";
import { UserTable } from "./components/UserTable";
import { PromoCards } from "./components/PromoCards";

export default function DashboardVerificationFeature() {
  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      
      <main className="flex-1 min-w-0 overflow-auto">
        <section className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-8 space-y-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">User Verification</h1>
              <p className="text-muted-foreground text-sm">Monitor and approve user identity verifications for better security compliance.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none gap-2 rounded-xl border-2 font-semibold active:scale-95 transition-transform">
                {Icons.Download && <Icons.Download className="h-4 w-4" />}
                Export data
              </Button>
              <Button className="flex-1 md:flex-none gap-2 rounded-xl shadow-lg shadow-primary/20 font-bold active:scale-95 transition-transform">
                {Icons.Plus && <Icons.Plus className="h-4 w-4" />}
                Add New Agent
              </Button>
            </div>
          </header>

          <StatsCards />
          
          <UserTable />
          
          <PromoCards />
          
        </section>
      </main>
    </div>
  );
}
