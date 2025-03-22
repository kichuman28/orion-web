import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8 dark:bg-gray-800 transition-colors duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <a href="https://vite.dev" target="_blank" className="hover:opacity-80 transition-opacity">
              <img src={viteLogo} className="w-16 h-16" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" className="hover:opacity-80 transition-opacity">
              <img src={reactLogo} className="w-16 h-16 animate-spin-slow" alt="React logo" />
            </a>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Tailwind CSS + React
        </h1>
        
        <div className="max-w-md mx-auto bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden md:max-w-2xl mb-8 p-6">
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="mb-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all"
            >
              Count is {count}
            </button>
            <p className="text-gray-600 dark:text-gray-300">
              Edit <code className="bg-gray-100 dark:bg-gray-600 px-1 py-0.5 rounded">src/App.jsx</code> and save to test HMR
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">Responsive Design</h2>
            <p className="text-blue-700 dark:text-blue-300">Test different screen sizes to see the responsive layout</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">Dark Mode</h2>
            <p className="text-green-700 dark:text-green-300">Toggle between light and dark themes</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-purple-800 dark:text-purple-200">Utility Classes</h2>
            <p className="text-purple-700 dark:text-purple-300">Explore Tailwind's utility-first approach</p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App
