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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl flex h-16 items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tighter text-primary italic">SewaCosplay</span>
        </Link>

        {/* Global Search Bar (From Figma) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          {Icons.Search && <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
          <input 
            type="text" 
            placeholder="Cari kostum anime kesukaanmu..." 
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            {Icons.Bell && <Icons.Bell className="h-5 w-5" />}
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background"></span>
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                    <span className="hidden sm:inline text-sm font-bold text-primary">{user.name}</span>
                    <div className="h-9 w-9 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center border border-primary/20">
                       {Icons.User && <Icons.User className="h-5 w-5 text-primary" />}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-2 bg-white font-sans">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-1.5 pt-2">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer h-10 font-bold gap-3">
                      <Link to="/dashboard"><Icons.User className="h-4 w-4" /> Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer h-10 font-bold gap-3">
                      <Link to="/dashboard/wallet"><Icons.Wallet className="h-4 w-4" /> Wallet</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer h-10 font-bold gap-3">
                      <Link to="/dashboard/history"><Icons.History className="h-4 w-4" /> History</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-gray-50" />
                  <Form action="/logout" method="post" className="w-full">
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-rose-50 focus:text-rose-600 cursor-pointer h-10 font-bold text-rose-500 gap-3">
                      <button type="submit" className="w-full justify-start py-0"><Icons.LogOut className="h-4 w-4" /> Logout</button>
                    </DropdownMenuItem>
                  </Form>
                </DropdownMenuContent>

              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm" className="font-bold">Log In</Button></Link>
                <Link to="/register"><Button size="sm" className="font-bold rounded-lg px-6">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
