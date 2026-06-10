import { useState } from "react";
import { Link, Form, useSearchParams } from "@remix-run/react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const query = e.currentTarget.search.value;
    const params = new URLSearchParams(searchParams);
    if (query) params.set("search", query);
    else params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
    setIsMobileMenuOpen(false);
  };

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

        {/* Global Search Bar (Desktop) */}
        <Form method="get" action="/catalog" className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchParams.get("search") || ""}
            placeholder="Cari kostum anime..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-md text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
          />
        </Form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
            <Icons.Bell className="h-5 w-5" />
          </Button>

          {/* Desktop User Dropdown & Auth */}
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none py-1">
                    <div className="flex flex-col items-end leading-none">
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
                      <Link to="/dashboard/bookings" className="flex items-center w-full">
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

          {/* Mobile Hamburger menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:text-primary active:scale-95 transition-transform"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <Icons.X className="h-6 w-6" /> : <Icons.Menu className="h-6 w-6" />}
          </Button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 shadow-2xl border-l border-slate-100 flex flex-col gap-6 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Search */}
            <form onSubmit={handleMobileSearchSubmit} className="relative w-full">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.get("search") || ""}
                placeholder="Cari kostum anime..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              />
            </form>

            <div className="h-[1px] bg-slate-100"></div>

            {/* Menu Links */}
            <nav className="flex flex-col gap-3">
              <Link 
                to="/catalog" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icons.Sparkles className="h-5 w-5 text-primary" />
                Explore Collection
              </Link>
            </nav>

            <div className="h-[1px] bg-slate-100"></div>

            {/* User Profile / Auth Actions in Mobile Drawer */}
            <div className="mt-auto">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      <Icons.User className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
                      <span className="text-[10px] text-slate-500 truncate capitalize">{user.role || 'Member'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link 
                      to={user.role === 'admin' ? "/admin" : "/dashboard"} 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icons.LayoutDashboard className="h-5 w-5" />
                      {user.role === 'admin' ? "Admin Panel" : "Dashboard Overview"}
                    </Link>
                    <Link 
                      to="/dashboard/bookings" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icons.History className="h-5 w-5" />
                      History Bookings
                    </Link>

                    <div className="h-[1px] bg-slate-100 my-2"></div>

                    <Form action="/logout" method="post" className="w-full" onSubmit={() => setIsMobileMenuOpen(false)}>
                      <button 
                        type="submit" 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition-all text-sm w-full text-left"
                      >
                        <Icons.LogOut className="h-5 w-5" />
                        Log Out
                      </button>
                    </Form>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2">Log In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full h-12 rounded-xl font-bold">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
