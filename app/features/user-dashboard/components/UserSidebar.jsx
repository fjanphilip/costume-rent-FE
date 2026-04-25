import { NavLink } from "@remix-run/react";
import * as Icons from "lucide-react";
import { USER_MENU } from "../constants";

export function UserSidebar() {
  const getIcon = (name) => {
    return Icons[name] || Icons.Circle;
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="p-8 pb-4">
        <NavLink to="/" className="flex items-center gap-2">
           <span className="font-extrabold text-xl tracking-tighter text-primary italic">SewaCosplay</span>
        </NavLink>
      </div>

      <nav className="flex-1 px-6 pt-8 space-y-2">
        {USER_MENU.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === "/dashboard"}
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
        <form action="/logout" method="post">
          <button type="submit" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-rose-500 hover:bg-rose-50 w-full transition-all">
            {Icons.LogOut && <Icons.LogOut className="h-5 w-5" />}
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}

