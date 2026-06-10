import { useState } from "react";
import { NavLink } from "@remix-run/react";
import * as Icons from "lucide-react";
import { USER_MENU } from "../constants";

export function UserSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getIcon = (name) => {
    return Icons[name] || Icons.Circle;
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="p-8 pb-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => isMobile && setIsMobileOpen(false)}>
          <span className="font-extrabold text-xl tracking-tighter text-primary italic">SewaCosplay</span>
        </NavLink>
        {isMobile && (
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-6 pt-8 space-y-2">
        {USER_MENU.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === "/dashboard"}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all group
                ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}
              `}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 border-t font-bold">
        <form action="/logout" method="post" onSubmit={() => isMobile && setIsMobileOpen(false)}>
          <button type="submit" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-rose-500 hover:bg-rose-50 w-full transition-all text-left">
            {Icons.LogOut && <Icons.LogOut className="h-5 w-5" />}
            Logout
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-40 w-full shadow-xs">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tighter text-primary italic">SewaCosplay</span>
        </NavLink>
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors active:scale-95"
        >
          <Icons.Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer Slide-over */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        >
          <aside 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl border-r border-slate-100 animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent isMobile={true} />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex w-64 bg-white border-r flex-col h-screen sticky top-0 flex-shrink-0">
        <SidebarContent isMobile={false} />
      </aside>
    </>
  );
}

