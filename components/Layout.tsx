import Link from 'next/link';
import Head from 'next/head';
import { ReactNode, useState, useEffect } from 'react';
import AdminLoginLink from './AdminLoginLink';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title = 'TrendSphere', description = 'Stay updated with the latest trends' }: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md' : 'bg-gradient-to-r from-blue-800 to-indigo-900 shadow-lg'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-blue-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600"></div>
                <svg className="relative h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className={`text-2xl font-bold ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>TrendSphere</span>
            </Link>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-6 items-center">
              <Link href="/" className={`${scrolled ? 'text-gray-900 dark:text-gray-200' : 'text-white'} hover:text-blue-400 transition-colors duration-200`}>
                Home
              </Link>
              <Link href="/technology" className={`${scrolled ? 'text-gray-900 dark:text-gray-200' : 'text-white'} hover:text-blue-400 transition-colors duration-200`}>
                Technology
              </Link>
              <Link href="/business" className={`${scrolled ? 'text-gray-900 dark:text-gray-200' : 'text-white'} hover:text-blue-400 transition-colors duration-200`}>
                Business
              </Link>
              <Link href="/science" className={`${scrolled ? 'text-gray-900 dark:text-gray-200' : 'text-white'} hover:text-blue-400 transition-colors duration-200`}>
                Science
              </Link>
              <Link href="/fashion" className={`${scrolled ? 'text-gray-900 dark:text-gray-200' : 'text-white'} hover:text-blue-400 transition-colors duration-200`}>
                Fashion
              </Link>
              <Link href="/celebrity-news" className={`${scrolled ? 'text-gray-900 dark:text-gray-200' : 'text-white'} hover:text-blue-400 transition-colors duration-200`}>
                Celebrity News
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className={`${scrolled ? 'text-gray-800 dark:text-white' : 'text-white'} hover:text-blue-400`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2 py-4 px-4">
              <Link 
                href="/" 
                className="px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/technology" 
                className="px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Technology
              </Link>
              <Link 
                href="/business" 
                className="px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Business
              </Link>
              <Link 
                href="/science" 
                className="px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Science
              </Link>
              <Link 
                href="/fashion" 
                className="px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fashion
              </Link>
              <Link 
                href="/celebrity-news" 
                className="px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Celebrity News
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="relative h-6 w-6 overflow-hidden rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600"></div>
                  <svg className="relative h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">TrendSphere</span>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a5.162 5.162 0 100 10.324 5.162 5.162 0 000-10.324zm0 8.54a3.377 3.377 0 110-6.755 3.377 3.377 0 010 6.755zm6.644-8.736a1.207 1.207 0 11-2.414 0 1.207 1.207 0 012.414 0z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
              </div>
            </div>
            
            <div className="w-full md:w-auto mb-4 md:mb-0 md:flex md:space-x-8">
              <div className="mb-4 md:mb-0">
                <h3 className="text-sm font-semibold mb-2 text-white">Categories</h3>
                <ul className="grid grid-cols-2 md:grid-cols-1 gap-1">
                  <li><Link href="/technology" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Technology</Link></li>
                  <li><Link href="/business" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Business</Link></li>
                  <li><Link href="/science" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Science</Link></li>
                  <li><Link href="/fashion" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Fashion</Link></li>
                  <li><Link href="/celebrity-news" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Celebrity News</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2 text-white">Links</h3>
                <ul className="grid grid-cols-2 md:grid-cols-1 gap-1">
                  <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">About</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Contact</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-4 pt-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-gray-400 text-xs">© {new Date().getFullYear()} TrendSphere. All rights reserved.</p>
            <AdminLoginLink />
          </div>
        </div>
      </footer>
    </div>
  );
}
