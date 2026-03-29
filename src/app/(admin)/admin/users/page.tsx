"use client";
import { api } from "@/trpc/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsersPage() {
  const utils = api.useUtils();
  const { data: users = [] } = api.admin.allUsers.useQuery({});

  const suspend  = api.admin.suspendUser.useMutation({ onSuccess: () => void utils.admin.allUsers.invalidate() });
  const setRole  = api.admin.setRole.useMutation({ onSuccess: () => void utils.admin.allUsers.invalidate() });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">User Management</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name","Email","Role","Status","Joined","Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-800">{u.name}</td>
                <td className="px-5 py-3 text-xs text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  <Select value={u.role} onValueChange={val => setRole.mutate({ userId: u.id, role: val as any })}>
                    <SelectTrigger className="w-24 h-7 text-[11px] rounded-lg border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${u.isSuspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    {u.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3">
                  <button type="button" onClick={() => suspend.mutate({ userId: u.id, suspend: !u.isSuspended })}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${u.isSuspended ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                    {u.isSuspended ? "Reinstate" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
