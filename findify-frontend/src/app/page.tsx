'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, ArrowRight, Loader2 } from 'lucide-react'

// --- CODESPACE CONFIGURATION ---
const BACKEND_URL = "https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev"

export default function Home() {
  const [stats, setStats] = useState({ companies: 0, internships: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      window.location.href = '/login'
      return
    }

    const fetchDashboardData = async () => {
      try {
        const compRes = await fetch(`${BACKEND_URL}/companies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (compRes.status === 401) {
          throw new Error("Unauthorized");
        }
        
        const companiesData = await compRes.json();
        const intRes = await fetch(`${BACKEND_URL}/internships`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const internshipsData = intRes.ok ? await intRes.json() : [];
        setStats({
          companies: companiesData.length || 0,
          internships: internshipsData.length || 0
        });

      } catch (error: any) {
        console.error('Dashboard fetch error:', error);
        if (error.message === "Unauthorized") {
          localStorage.removeItem("token");
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
        <p className="text-lg text-gray-600">
          Your automated scraper is currently tracking <span className="font-semibold text-gray-900">{stats.companies} companies</span> and has found <span className="font-semibold text-gray-900">{stats.internships} internships</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-600">Tracked Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{stats.companies}</div>
            <p className="text-xs text-gray-500 mt-1">Actively being scraped</p>
          </CardContent>
          <CardFooter>
            <Link href="/companies" className="w-full">
              <Button variant="outline" className="w-full justify-between group border-gray-300">
                Manage Companies
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform text-gray-500" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-600">Found Internships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{stats.internships}</div>
            <p className="text-xs text-gray-500 mt-1">Saved to your database</p>
          </CardContent>
          <CardFooter>
            <Link href="/internships" className="w-full">
              <Button variant="outline" className="w-full justify-between group border-gray-300">
                View Internships
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform text-gray-500" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-600">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mt-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-lg font-medium text-gray-900">Online & Ready</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Manual execution required</p>
          </CardContent>
          <CardFooter>
            <Link href="/run" className="w-full">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white justify-between group">
                Run Scraper Now
                <Activity className="h-4 w-4 ml-2 group-hover:animate-pulse" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}