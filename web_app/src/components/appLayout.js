'use client'
import { UserCircleIcon, Cog8ToothIcon, ArrowRightStartOnRectangleIcon, ChevronDownIcon, SunIcon, MoonIcon, LifebuoyIcon, BoltIcon} from '@heroicons/react/24/outline';
import Logo from '@/public/assets/navLogo.svg'
import avatar_placeholder from '@/app/favicon.ico'
import Link from 'next/link'
import Image from 'next/image'
import SidebarDrawer from './sidebarDrawer.js'

import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/hooks";
import { useClerk } from '@clerk/nextjs';
import { setTheme } from "@/lib/features/theme/themeSlice";

export default function AppLayout({ children }) {

    const dispatch = useAppDispatch()
    const theme = useAppSelector((state) => state.theme.value);

    const { signOut, user, loaded } = useClerk();

    return (
    <html lang="en" data-theme={theme}>
    <body className='flex min-h-dvh bg-base-200'>
    <div className="flex flex-col flex-1">

          {/* Navigation Bar */}
          <div className="navbar z-3 bg-base-200 h-16 py-4 pr-10 shadow-lg">
            <div className="flex-1">
              <Link href='/' className="btn btn-ghost normal-case text-xl no-animation hover:border-transparent hover:shadow-none hover:bg-transparent active:bg-transparent">
                <Logo alt="Brand Logo" className="h-10 w-auto" />
              </Link>
            </div>
            <div className="flex-none">
              <ul className="menu menu-horizontal p-0 gap-5">
                {/* Featured iocn navaigation links go here */}

                {/* Theme Selection */}
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost">Theme<ChevronDownIcon className="h-3 w-3 ml-1" /></label>
                    <ul tabIndex={0} className="mt-3 p-1 shadow menu menu-compact dropdown-content bg-base-100 rounded-box">
                        <li className='group'><a className={theme === 'light' ? 'text-primary' : ''} onClick={() => dispatch(setTheme('light'))}><SunIcon className="h-5 w-5 mr-2 group-hover:scale-110" />Light</a></li>
                        <li className='group'><a className={theme === 'dark' ? 'text-primary' : ''} onClick={() => dispatch(setTheme('dark'))}><MoonIcon className="h-5 w-5 mr-2 group-hover:scale-110" />Dark</a></li>
                        <li className='group'><a className={theme === 'ocean' ? 'text-primary' : ''} onClick={() => dispatch(setTheme('ocean'))}><LifebuoyIcon className="h-5 w-5 mr-2 group-hover:scale-110" />Ocean</a></li>
                        <li className='group'><a className={theme === 'coffee' ? 'text-primary' : ''} onClick={() => dispatch(setTheme('coffee'))}><BoltIcon className="h-5 w-5 mr-2 group-hover:scale-110" />Coffee</a></li>
                    </ul>
                </div>
              </ul>
            </div>

            {/* User Profile Dropdown Menu */}
            <div className="flex-none ml-5">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost hover:bg-transparent hover:border-none btn-circle avatar h-15 w-15">
                  <div className="size-[45px] rounded-full hover:scale-110">
                    <Image src={loaded ? user.imageUrl : avatar_placeholder} alt="User Avatar" width="45" height="45" />
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                  <li className='group'><a><UserCircleIcon className="h-5 w-5 mr-2 group-hover:scale-110" />Profile</a></li>
                  <li className='group'><a><Cog8ToothIcon className="h-5 w-5 mr-2 group-hover:scale-110" />Settings</a></li>
                  <li className='group'>
                    <button onClick={() => {
                        signOut({
                          redirectUrl: '/',
                        })}
                      }>
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2 group-hover:scale-110"/>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            </div>

           <div className='flex flex-row h-full'>
            {/* Sidebar Drawer */}
            <SidebarDrawer />

            {/* Main Content Area */}
            <div className="z-1 flex flex-col w-full">
              {/* Main App Router Content */  }
              <div className="grow">
                { children }
              </div>

              {/* Footer */}
              <div className="footer h-12 bg-transparent p-4 flex flex-row justify-center">
                <p className=''>&copy; 2025 Shayne Rimer</p>
              </div>

            </div>
          </div>
          
          

        </div>

      </body>
    </html>
  )

}