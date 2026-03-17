"use client"
import React, { useState } from 'react'
import Navbar from "../components/Navbar.jsx"
import Link from 'next/link.js'
import { useRouter } from "next/navigation"
import { SiWorkplace } from "react-icons/si";

const Login = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [message, setMessage] = useState({ text: "", isError: false })

    const handleInput = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage({ text: "Authenticating...", isError: false })

        try {
            const response = await fetch("http://127.0.0.1:5555/login", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                // --- THE FIX IS HERE ---
                // We save the token, the whole user object, AND the specific 'id' 
                // so that the Profile page can find it easily.
                localStorage.setItem("token", result.token)
                localStorage.setItem("id", result.user.id) // <--- CRITICAL ADDITION
                localStorage.setItem("user", JSON.stringify(result.user))
                
                setMessage({ text: result.message, isError: false })

                setTimeout(() => {
                    // Check role for redirection
                    if (result.user.user_role === "admin") {
                        router.push("/jobs")
                    } else {
                        router.push("/userjobs")
                    }
                }, 1000)
            } else {
                setMessage({ text: result.message, isError: true })
            }
        } catch (error) {
            console.error("Login error:", error)
            setMessage({ text: "Server connection failed.", isError: true })
        }
    }

    return (
        <div className='min-h-screen w-full bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white flex flex-col'>
            <div className='flex w-full items-center justify-between p-6 px-[60px]'>
                <Link href="/">
                    <div className='flex items-center gap-2 group'>
                        <SiWorkplace className='text-orange-500 text-2xl group-hover:scale-110 transition-transform' />
                        <div className='flex items-baseline'>
                            <p className='italic font-light text-xl tracking-tight'>vacan</p>
                            <span className='text-2xl font-bold text-orange-500'>C</span>
                        </div>
                    </div>
                </Link>
                <Navbar />
            </div>

            <div className='flex-1 grid lg:grid-cols-2 items-center px-10 max-w-7xl mx-auto w-full'>
                <div className='hidden lg:flex justify-center items-center'>
                    <img 
                        className='w-[450px] drop-shadow-[0_0_25px_rgba(67,31,151,0.5)]' 
                        src='/loginImage.png' 
                        alt="Login illustration"
                    />
                </div>

                <div className='flex justify-center'>
                    <div className='w-full max-w-[420px] bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl'>
                        <h1 className='text-3xl font-semibold mb-2'>Welcome Back</h1>
                        <p className='text-gray-400 text-sm mb-8'>
                            Don't have an account? <Link className='text-orange-400 hover:text-orange-300 transition-colors' href="/signup">Sign up</Link>
                        </p>

                        {message.text && (
                            <div className={`mb-6 p-3 rounded-xl text-sm text-center ${message.isError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className='space-y-1'>
                                <label className='text-xs text-gray-400 ml-1 uppercase tracking-wider'>Email Address</label>
                                <input 
                                    className='w-full bg-white/10 border border-white/5 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/15 transition-all text-sm' 
                                    type='email' 
                                    name='email' 
                                    required
                                    value={formData.email} 
                                    onChange={handleInput} 
                                    placeholder='john@gmail.com'
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-xs text-gray-400 ml-1 uppercase tracking-wider'>Password</label>
                                <input 
                                    className='w-full bg-white/10 border border-white/5 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/15 transition-all text-sm' 
                                    type='password' 
                                    name='password' 
                                    required
                                    value={formData.password} 
                                    onChange={handleInput} 
                                    placeholder='••••••••'
                                />
                            </div>

                            <button type="submit" className='w-full mt-4 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20'>
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login