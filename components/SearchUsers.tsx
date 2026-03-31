"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface SearchUsersProps {
  initialUsers: any[]; // Replace 'any' with your User type after inspection
  onSearchResult: (users: any[]) => void;
}

const SearchUsers: React.FC<SearchUsersProps> = ({ initialUsers, onSearchResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, startTransition] = useTransition();

  // Real-time filter with onChange
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Filter immediately without debounce for real-time experience
    startTransition(() => {
      if (value.trim() === '') {
        onSearchResult(initialUsers);
      } else {
        // Filter locally first for instant response
        const filtered = initialUsers.filter(user => 
          user.name.toLowerCase().includes(value.toLowerCase()) ||
          user.email.toLowerCase().includes(value.toLowerCase()) ||
          (user.department?.name && user.department.name.toLowerCase().includes(value.toLowerCase()))
        );
        onSearchResult(filtered);
        
        // Then fetch from API for more comprehensive results
        fetchSearchResults(value);
      }
    });
  };

  const fetchSearchResults = async (query: string) => {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        onSearchResult(data.users);
      }
    } catch (error) {
      console.error("Search API error:", error);
    }
  };

  useEffect(() => {
    // Keep existing debounce for API calls to prevent spam
    if (searchTerm) {
      const delayDebounceFn = setTimeout(() => {
        fetchSearchResults(searchTerm);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="ابحث عن الاسم، القسم، أو البريد الإلكتروني..."
        className="w-full p-2 pl-10 border rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:ring-sky-500 focus:border-sky-500"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {isSearching && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
