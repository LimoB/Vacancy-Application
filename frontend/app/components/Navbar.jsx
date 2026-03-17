import Link from 'next/link'
import React from 'react'
import { TbHome2 } from "react-icons/tb";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

const navbar = () => {
  return (
    <div className='flex items-center gap-10 text-sm border border-white rounded-md justify-center p-2'>
      {/* <Link className='flex items-center justify-center' href="/"><TbHome2 className='mr-2' />Home</Link> */}
      <Link className='flex items-center justify-center' href="/jobs"><MdOutlineWorkHistory className='mr-2'/>Jobs</Link>
      <Link className='flex items-center justify-center' href="/user"><FaUserTie className='mr-2'/>User</Link>
      <Link className='flex items-center justify-center' href="/people"><FaPeopleGroup className='mr-2'/>People</Link>
    </div>
  )
}

export default navbar