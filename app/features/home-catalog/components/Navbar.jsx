import { Link, Form } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function Navbar({ user }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Icons.Ghost className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Sewa<span className="text-primary">Cosplay</span></span>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kostum anime..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-md text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
            <Icons.Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none py-1">
                    <div className="hidden sm:flex flex-col items-end leading-none">
                      <span className="text-sm font-bold text-slate-900">{user.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 capitalize">
                        {user.role || 'Member'}
                      </span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      <Icons.User className="h-5 w-5 text-slate-600" />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-lg border border-slate-200 bg-white mt-2 animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-2 font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="bg-slate-100" />

                    <DropdownMenuItem asChild className="rounded-lg focus:bg-slate-100 cursor-pointer py-2.5 px-3 text-sm text-slate-700">
                      <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} className="flex items-center w-full">
                        <Icons.LayoutDashboard className="mr-3 h-4 w-4" />
                        {user.role === 'admin' ? "Admin Panel" : "Overview"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg focus:bg-slate-100 cursor-pointer py-2.5 px-3 text-sm text-slate-700">
                      <Link to="/dashboard/wallet" className="flex items-center w-full">
                        <Icons.Wallet className="mr-3 h-4 w-4" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg focus:bg-slate-100 cursor-pointer py-2.5 px-3 text-sm text-slate-700">
                      <Link to="/dashboard/history" className="flex items-center w-full">
                        <Icons.History className="mr-3 h-4 w-4" />
                        History
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-slate-100" />

                  <Form action="/logout" method="post" className="w-full">
                    <DropdownMenuItem asChild className="rounded-lg focus:bg-rose-50 focus:text-rose-600 cursor-pointer py-2.5 px-3 text-sm text-rose-600">
                      <button type="submit" className="w-full flex items-center">
                        <Icons.LogOut className="mr-3 h-4 w-4" />
                        Log Out
                      </button>
                    </DropdownMenuItem>
                  </Form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm" className="font-bold">Log In</Button></Link>
                <Link to="/register"><Button size="sm" className="font-bold">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
