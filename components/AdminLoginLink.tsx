import React from 'react';
import Link from 'next/link';

// This component provides a simple way to access the admin area
// Only for demonstration purposes - in a real app, you would have proper authentication UI

export default function AdminLoginLink() {
  return (
    <Link 
      href="/direct-login" 
      className="text-xs text-gray-400 hover:text-white absolute bottom-4 right-4 opacity-50 hover:opacity-100"
    >
      Admin Access
    </Link>
  );
}
