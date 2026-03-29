"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { TbHome2, TbBriefcase, TbLayoutDashboard, TbUserCircle, TbSmartHome } from "react-icons/tb";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaPeopleGroup, FaUserShield, FaChevronDown } from "react-icons/fa6";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuth } from '@/src/context/AuthContext';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => 
    pathname === path ? 'text-orange-500 font-bold bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5';

  // Helper to check user type/role safely
  const isType = (type: string) => user?.user_type?.toLowerCase() === type.toLowerCase();

  return (
    <nav className='fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 md:gap-2 text-[11px] md:text-sm border border-white/10 bg-[#040313]/80 backdrop-blur-xl rounded-2xl px-4 md:px-6 py-2 transition-all shadow-2xl'>
      
      {/* Public Home Link */}
      <Link href="/" className={`flex items-center px-3 py-2 rounded-xl transition-all ${isActive('/')}`}>
        <TbHome2 size={20} />
        <span className='hidden lg:inline ml-2'>Home</span>
      </Link>

      {user && (
        <>
          {/* Seeker Landing / Dashboard Link */}
          {isType('seeker') && (
            <Link href="/seeker" className={`flex items-center px-3 py-2 rounded-xl transition-all ${isActive('/seeker')}`}>
              <TbSmartHome size={20} />
              <span className='hidden lg:inline ml-2'>Dashboard</span>
            </Link>
          )}

          <Link href="/jobs" className={`flex items-center px-3 py-2 rounded-xl transition-all ${isActive('/jobs')}`}>
            <TbBriefcase size={20} />
            <span className='hidden lg:inline ml-2'>Browse</span>
          </Link>

          {/* Seeker Specific */}
          {isType('seeker') && (
            <Link href="/seeker/applied" className={`flex items-center px-3 py-2 rounded-xl transition-all ${isActive('/seeker/applied')}`}>
              <MdOutlineWorkHistory size={20} />
              <span className='hidden lg:inline ml-2'>Applied</span>
            </Link>
          )}

          {/* Employer Specific */}
          {isType('employer') && (
            <>
              <Link href="/employer" className={`flex items-center px-3 py-2 rounded-xl transition-all ${isActive('/employer')}`}>
                <TbLayoutDashboard size={20} />
                <span className='hidden lg:inline ml-2'>Admin Panel</span>
              </Link>
              <Link href="/employer/applicants" className={`flex items-center px-3 py-2 rounded-xl transition-all ${isActive('/employer/applicants')}`}>
                <FaPeopleGroup size={18} />
                <span className='hidden lg:inline ml-2'>Applicants</span>
              </Link>
            </>
          )}

          {/* Admin Specific */}
          {isType('admin') && (
            <Link href="/admin" className={`flex items-center px-3 py-2 rounded-xl transition-all ${isActive('/admin')}`}>
              <FaUserShield size={18} />
              <span className='hidden lg:inline ml-2'>Control</span>
            </Link>
          )}
        </>
      )}

      {/* --- AUTH / PROFILE SECTION --- */}
      <div className='flex items-center ml-2 pl-3 border-l border-white/10'>
        {user ? (
          <div className='relative' ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className='flex items-center gap-2 group p-0.5 rounded-xl hover:bg-white/5 transition-all outline-none'
            >
              <div className='w-8 h-8 rounded-lg border-2 border-orange-500/30 overflow-hidden relative group-hover:border-orange-500 transition-colors'>
                <Image 
                  src={user.profile_picture || '/usericon.png'} 
                  alt="profile" 
                  fill 
                  className="object-cover"
                />
              </div>
              <FaChevronDown className={`hidden md:block text-[10px] text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className='absolute right-0 mt-4 w-60 bg-[#0c093d] border border-white/10 rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl'>
                <div className='px-4 py-3 border-b border-white/5 mb-2 bg-white/5 mx-2 rounded-xl'>
                  <p className='text-xs font-black text-white truncate'>{user.username}</p>
                  <p className='text-[8px] uppercase tracking-[0.2em] text-orange-500 font-black mt-1'>{user.user_type} Account</p>
                </div>

                <Link 
                  href="/seeker/profile" 
                  onClick={() => setIsOpen(false)}
                  className='flex items-center gap-3 px-4 py-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-all'
                >
                  <TbUserCircle size={20} className='text-orange-500' /> Settings & Profile
                </Link>

                <button 
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-red-500/10 transition-all text-left mt-2 border-t border-white/5'
                >
                  <IoLogOutOutline size={20} /> Disconnect Session
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className='px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-orange-500/20'>
            Connect
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;