"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Briefcase, Loader2 } from 'lucide-react'

// --- CODESPACE CONFIGURATION ---
const BACKEND_URL = "https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        // --- REGISTRATION FLOW ---
        // Sending as JSON, matching typical FastAPI Pydantic models
        const response = await fetch(`${BACKEND_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Note: If your backend expects 'username' instead of 'email' for registration, 
          // change the key below to 'username: email'
          body: JSON.stringify({ email, password }), 
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Registration failed. Email might be taken.");
        }

        toast.success("Account created successfully!", {
          description: "Please log in with your new credentials."
        });
        
        // Clear password and flip to login mode
        setPassword("");
        setIsRegistering(false);

      } else {
        // --- LOGIN FLOW ---
        // FastAPI's OAuth2 expects x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append("username", email); // Always 'username' for OAuth2 standard, even if it's an email
        formData.append("password", password);

        const response = await fetch(`${BACKEND_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.access_token);
          toast.success("Login successful!");
          router.push("/"); 
        } else {
          throw new Error("Invalid email or password.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center justify-center text-center mb-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Findify</h2>
          <p className="mt-2 text-sm text-gray-600">
          </p>
        </div>

        <Card className="border-gray-200 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle>{isRegistering ? 'Sign Up' : 'Log In'}</CardTitle>
            <CardDescription>
              {isRegistering 
                ? 'Enter your email and a secure password.' 
                : 'Enter your credentials to access your account.'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 transition-colors" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isRegistering ? "Create Account" : "Sign In"}
              </Button>
              
              <div className="text-sm text-center text-gray-500">
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setIsRegistering(!isRegistering);
                    setPassword(""); 
                  }}
                  className="font-semibold text-gray-900 hover:underline focus:outline-none"
                  disabled={loading}
                >
                  {isRegistering ? "Log in instead" : "Sign up"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}