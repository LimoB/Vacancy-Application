"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbHome2 } from "react-icons/tb";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuth } from '@/src/context/AuthContext';

const Navbar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Helper to highlight active links
  const isActive = (path: string) => pathname === path ? 'text-orange-500' : 'text-gray-300 hover:text-white';

  return (
    <nav className='flex items-center gap-8 text-sm border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl justify-center px-6 py-2.5 transition-all'>
      
      <Link href="/" className={`flex items-center transition-colors ${isActive('/')}`}>
        <TbHome2 className='mr-2' size={18} />
        <span className='hidden sm:inline'>Home</span>
      </Link>

      <Link href="/jobs" className={`flex items-center transition-colors ${isActive('/jobs')}`}>
        <MdOutlineWorkHistory className='mr-2' size={18} />
        <span className='hidden sm:inline'>Jobs</span>
      </Link>

      <Link href="/seeker/profile" className={`flex items-center transition-colors ${isActive('/seeker/profile')}`}>
        <FaUserTie className='mr-2' size={18} />
        <span className='hidden sm:inline'>Profile</span>
      </Link>

      {/* Only show People/Management for Admins */}
      {user?.user_role === 'admin' && (
        <Link href="/admin/manage-users" className={`flex items-center transition-colors ${isActive('/admin/manage-users')}`}>
          <FaPeopleGroup className='mr-2' size={18} />
          <span className='hidden sm:inline'>Users</span>
        </Link>
      )}

      {/* Logout Button */}
      {user && (
        <button 
          onClick={logout}
          className='flex items-center text-red-400 hover:text-red-300 transition-colors ml-4 pl-4 border-l border-white/10'
        >
          <IoLogOutOutline className='mr-2' size={20} />
          <span className='hidden sm:inline'>Logout</span>
        </button>
      )}
    </nav>
  );
};

export default Navbar;