'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { UserIcon, Cog6ToothIcon } from '@heroicons/react/16/solid'


const tabs = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Run', href: '/run' },
  { name: 'Companies', href: '/companies' },
  { name: 'Notifications', href: '/notifications' },
  { name: 'Logs', href: '/logs' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Findify</h1>
        <nav className="space-x-4 flex flex-1 justify-center">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'text-base font-medium px-3 py-2 rounded-md items-center',
                pathname === tab.href
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <UserIcon className="h-6 w-6 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
