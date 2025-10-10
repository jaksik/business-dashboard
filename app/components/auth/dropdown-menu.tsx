// components/dropdown-menu.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// Define the type for a navigation link
type NavLink = {
  label: string
  href: string
}

// Define the props for the DropdownMenu component
interface DropdownMenuProps {
  title: string
  links: readonly NavLink[]
}

export function DropdownMenu({ title, links }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    // Add event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen]) // Only re-run if isOpen changes

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none text-lg"
      >
        {title}
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)} // Close dropdown on link click
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}