import { Link, Form, useNavigation, useActionData } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { AuthLayout } from "./components/AuthLayout";

export default function RegisterFeature() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join SewaCosplay and start your journey"
      illustration="https://images.unsplash.com/photo-1608831540955-35094d48694a?w=1200&q=80"
    >
      <Form method="post" className="space-y-4">
        {actionData?.error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold p-3 rounded-xl animate-in fade-in zoom-in duration-300">
            {actionData.error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
            <Input 
              name="name"
              type="text" 
              placeholder="Alippp" 
              required
              className="h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
            <Input 
              name="phone_number"
              type="tel" 
              placeholder="081234567890" 
              required
              className="h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
          <div className="relative">
            {Icons.Mail && <Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
            <Input 
              name="email"
              type="email" 
              placeholder="alippp@example.com" 
              required
              className="pl-10 h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <Input 
              name="password"
              type="password" 
              placeholder="••••••••" 
              required
              className="h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
            <Input 
              name="password_confirmation"
              type="password" 
              placeholder="••••••••" 
              required
              className="h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-2xl space-y-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Bank Details</p>
           <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-left">
                 <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bank</label>
                    <Input name="bank_name" placeholder="BCA" required className="h-10 rounded-xl border-2" />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Number</label>
                    <Input name="bank_account_number" placeholder="1234567890" required className="h-10 rounded-xl border-2" />
                 </div>
              </div>
              <div className="space-y-2 text-left">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Name</label>
                 <Input name="bank_account_name" placeholder="Admin Toko" required className="h-10 rounded-xl border-2" />
              </div>
           </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform mt-4"
        >
           {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Already have an account? {" "}
          <Link to="/login" className="font-bold text-primary hover:underline">Sign In</Link>
        </p>
      </Form>
    </AuthLayout>
  );
}

