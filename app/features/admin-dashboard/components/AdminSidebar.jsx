import { NavLink } from "@remix-run/react";
import * as Icons from "lucide-react";
import { ADMIN_MENU } from "../constants";

export function AdminSidebar() {
  const getIcon = (name) => {
    return Icons[name] || Icons.Circle;
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 flex-shrink-0 text-slate-300">
      <div className="p-8 pb-10 flex items-center gap-3">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
          <Icons.Shield className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white italic leading-none">ADMIN<span className="text-primary">PANEL</span></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1">Costume Rent v1.0</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Main Menu</p>
        {ADMIN_MENU.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === "/admin"}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group
                ${isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon className={`h-5 w-5 ${item.href === "/admin" ? "animate-pulse" : ""}`} />
              {item.label}
              {item.label === "Verifikasi User" && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-lg">14</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-3xl p-4 mb-4 flex items-center gap-3 border border-slate-700">
           <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
             <Icons.User className="h-5 w-5 text-slate-400" />
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-bold text-white">Administrator</span>
             <span className="text-[10px] text-slate-500">Super Admin Mode</span>
           </div>
        </div>
        <form action="/logout" method="post">
          <button type="submit" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 w-full transition-all">
            <Icons.LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
