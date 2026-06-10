import { useState } from "react";
import { Link } from "@remix-run/react";
import * as Icons from "lucide-react";
import { AdminSidebar } from "./components/AdminSidebar";
import { ADMIN_STATS } from "./constants";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export default function AdminDashboardFeature({ stats }) {
  const getIcon = (name) => {
    const Icon = Icons[name];
    return Icon ? <Icon className="h-6 w-6" /> : null;
  };

  const dynamicStats = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "Users",
      color: "bg-blue-500",
      trend: "up",
      change: "+12%"
    },
    {
      label: "Total Revenue",
      value: `Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`,
      icon: "DollarSign",
      color: "bg-emerald-500",
      trend: "up",
      change: "+8%"
    },
    {
      label: "Active Bookings",
      value: stats?.activeBookings || 0,
      icon: "ShoppingBag",
      color: "bg-amber-500",
      trend: "down",
      change: "-3%"
    },
    {
      label: "Pending Verification",
      value: stats?.pendingVerification || 0,
      icon: "ShieldAlert",
      color: "bg-rose-500",
      trend: "up",
      change: "Action Required"
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
                System <span className="text-primary">Overview</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Monitoring real-time performance & activity</p>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" className="rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest h-11 px-6 flex gap-2">
                 <Icons.Download className="h-4 w-4" /> Export Report
               </Button>
               <Button className="rounded-2xl bg-slate-900 hover:bg-primary font-black text-[10px] uppercase tracking-widest h-11 px-6 shadow-xl shadow-slate-900/10">
                 System Settings
               </Button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicStats.map((stat, idx) => (
              <Card key={idx} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group transition-transform hover:scale-[1.02]">
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`h-14 w-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      {getIcon(stat.icon)}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-black italic ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                      {stat.trend === 'up' ? <Icons.ArrowUpRight className="h-3 w-3" /> : stat.trend === 'down' ? <Icons.ArrowDownRight className="h-3 w-3" /> : null}
                      {stat.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-black italic text-slate-900">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Middle Section: Recent Activity & Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Activity Table */}
            <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
                <h3 className="font-black text-xl italic uppercase tracking-tight">Recent Activity</h3>
                <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl px-4">
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-50/30">
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction / User</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(stats?.recentActivity || []).length > 0 ? (
                      stats.recentActivity.map((tx, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                  <Icons.User className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm text-slate-900">{tx.user?.name || "Unknown User"}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{tx.transaction_type}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-6">
                             <span className="text-sm font-black italic text-slate-900">Rp {(Number(tx.amount) || 0).toLocaleString('id-ID')}</span>
                          </td>
                          <td className="px-10 py-6">
                             <Badge className={`border-none font-black text-[9px] rounded-lg px-3 py-1 tracking-widest ${
                               tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 
                               tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                             }`}>
                               {(tx.status || "IDLE").toUpperCase()}
                             </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-10 py-10 text-center text-slate-400 font-bold italic text-sm">
                          Belum ada aktivitas terbaru.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Verification Queue Preview */}
            <Card className="lg:col-span-1 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-slate-900 text-white overflow-hidden relative">
               <CardContent className="p-10 space-y-8 relative z-10">
                  <div className="space-y-1">
                    <h4 className="text-xl font-black italic uppercase tracking-tight">Identity Verification</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{stats?.pendingVerification || 0} Pending Review Queue</p>
                  </div>
                  
                  <div className="space-y-4">
                    {stats?.pendingVerification > 0 ? (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Icons.FileCheck className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{stats.pendingVerification} Menunggu</span>
                            <span className="text-[9px] text-slate-500 italic">Action Required</span>
                          </div>
                        </div>
                        <Icons.ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-bold italic">Semua verifikasi telah diproses.</p>
                    )}
                  </div>

                  <Link to="/admin/users" className="block w-full">
                    <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-primary hover:text-white font-black uppercase italic tracking-widest text-xs transition-all shadow-xl">
                      Open Review Dashboard
                    </Button>
                  </Link>
               </CardContent>
               <Icons.ShieldCheck className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5" />
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
