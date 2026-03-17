"use client"
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import { SiWorkplace } from "react-icons/si";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdModeEditOutline } from "react-icons/md";


const People = () => {
  const [users, setUsers]=useState([])
  useEffect(()=>{
    fetch("http://127.0.0.1:5555/users")
    .then((response)=>{
      if(!response.ok){
        throw new Error("Error while fetching data")
      }
      return response.json()
    })
    .then((data)=>{
      console.log("availlable users.............",data)
      setUsers(data)
    })
    .catch(error=>{console.error("error while fetching users", error)})
  },[])
  return (
    <div className='flex w-full items-center flex-col  bg-gradient-to-r from-[#040313] to-[#0c093d] h-screen text-white'>
       <div className='flex w-full items-center justify-between mt-5'>
       <Link href="/"><div className='flex items-center ml-[60px]'><SiWorkplace className='text-orange-500'/><p className='italic'>vacan</p><span className='text-lg '>C</span></div></Link> 
        <div className='mr-[450px]'><Navbar /></div>
        </div>
        
        {users.length > 0 ? 
        <div style={{ maxHeight: '600px', scrollbarWidth: 'none' }}  className='overflow-x-auto mt-10'>
          <table  className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Day added</th>
              <th className="px-4 py-2 border-b text-left">Last active</th>
              <th className="px-4 py-2 border-b text-left"></th>
              <th className="px-4 py-2 border-b text-left"></th>
              </tr>
            </thead>
            <tbody >
              {users.map((user)=>(
                <tr key={user.id} className="hover:bg-gray-800 hover:rounded-md">
                  <td className="px-4 py-2 border-b flex w-full items-center">
                    <img src='/usericon.png' className='w-[35px] mr-3 h-auto' />
                    <div className='flex flex-col w-full'>
                      <h1 className='text-[13px]'>{user.username}</h1>
                      <p className='text-[10px] text-gray-400'>{user.email}</p>
                      </div>
                      </td>
                      <td className='px-4 py-2 border-b text-[13px] text-gray-300'>{user.date_created}</td>
                      <td className='px-4 py-2 border-b text-[13px] text-gray-300'>{user.last_active}</td>
                      <td className='px-4 py-2 border-b text-[13px] text-gray-300'><RiDeleteBin6Line  className='hover:cursor-pointer'/></td>
                      <td className='px-4 py-2 border-b text-[13px] text-gray-300'><MdModeEditOutline className='hover:cursor-pointer' /></td>
                </tr>
              ))}
            </tbody>

          </table>
          </div>
        : <div className='flex flex-col w-full mt-7 items-center justify-center'>
          <img src='/empty.png' className='w-[350px]  h-auto' alt='No users currently!'/>
          <h1 className='text-[12px] mt-4'>Oops! No availlable users at the moment...</h1></div>}

    </div>
  )
}

export default People