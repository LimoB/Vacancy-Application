"use client";
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Optimized Image component
import Navbar from '@/src/components/Navbar'; 
import { useRouter } from 'next/navigation';
import { SiWorkplace } from "react-icons/si";
import { UserType } from '@/src/types'; 

const SignUp = () => {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        location: "",
        about: "",
        user_type: "seeker" as UserType
    });

    const [message, setMessage] = useState({ text: "", isError: false });

    const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Client-side validation (Matches Flask schema)
        if (!formData.email.endsWith("@gmail.com")) {
            setMessage({ text: "Registration currently limited to @gmail.com addresses.", isError: true });
            return;
        }

        setMessage({ text: "Creating account...", isError: false });

        try {
            const response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage({ text: result.message, isError: false });
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            } else {
                setMessage({ 
                    text: result.message || result.error || "Signup failed.", 
                    isError: true 
                });
            }
        } catch (error) {
            console.error("Signup error:", error);
            setMessage({ text: "Connection to server failed. Ensure Flask is running.", isError: true });
        }
    };

    return (
        <div className='min-h-screen w-full bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white flex flex-col'>
            {/* Nav Section */}
            <div className='flex w-full items-center justify-between p-6 px-10 lg:px-[60px]'>
                <Link href="/">
                    <div className='flex items-center gap-2 group cursor-pointer'>
                        <SiWorkplace className='text-orange-500 text-2xl group-hover:scale-110 transition-transform' />
                        <div className='flex items-baseline'>
                            <p className='italic font-light text-xl tracking-tight'>vacan</p>
                            <span className='text-2xl font-bold text-orange-500'>C</span>
                        </div>
                    </div>
                </Link>
                <Navbar />
            </div>

            {/* Main Content */}
            <div className='flex-1 grid lg:grid-cols-2 items-center px-6 lg:px-10 max-w-7xl mx-auto w-full py-6'>
                
                {/* Optimized Image Section */}
                <div className='hidden lg:flex justify-center items-center'>
                    <Image 
                        src='/signup.png' 
                        alt="Signup illustration"
                        width={480}           
                        height={480}          
                        priority              
                        className='drop-shadow-[0_0_20px_rgba(72,33,165,0.4)] object-contain' 
                    />
                </div>

                {/* Form Section */}
                <div className='flex justify-center'>
                    <div className='w-full max-w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl'>
                        <h1 className='text-2xl font-semibold mb-2'>Create Account</h1>
                        <p className='text-gray-400 text-sm mb-6'>
                            Already have an account? <Link className='text-orange-400 hover:text-orange-300 transition-colors' href="/login">Sign in</Link>
                        </p>

                        {message.text && (
                            <div className={`mb-6 p-3 rounded-xl text-sm text-center ${
                                message.isError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-1'>
                                    <label className='text-[10px] text-gray-400 ml-1 uppercase tracking-widest'>Username</label>
                                    <input className='w-full bg-white/10 border border-white/5 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-orange-500/50 text-sm' 
                                           type='text' name="username" value={formData.username} onChange={handleInput} placeholder='kali_dev' required/>
                                </div>
                                <div className='space-y-1'>
                                    <label className='text-[10px] text-gray-400 ml-1 uppercase tracking-widest'>Account Type</label>
                                    <select name="user_type" value={formData.user_type} onChange={handleInput} 
                                            className='w-full bg-[#1a1464] border border-white/5 rounded-xl p-2.5 outline-none text-sm text-white'>
                                        <option value="seeker">Job Seeker</option>
                                        <option value="employer">Employer</option>
                                    </select>
                                </div>
                            </div>

                            <div className='space-y-1'>
                                <label className='text-[10px] text-gray-400 ml-1 uppercase tracking-widest'>Email</label>
                                <input className='w-full bg-white/10 border border-white/5 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-orange-500/50 text-sm' 
                                       type='email' name='email' value={formData.email} onChange={handleInput} placeholder='dev@gmail.com' required/>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-1'>
                                    <label className='text-[10px] text-gray-400 ml-1 uppercase tracking-widest'>Location</label>
                                    <input className='w-full bg-white/10 border border-white/5 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-orange-500/50 text-sm' 
                                           type='text' name='location' value={formData.location} onChange={handleInput} placeholder='Nairobi'/>
                                </div>
                                <div className='space-y-1'>
                                    <label className='text-[10px] text-gray-400 ml-1 uppercase tracking-widest'>Password</label>
                                    <input className='w-full bg-white/10 border border-white/5 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-orange-500/50 text-sm' 
                                           type='password' name='password' value={formData.password} onChange={handleInput} placeholder='••••••••' required/>
                                </div>
                            </div>

                            <div className='space-y-1'>
                                <label className='text-[10px] text-gray-400 ml-1 uppercase tracking-widest'>About You</label>
                                <textarea className='w-full bg-white/10 border border-white/5 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-orange-500/50 text-sm h-20 resize-none' 
                                          name='about' value={formData.about} onChange={handleInput} placeholder='Professional background...'/>
                            </div>

                            <button type="submit" className='w-full mt-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20'>
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;