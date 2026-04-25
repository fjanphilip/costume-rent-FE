import { Link } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";
import { SIDEBAR_MENU } from "../constants";

export function Sidebar() {
  const getItemIcon = (label) => {
    switch (label) {
      case "Dashboard": return Icons.LayoutGrid;
      case "Users": return Icons.Users;
      case "Keuangan": return Icons.Wallet;
      case "Laporan": return Icons.FileText;
      default: return Icons.Circle;
    }
  };

  return (
    <aside className="w-64 bg-[#0A0D14] text-white flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="p-6 mb-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            {Icons.ShieldCheck && <Icons.ShieldCheck className="h-5 w-5 text-white" />}
          </div>
          <span className="font-bold text-xl tracking-tight">SewaCosplay</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Main Menu</p>
        {SIDEBAR_MENU.map((item) => {
          const Icon = getItemIcon(item.label);
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${item.active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              {Icon && <Icon className={`h-5 w-5 ${item.active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />}
              {item.label}
            </Link>
          );
        })}

        <div className="mt-8">
          <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">System</p>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {Icons.Settings && <Icons.Settings className="h-5 w-5 text-gray-500" />}
            Pengaturan
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
         <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl">
           {Icons.LogOut && <Icons.LogOut className="h-5 w-5" />}
           Keluar
         </Button>
      </div>
    </aside>
  );
}
