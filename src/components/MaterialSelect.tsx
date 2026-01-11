import { useState, useRef, useEffect } from 'react'
import './MaterialSelect.css'

export interface SelectOption {
  value: string
  label: string
  group?: string
}

interface MaterialSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  id?: string
  className?: string
}

export default function MaterialSelect({
  label,
  value,
  onChange,
  options,
  id,
  className = '',
}: MaterialSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.group && option.group.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Group filtered options by group label
  const groupedOptions = filteredOptions.reduce(
    (acc, option) => {
      const group = option.group || 'Other'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(option)
      return acc
    },
    {} as Record<string, SelectOption[]>
  )

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setFocused(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && dropdownRef.current && selectRef.current) {
      const selectRect = selectRef.current.getBoundingClientRect()
      const dropdown = dropdownRef.current
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - selectRect.bottom
      const spaceAbove = selectRect.top

      // Position dropdown - prefer below, but above if not enough space
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        dropdown.style.bottom = `${selectRect.height}px`
        dropdown.style.top = 'auto'
      } else {
        dropdown.style.top = `${selectRect.height}px`
        dropdown.style.bottom = 'auto'
      }
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchTerm('') // Clear search when dropdown closes
    }
  }, [isOpen])

  // Helper function to highlight matching text
  const highlightMatch = (text: string, search: string) => {
    if (!search) return text
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 px-0">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setFocused(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Select Field */}
      <div
        ref={selectRef}
        id={id}
        className={`
          relative w-full min-h-[56px] px-4 py-2 
          bg-white border-2 rounded
          cursor-pointer transition-all duration-200
          ${isOpen || focused
            ? 'border-blue-500 shadow-md'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
          setFocused(true)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          if (!isOpen) setFocused(false)
        }}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Label */}
        <label
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${isOpen || focused || value
              ? 'top-2 text-xs text-blue-500'
              : 'top-4 text-base text-gray-500'
            }
          `}
        >
          {label}
        </label>

        {/* Selected Value */}
        <div
          className={`
            mt-5 text-gray-900 text-base
            ${!value ? 'text-gray-400' : ''}
          `}
        >
          {selectedOption ? selectedOption.label : ''}
        </div>

        {/* Dropdown Arrow */}
        <div
          className={`
            absolute right-4 top-1/2 -translate-y-1/2
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        {/* Active Indicator */}
        {(isOpen || focused) && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 w-full mt-1 
            bg-white border border-gray-300 rounded-lg shadow-lg
            max-h-96 flex flex-col
            animate-dropdown
          `}
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="sticky top-0 z-10 p-3 bg-white border-b border-gray-200 rounded-t-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchTerm('')
                    searchInputRef.current?.focus()
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No options found</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {/* Group Label */}
                  {Object.keys(groupedOptions).length > 1 && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                      {group}
                    </div>
                  )}

                  {/* Options */}
                  {groupOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`
                        px-4 py-3 cursor-pointer transition-colors duration-150
                        ${value === option.value
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-900 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => handleSelect(option.value)}
                      role="option"
                      aria-selected={value === option.value}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">
                          {highlightMatch(option.label, searchTerm)}
                        </span>
                        {value === option.value && (
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop (for mobile-like experience) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-5 z-40"
          onClick={() => {
            setIsOpen(false)
            setFocused(false)
          }}
        />
      )}
    </div>
  )
}

