"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbHome2 } from "react-icons/tb";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

const UserNavbar = () => {
  const pathname = usePathname();

  // Helper function to handle active styling
  const getLinkStyle = (path: string) => 
    `flex items-center justify-center transition-colors ${
      pathname === path ? 'text-orange-500 font-medium' : 'text-gray-300 hover:text-white'
    }`;

  return (
    <nav className='flex items-center gap-6 md:gap-10 text-sm border border-white/20 bg-white/5 backdrop-blur-sm rounded-xl justify-center p-2.5 px-6 shadow-lg'>
      
      {/* 1. Home Link (Now Active to fix ESLint) */}
      <Link href="/jobs" className={getLinkStyle('/jobs')}>
        <TbHome2 className='mr-2 text-lg' />
        <span>Feed</span>
      </Link>

      {/* 2. My Jobs (Personalized Feed or Saved) */}
      <Link href="/seeker/jobs" className={getLinkStyle('/seeker/jobs')}>
        <MdOutlineWorkHistory className='mr-2 text-lg' />
        <span>My Jobs</span>
      </Link>

      {/* 3. My Profile */}
      <Link href="/seeker/profile" className={getLinkStyle('/seeker/profile')}>
        <FaUserTie className='mr-2 text-lg' />
        <span>Profile</span>
      </Link>

      {/* 4. Applied Jobs */}
      <Link href="/seeker/applied" className={getLinkStyle('/seeker/applied')}>
        <FaPeopleGroup className='mr-2 text-lg' />
        <span>Applied</span>
      </Link>

    </nav>
  );
};

export default UserNavbar;