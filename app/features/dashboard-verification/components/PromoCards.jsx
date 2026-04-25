import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export function PromoCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
      <div className="lg:col-span-8 bg-primary rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-primary/20">
        <div className="relative z-10 flex flex-col gap-4 max-w-md text-left">
          <h3 className="text-2xl font-bold">Verify Identity in Real-time</h3>
          <p className="text-white/80 text-sm">
            Our new AI-powered verification tool can automatically detect fake IDs with 99.9% accuracy within seconds.
          </p>
          <Button className="w-fit bg-white text-primary hover:bg-white/90 font-bold rounded-xl mt-2 px-8 active:scale-95 transition-transform">
            Launch Trust Engine
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_25.5%,rgba(255,255,255,.2)_50%,transparent_50.5%,transparent_75%,rgba(255,255,255,.2)_75.5%,rgba(255,255,255,.2))] bg-[length:20px_20px]"></div>
      </div>
      
      <Card className="lg:col-span-4 border-none shadow-sm rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-white">
        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          {Icons.ShieldCheck && <Icons.ShieldCheck className="h-6 w-6" />}
        </div>
        <h4 className="font-bold">Security Audit Log</h4>
        <p className="text-xs text-muted-foreground px-4 leading-relaxed">
          All verification actions are logged permanently for security audits.
        </p>
        <Button variant="link" className="text-primary font-bold">View History</Button>
      </Card>
    </div>
  );
}
