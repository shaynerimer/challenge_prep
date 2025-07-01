 import React, { useState } from 'react';
 import { Cog8ToothIcon, ChartPieIcon, HomeIcon, BookOpenIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
 import Link from 'next/link'
 
 {/* Sidebar Drawer */}
export default function SidebarDrawer() {
    const [expanded, setExpanded] = useState(false);

    return (
    <div className={`z-2 h-full transition-all duration-0 bg-base-200 shadow-lg flex flex-col ${expanded ? 'w-64' : 'w-16'}`}>
        <nav className="flex-1 flex flex-col">
        {/* Collapse/Expand Button */}
        <button
            className={`btn btn-ghost flex items-center ${expanded ? 'justify-start' : 'justify-center'} align-center w-full h-14 border-b-1 border-0 border-gray-300`}
            onClick={() => setExpanded((e) => !e)}
        >
            <ChevronDownIcon
                className="h-6 w-6 transition-transform"
                style={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(270deg)',
                }}
            />
        </button>
        {/* Navigation Buttons */}
        
        <Link href="/app" className={`btn btn-ghost flex items-center ${expanded ? 'justify-start' : 'justify-center'} align-center w-full h-14 border-b-1 border-0 border-gray-300`}>
            <HomeIcon className="h-6 w-6" />
            {expanded && <span>Home</span>}
        </Link>
        <Link href="/reports" className={`btn btn-ghost flex items-center ${expanded ? 'justify-start' : 'justify-center'} align-center w-full h-14 border-b-1 border-0 border-gray-300`}>
            <ChartPieIcon className="h-6 w-6" />
            {expanded && <span>Reports</span>}
        </Link>
        <Link href="/history" className={`btn btn-ghost flex items-center ${expanded ? 'justify-start' : 'justify-center'} align-center w-full h-14 border-b-1 border-0 border-gray-300`}>
            <BookOpenIcon className="h-6 w-6" />
            {expanded && <span>History</span>}
        </Link>
        </nav>
        {/* Bottom Section */}
        <div className="mt-auto mb-2 flex flex-col">
        <Link href="/app" className={`btn btn-ghost flex items-center ${expanded ? 'justify-start' : 'justify-center'} align-center w-full h-14 border-b-1 border-0 border-gray-300`}>
            <Cog8ToothIcon className="h-6 w-6" />
            {expanded && <span>Settings</span>}
        </Link>
        <div className="text-xs text-center text-base-content/60 py-2">v1.0.0</div>
        </div>
    </div>
    );
}