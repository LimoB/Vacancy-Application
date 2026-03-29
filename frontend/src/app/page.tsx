"use client";
import React, { useState, useRef, useEffect } from 'react';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaChevronDown, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaUserCircle,
  FaBriefcase 
} from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/login');
  };

  return (
    <div className='min-h-screen w-full flex flex-col bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white selection:bg-purple-500/30'>
      
      {/* --- NAVBAR --- */}
      <nav className='flex w-full items-center justify-between px-6 md:px-10 py-6 backdrop-blur-md sticky top-0 z-[100] border-b border-white/5'>
        <div className='flex items-center gap-2 group cursor-pointer'>
          <div className='bg-orange-500 p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20'>
            <SiWorkplace className='text-white text-xl' />
          </div>
          <p className='text-2xl font-black italic tracking-tighter'>
            vacan<span className='text-orange-500 not-italic'>C</span>
          </p>
        </div>

        <div className='flex items-center gap-8'>
          <ul className='hidden lg:flex gap-8 text-sm font-medium text-gray-400'>
            <Link href="/jobs" className='hover:text-white transition-colors'>Explore</Link>
            <li className='hover:text-white transition-colors cursor-pointer'>Companies</li>
            <li className='hover:text-white transition-colors cursor-pointer'>Salary Guide</li>
          </ul>

          <div className='flex items-center'>
            {user ? (
              <div className='relative' ref={dropdownRef}>
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className='flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group'
                >
                  <div className='relative w-10 h-10 rounded-xl overflow-hidden border-2 border-orange-500/50'>
                    <Image 
                      src={user.profile_picture || '/usericon.png'} 
                      alt='profile' 
                      fill 
                      className='object-cover'
                    />
                  </div>
                  <div className='hidden sm:block text-left'>
                    <p className='text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none'>Connected</p>
                    <p className='text-xs font-bold'>{user.username}</p>
                  </div>
                  <FaChevronDown className={`text-[10px] text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* --- DROPDOWN MENU --- */}
                {isOpen && (
                  <div className='absolute right-0 mt-4 w-56 bg-[#0c093d] border border-white/10 rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl'>
                    <div className='px-4 py-2 border-b border-white/5 mb-2'>
                      <p className='text-xs font-black text-white truncate'>{user.username}</p>
                      <p className='text-[9px] uppercase tracking-widest text-orange-500 font-bold mt-0.5'>{user.user_role || user.user_type}</p>
                    </div>

                    <Link 
                      href="/jobs" 
                      onClick={() => setIsOpen(false)}
                      className='flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-all'
                    >
                      <FaBriefcase size={16} className='text-blue-400' /> Job Dashboard
                    </Link>

                    <Link 
                      href="/seeker/profile" 
                      onClick={() => setIsOpen(false)}
                      className='flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-all'
                    >
                      <FaUserCircle size={16} className='text-orange-500' /> My Profile
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all text-left mt-2 border-t border-white/5 pt-3'
                    >
                      <IoLogOutOutline size={18} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className='px-8 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all shadow-lg shadow-purple-500/20'>
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className='flex-1 grid lg:grid-cols-2 items-center px-6 md:px-10 max-w-7xl mx-auto w-full gap-12 py-10'>
        
        <div className='flex flex-col space-y-8 animate-in fade-in slide-in-from-left duration-1000'>
          <div className='space-y-4'>
            <span className='px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-widest'>
              Over 15,000+ nodes active
            </span>
            <h1 className='text-5xl md:text-7xl font-black leading-[1.1] tracking-tight'>
              Finding The <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400'>
                Job Beyond
              </span> <br />
              Borders
            </h1>
            <p className='text-gray-400 text-lg max-w-md pt-2'>
              Discover roles you love at top-tier companies. Your next career milestone starts here.
            </p>
            
            {/* Direct Browse Link for Logged In Users */}
            {user && (
              <Link href="/jobs" className='flex items-center gap-3 group w-fit bg-white/5 border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/10 transition-all'>
                <div className='bg-orange-500 rounded-full p-2 group-hover:scale-110 transition-transform'>
                  <FaBriefcase className='text-white text-xs' />
                </div>
                <span className='text-sm font-bold'>Return to Job Postings</span>
              </Link>
            )}
          </div>

          <div className='relative group'>
            <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000'></div>
            <form className='relative flex flex-col md:flex-row items-center bg-[#16142e] rounded-2xl p-2 border border-white/10'>
              <div className='flex items-center flex-1 px-4 gap-3 w-full border-b md:border-b-0 md:border-r border-white/10'>
                <FaSearch className='text-purple-400' />
                <input 
                  type='text' 
                  placeholder='Job title or keyword...' 
                  className='bg-transparent w-full text-sm outline-none py-4' 
                />
              </div>
              <div className='flex items-center gap-2 px-6 py-4 md:py-0'>
                <FaMapMarkerAlt className='text-orange-400' />
                <span className='text-sm font-medium'>Location</span>
                <FaChevronDown className='text-[10px] text-gray-500' />
              </div>
              <button type="button" className='w-full md:w-auto bg-white text-black px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-colors'>
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className='relative hidden lg:block animate-in fade-in zoom-in duration-1000'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]'></div>
          <div className='relative z-10 p-10 flex items-center justify-center min-h-[500px]'>
            <div className='absolute inset-0 z-0 opacity-20'>
                 <Image src='/bg.png' alt='bg' fill className='object-contain' />
            </div>
            
            <Image 
              src='/man.png' 
              width={500}
              height={500}
              className='relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transform hover:-translate-y-2 transition-transform duration-500' 
              alt='Professional' 
            />
          </div>
          
          <div className='absolute bottom-10 left-0 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl animate-bounce shadow-2xl'>
            <p className='text-[9px] text-orange-400 font-black uppercase tracking-widest'>Hiring Now</p>
            <p className='text-xs font-bold mt-1'>Senior DevOps Engineer</p>
            <div className='flex gap-1 mt-2'>
                <div className='w-1 h-1 bg-green-500 rounded-full'></div>
                <div className='w-1 h-1 bg-green-500/50 rounded-full'></div>
                <div className='w-1 h-1 bg-green-500/20 rounded-full'></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;