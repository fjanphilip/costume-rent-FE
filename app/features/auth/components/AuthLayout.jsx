import { Link } from "@remix-run/react";
import * as Icons from "lucide-react";

export function AuthLayout({ children, title, subtitle, illustration }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary/10 overflow-hidden">
        <img 
          src={illustration || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1200&q=80"} 
          alt="Auth Illustration" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
               {Icons.ShieldCheck && <Icons.ShieldCheck className="h-6 w-6 text-white" />}
            </div>
            <span className="font-extrabold text-2xl tracking-tighter italic">SewaCosplay</span>
          </Link>

          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">Elevate Your <span className="text-primary-foreground italic">Cosplay</span> Experience.</h2>
            <p className="text-white/80">Join thousands of cosplayers and rent premium costumes for your next big event.</p>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white md:p-16">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          
          {children}

          <footer className="text-center text-xs text-muted-foreground pt-4 border-t">
            &copy; {new Date().getFullYear()} SewaCosplay Premium. 
            All characters start from here.
          </footer>
        </div>
      </div>
    </div>
  );
}
