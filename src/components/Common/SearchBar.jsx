// src/components/Common/SearchBar.jsx
import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('Searching for:', query);
      // Implement search logic here
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type here to search employees, departments..."
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
      />
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
    </form>
  );
};

export default React.memo(SearchBar); // Memoized for performance