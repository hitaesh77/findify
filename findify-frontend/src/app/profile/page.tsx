'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Key, Loader2 } from 'lucide-react'

const BACKEND_URL = "https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev"

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string, username?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      
      if (!token) {
        window.location.href = '/login'
        return
      }

      try {
        const res = await fetch(`${BACKEND_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.status === 401) {
          throw new Error('Unauthorized')
        }

        if (!res.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await res.json()
        setUser(data)
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          localStorage.removeItem("token")
          window.location.href = '/login'
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handlePasswordUpdate = async () => {
    setStatusMsg({ text: "", type: "" })
    
    if (!newPassword || !confirmPassword) {
      setStatusMsg({ text: "Please fill in both password fields.", type: "error" })
      return
    }
    
    if (newPassword !== confirmPassword) {
      setStatusMsg({ text: "Passwords do not match.", type: "error" })
      return
    }

    setIsUpdating(true)
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${BACKEND_URL}/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update password")
      }

      setStatusMsg({ text: "Password updated successfully!", type: "success" })
      setNewPassword("")
      setConfirmPassword("")
      
    } catch (error: any) {
      setStatusMsg({ text: error.message, type: "error" })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Profile</h1>
        <p className="text-lg text-gray-600">
          Manage your account settings and credentials.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <User className="mr-2 h-5 w-5 text-gray-600" />
              Personal Information
            </CardTitle>
            <CardDescription>Your current account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  value={user?.email || user?.username || "Loading..."} 
                  disabled 
                  className="pl-10 bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200"
                />
              </div>
              <p className="text-xs text-gray-500">This is the email you use to log in. It cannot be changed here.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Key className="mr-2 h-5 w-5 text-gray-600" />
              Security
            </CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {statusMsg.text && (
              <p className={`text-sm font-medium ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {statusMsg.text}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handlePasswordUpdate} 
              disabled={isUpdating}
              className="bg-gray-900 hover:bg-gray-800 text-white border-none"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}