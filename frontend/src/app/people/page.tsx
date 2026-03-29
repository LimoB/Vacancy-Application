"use client";
import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import { SiWorkplace } from "react-icons/si";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdModeEditOutline } from "react-icons/md";
import { User } from "@/src/types";
import { useAuth } from "@/src/context/AuthContext";

const People = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Memoize fetchUsers so it doesn't change on every render
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5555/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Unauthorized or server error");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [token]); // Only recreate if token changes

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // fetchUsers is now a stable dependency

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="flex w-full items-center flex-col bg-gradient-to-r from-[#040313] to-[#0c093d] min-h-screen text-white pb-10">
      {/* Header Section */}
      <div className="flex w-full items-center justify-between p-6 px-10 lg:px-[60px]">
        <Link href="/">
          <div className="flex items-center gap-2 group cursor-pointer">
            <SiWorkplace className="text-orange-500 text-2xl group-hover:scale-110 transition-transform" />
            <div className="flex items-baseline">
              <p className="italic font-light text-xl tracking-tight">vacan</p>
              <span className="text-2xl font-bold text-orange-500">C</span>
            </div>
          </div>
        </Link>
        <Navbar />
      </div>

      <div className="w-full max-w-6xl px-10 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management (Admin)</h1>
          <p className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Total Users: {users.length}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                  <th className="px-8 py-5 text-left font-black">Profile</th>
                  <th className="px-6 py-5 text-left font-black">Type</th>
                  <th className="px-6 py-5 text-left font-black">Joined</th>
                  <th className="px-6 py-5 text-left font-black">
                    Last Active
                  </th>
                  <th className="px-8 py-5 text-center font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="text-sm font-bold">{user.username}</h1>
                        <p className="text-[11px] text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[9px] px-3 py-1 rounded-lg uppercase font-black tracking-widest border ${
                          user.user_type === "employer"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                      {new Date(user.date_created).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                      {user.last_active
                        ? new Date(user.last_active).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex justify-center gap-3">
                        <button className="p-2 bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 rounded-xl transition-all">
                          <MdModeEditOutline size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-500/10 text-red-400/70 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        >
                          <RiDeleteBin6Line size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 opacity-50">
            <SiWorkplace size={80} className="text-white/10 mb-4" />
            <h1 className="text-gray-400 font-medium">
              No users found in the system.
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default People;
