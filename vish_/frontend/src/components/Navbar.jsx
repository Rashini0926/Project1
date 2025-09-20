import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll event for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 w-full z-30  transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-blue-700 text-white'}`}>
      <div className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mr-2 ${scrolled ? 'text-blue-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <Link to="/" className={`font-bold text-xl ${scrolled ? 'text-blue-600' : 'text-white'}`}>
                Order Management
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/') 
                      ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-white text-blue-700') 
                      : (scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-blue-600')
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Orders</span>
                  </div>
                </Link>
                
                <Link 
                  to="/clothing-items" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/clothing-items') || location.pathname.startsWith('/clothing-items/') 
                      ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-white text-blue-700') 
                      : (scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-blue-600')
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Clothing Items</span>
                  </div>
                </Link>
                
                <Link 
                  to="/orders/create" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/orders/create') 
                      ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-white text-blue-700') 
                      : (scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-blue-600')
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>New Order</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <span className={`text-sm font-medium ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled 
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' 
                  : 'text-white hover:text-white hover:bg-blue-600'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${scrolled ? 'bg-white' : 'bg-blue-700'}`}>
          <Link 
            to="/" 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') 
                ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-white text-blue-700') 
                : (scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-blue-600')
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Orders</span>
          </Link>
          <Link 
            to="/clothing-items" 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/clothing-items') || location.pathname.startsWith('/clothing-items/') 
                ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-white text-blue-700') 
                : (scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-blue-600')
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Clothing Items</span>
          </Link>
          <Link 
            to="/orders/create" 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/orders/create') 
                ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-white text-blue-700') 
                : (scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-blue-600')
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>New Order</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
