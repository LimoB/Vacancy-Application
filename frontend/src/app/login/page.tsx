"use client";
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Navbar from "@/src/components/Navbar"; // Updated to shared path
import Link from 'next/link';
import Image from 'next/image'; // Next.js optimized images
import { useRouter } from "next/navigation";
import { SiWorkplace } from "react-icons/si";
import { useAuth } from "@/src/context/AuthContext"; // Use the context we created

const Login = () => {
    const router = useRouter();
    const { login } = useAuth(); // Hook into our Auth system
    
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    
    const [message, setMessage] = useState({ text: "", isError: false });

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage({ text: "Authenticating...", isError: false });

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // 1. Use the AuthContext login function to handle storage and state
                login(result.token, result.user);
                
                setMessage({ text: result.message, isError: false });

                // 2. Optimized Role-Based Redirection
                setTimeout(() => {
                    if (result.user.user_role === "admin") {
                        router.push("/admin");
                    } else if (result.user.user_type === "employer") {
                        router.push("/employer");
                    } else {
                        router.push("/seeker");
                    }
                }, 1000);
            } else {
                setMessage({ text: result.message || "Invalid credentials", isError: true });
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage({ text: "Server connection failed. Is Flask running?", isError: true });
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
            <div className='flex-1 grid lg:grid-cols-2 items-center px-10 max-w-7xl mx-auto w-full'>
                <div className='hidden lg:flex justify-center items-center'>
                    {/* Fixed Image component to resolve ESLint warning */}
                    <Image 
                        src='/loginImage.png' 
                        alt="Login illustration"
                        width={450}
                        height={450}
                        priority
                        className='drop-shadow-[0_0_25px_rgba(67,31,151,0.5)] object-contain' 
                    />
                </div>

                <div className='flex justify-center'>
                    <div className='w-full max-w-[420px] bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl'>
                        <h1 className='text-3xl font-semibold mb-2'>Welcome Back</h1>
                        <p className='text-gray-400 text-sm mb-8'>
                            Don&apos;t have an account? <Link className='text-orange-400 hover:text-orange-300 transition-colors' href="/signup">Sign up</Link>
                        </p>

                        {message.text && (
                            <div className={`mb-6 p-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-1 ${
                                message.isError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className='space-y-1'>
                                <label className='text-xs text-gray-400 ml-1 uppercase tracking-wider font-semibold'>Email Address</label>
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
                                <label className='text-xs text-gray-400 ml-1 uppercase tracking-wider font-semibold'>Password</label>
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
    );
};

export default Login;