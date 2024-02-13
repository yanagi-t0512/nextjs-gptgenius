'use client'
import { useState } from 'react'
import { BsMoonFill, BsSunFill } from 'react-icons/bs'

const themes = {
  fantasy: 'fantasy',
  business: 'business',
}

const ThemeToggle = () => {
  const [theme, setTheme] = useState(themes.fantasy)

  const toggleTheme = () => {
    const newTheme = theme === themes.fantasy ? themes.business : themes.fantasy
    document.documentElement.setAttribute('data-theme', newTheme)
    setTheme(newTheme)
  }

  return (
    <button onClick={toggleTheme} className="btn btn-sm btn-outline">
      {theme === 'winter' ?
        (<BsMoonFill className='h-4 w4' />) :
        (<BsSunFill className='h-4 w4' />)
      }
    </button>
  )
}

export default ThemeToggle