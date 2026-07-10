"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, ArrowRight, Loader2, MonitorPlay, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function LoginModal() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setEmail("");
        setName("");
        setPassword("");
        setError("");
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password || (isSignUp && !name)) return;
        
        setIsLoading(true);
        try {
            if (isSignUp) {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                if (!res.ok) {
                    const data = await res.json();
                    let errorMsg = "Registration failed. Please check your inputs.";
                    if (data.detail) {
                        if (Array.isArray(data.detail)) {
                            // Pydantic validation error array
                            errorMsg = data.detail[0].msg;
                        } else if (typeof data.detail === "string") {
                            errorMsg = data.detail;
                        }
                    }
                    setError(errorMsg);
                    setIsLoading(false);
                    return;
                }
            }
            
            const result = await signIn("credentials", { email, password, redirect: false });
            if (result?.error) {
                setError("Invalid email or password.");
            } else {
                window.location.href = "/";
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        await signIn("google", { callbackUrl: "/" });
        setIsGoogleLoading(false);
    };

    return (
        <div className="h-dvh w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {/* Left Side: Brand Visual */}
            <div className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden bg-zinc-950">
                <Image 
                    src="/login-bg.png" 
                    alt="Abstract Glass background" 
                    fill 
                    className="object-cover opacity-60"
                    priority
                />
                
                {/* Overlay Scrim for text readability */}
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-zinc-950/40 to-transparent" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <MonitorPlay className="w-6 h-6 text-primary" />
                        <span className="text-xl font-bold tracking-tight text-white">VidScribe</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-5xl font-semibold tracking-tighter leading-tight text-white mb-6"
                    >
                        Video intelligence, distilled.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-zinc-400 text-lg leading-relaxed"
                    >
                        Extract key topics, full transcripts, and actionable insights from any YouTube video in seconds. 
                    </motion.p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex items-center justify-center p-8 md:p-12 bg-background overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                            {isSignUp ? "Create an account" : "Welcome back"}
                        </h2>
                        <p className="text-muted-foreground">
                            {isSignUp ? "Sign up to start summarizing videos." : "Sign in to your account to continue."}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading || isLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors text-foreground font-medium disabled:opacity-50 cursor-pointer"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            )}
                            Continue with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-destructive border border-destructive/20 bg-destructive/5 rounded-lg text-center">
                                    {error}
                                </div>
                            )}
                            {isSignUp && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-2.5 bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || isGoogleLoading || !email || !password}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isSignUp ? "Sign Up" : "Sign In"}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">
                            {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        </span>
                        <button 
                            onClick={toggleMode}
                            className="text-primary hover:underline font-medium cursor-pointer"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
