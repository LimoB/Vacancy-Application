import Link from 'next/link'
import React from 'react'
import { TbHome2 } from "react-icons/tb";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

const UserNavbar = () => {
  return (
    <div className='flex items-center gap-10 text-sm border border-white rounded-md justify-center p-2'>
    {/* <Link className='flex items-center justify-center' href="/"><TbHome2 className='mr-2' />Home</Link> */}
    <Link className='flex items-center justify-center' href="/userjobs"><MdOutlineWorkHistory className='mr-2'/>My Jobs</Link>
    <Link className='flex items-center justify-center' href="/userprofile"><FaUserTie className='mr-2'/>My profile</Link>
    <Link className='flex items-center justify-center' href="/appliedjobs"><FaPeopleGroup className='mr-2'/>Applied jobs</Link>
  </div>
  )
}

export default UserNavbar