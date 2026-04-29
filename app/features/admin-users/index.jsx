import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "~/components/ui/dialog";

export default function AdminUsersFeature({ users: initialUsers }) {
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    is_verified: false,
    bank_name: "",
    bank_account_number: "",
    bank_account_name: ""
  });

  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (user.bank_account_number && user.bank_account_number.includes(searchTerm));
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [initialUsers, searchTerm, roleFilter]);

  useEffect(() => {
    if (fetcher.data?.status === "success") {
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
    }
  }, [fetcher.data]);

  const handleToggleVerify = (user) => {
    fetcher.submit(
      { 
        intent: "verify", 
        id: user.id
      },
      { method: "post" }
    );
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: !!user.is_verified,
      bank_name: user.bank_name || "",
      bank_account_number: user.bank_account_number || "",
      bank_account_name: user.bank_account_name || ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    fetcher.submit(
      { 
        intent: "update", 
        id: editingUser.id, 
        ...formData,
        is_verified: formData.is_verified ? "1" : "0"
      },
      { method: "post" }
    );
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    fetcher.submit(
      { intent: "delete", id: userToDelete.id },
      { method: "post" }
    );
  };

  const getBankLogo = (bankName) => {
    const name = bankName?.toLowerCase() || "";
    if (name.includes("bca")) return "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg";
    if (name.includes("mandiri")) return "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg";
    if (name.includes("bni")) return "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg";
    if (name.includes("bri")) return "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_Logo.svg";
    if (name.includes("gopay")) return "https://upload.wikimedia.org/wikipedia/commons/8/8e/Gopay_logo.svg";
    if (name.includes("ovo")) return "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg";
    if (name.includes("dana")) return "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_DANA.svg";
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
        <p className="text-sm text-slate-500 font-medium">Kelola akses dan informasi perbankan seluruh user.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari user atau rekening..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary/5"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
           {['all', 'admin', 'user'].map((filter) => (
             <button
               key={filter}
               onClick={() => setRoleFilter(filter)}
               className={`px-5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                 roleFilter === filter ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               {filter}
             </button>
           ))}
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Financial Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Icons.User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className="text-[11px] font-medium text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.bank_account_number ? (
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                            {getBankLogo(user.bank_name) ? (
                              <img src={getBankLogo(user.bank_name)} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <Icons.CreditCard className="h-4 w-4 text-slate-300" />
                            )}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-900">{user.bank_account_number}</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">A/N {user.bank_account_name}</span>
                         </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-300 italic uppercase tracking-wider">Not Provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <Switch 
                         checked={!!user.is_verified} 
                         onCheckedChange={() => handleToggleVerify(user)}
                         disabled={fetcher.state !== "idle"}
                       />
                       <Badge variant="outline" className={`border-none font-bold text-[9px] rounded-lg px-2 py-0.5 tracking-wider ${
                         user.is_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                       }`}>
                         {user.is_verified ? 'VERIFIED' : 'PENDING'}
                       </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                        <Icons.Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)} className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                        <Icons.Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Standard Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <DialogTitle className="text-xl font-bold text-slate-900 leading-none">Edit User Profile</DialogTitle>
             <DialogDescription className="text-xs font-medium text-slate-500 mt-2">Manage identity, bank records, and system access.</DialogDescription>
          </div>

          <div className="p-6 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                   <Input 
                     value={formData.name} 
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="h-10 border-slate-200 focus:border-slate-900"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Email</label>
                   <Input 
                     value={formData.email} 
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     className="h-10 border-slate-200 focus:border-slate-900"
                   />
                </div>
             </div>

             <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                   <Icons.CreditCard className="h-3 w-3 text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Information</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Bank Provider</label>
                      <Input 
                        placeholder="e.g. BCA, BNI"
                        value={formData.bank_name} 
                        onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                        className="h-10 bg-white border-slate-200"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Acc Number</label>
                      <Input 
                        value={formData.bank_account_number} 
                        onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                        className="h-10 bg-white border-slate-200"
                      />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Account Holder Name</label>
                   <Input 
                     value={formData.bank_account_name} 
                     onChange={(e) => setFormData({...formData, bank_account_name: e.target.value})}
                     className="h-10 bg-white border-slate-200"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">System Role</label>
                   <select 
                     value={formData.role} 
                     onChange={(e) => setFormData({...formData, role: e.target.value})}
                     className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium outline-none focus:border-slate-900 transition-all"
                   >
                     <option value="user">Standard User</option>
                     <option value="admin">Administrator</option>
                   </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Verification</label>
                   <div className="h-10 bg-white border border-slate-200 rounded-lg px-3 flex items-center justify-between">
                      <Badge variant="outline" className={`border-none font-bold text-[9px] rounded-lg px-2 py-0.5 tracking-wider ${
                        formData.is_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {formData.is_verified ? 'VERIFIED' : 'PENDING'}
                      </Badge>
                      <Switch 
                        checked={formData.is_verified} 
                        onCheckedChange={(val) => setFormData({...formData, is_verified: val})}
                      />
                   </div>
                </div>
             </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</Button>
            <Button 
              onClick={handleUpdate} 
              disabled={fetcher.state !== "idle"}
              className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold h-11"
            >
              {fetcher.state !== "idle" ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] border-none shadow-2xl p-0 overflow-hidden rounded-2xl bg-white">
          <div className="p-8 text-center space-y-4">
             <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <Icons.AlertTriangle className="h-8 w-8" />
             </div>
             <div className="space-y-1">
                <DialogTitle className="text-lg font-bold text-slate-900">Delete Account?</DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                   Permanently remove <strong>{userToDelete?.name}</strong>. This process cannot be undone.
                </DialogDescription>
             </div>
          </div>
          <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-100">
             <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</Button>
             <Button 
              onClick={confirmDelete} 
              disabled={fetcher.state !== "idle"}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
             >
               {fetcher.state !== "idle" ? "Deleting..." : "Ya, Hapus"}
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
