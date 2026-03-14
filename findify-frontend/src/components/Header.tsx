'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { UserIcon, Cog8ToothIcon } from '@heroicons/react/16/solid'

// Added Notifications right back where it was!
const tabs = [
  { name: 'Companies', href: '/companies' },
  { name: 'Run', href: '/run' },
  { name: 'Internships', href: '/internships' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  
  if (pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.removeItem("token") 
    router.push("/login")        
  }

  return (
    <header className="bg-white shadow-md border-b-2">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-600 transition-colors">
          Findify
        </Link>
        <nav className="space-x-4 flex flex-1 justify-center">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'text-base font-medium px-3 py-2 rounded-md items-center transition-colors',
                pathname === tab.href
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-2">
          
          {/* Settings Gear Icon */}
          <Link 
            href="/settings" 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Cog8ToothIcon className="h-6 w-6 text-gray-600" />
          </Link>

          {/* Profile Icon */}
          <Link 
            href="/profile" 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Profile"
          >
            <UserIcon className="h-6 w-6 text-gray-600" />
          </Link>
          
          <button 
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}