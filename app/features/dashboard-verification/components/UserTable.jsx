import * as Icons from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { VERIFICATION_USERS } from "../constants";

export function UserTable() {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-white">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            {Icons.Search && <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
            <input 
              type="text" 
              placeholder="Search by name, ID Card, or email" 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
            <Button size="sm" variant="ghost" className="bg-white shadow-sm rounded-lg font-bold text-xs">All</Button>
            <Button size="sm" variant="ghost" className="rounded-lg text-xs">Review</Button>
            <Button size="sm" variant="ghost" className="rounded-lg text-xs">Passed</Button>
          </div>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl border-2">
          {Icons.Filter && <Icons.Filter className="h-4 w-4" />}
          Filters
        </Button>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">User Account</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID Card</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Submission Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Request Time</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 border-b border-gray-50">
            {VERIFICATION_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} className="h-10 w-10 rounded-xl bg-gray-100" alt="" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{user.idCard}</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-xs font-medium text-gray-500">{user.date}</span>
                </td>
                <td className="px-6 py-4 space-y-1.5">
                   <div className="flex items-center gap-2">
                      {user.status === 'Verified' && (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full h-5 text-[9px] font-bold gap-1">
                          {Icons.CheckCircle2 && <Icons.CheckCircle2 className="h-3 w-3" />} PASSED
                        </Badge>
                      )}
                      {user.status === 'In Review' && (
                        <Badge className="bg-blue-50 text-blue-600 border-none rounded-full h-5 text-[9px] font-bold gap-1">
                          {Icons.Clock && <Icons.Clock className="h-3 w-3" />} ON TEST
                        </Badge>
                      )}
                      {user.status === 'Rejected' && (
                        <Badge className="bg-rose-50 text-rose-600 border-none rounded-full h-5 text-[9px] font-bold gap-1">
                          {Icons.AlertCircle && <Icons.AlertCircle className="h-3 w-3" />} REJECTED
                        </Badge>
                      )}
                   </div>
                   <p className="text-[10px] font-bold text-muted-foreground ml-1">{user.time}</p>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        {Icons.Eye && <Icons.Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50">
                        {Icons.Slash && <Icons.Slash className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {Icons.MoreHorizontal && <Icons.MoreHorizontal className="h-4 w-4" />}
                      </Button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-white flex items-center justify-between">
         <p className="text-xs font-medium text-muted-foreground">Showing 1 to 10 of 128 results</p>
         <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg h-8 w-8 p-0">1</Button>
            <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0">2</Button>
            <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0">3</Button>
         </div>
      </div>
    </Card>
  );
}
