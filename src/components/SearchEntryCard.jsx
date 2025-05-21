import React from 'react';

const SearchEntryCard = ({ entry }) => {
  const { query, timestamp, coords } = entry;

  return (
    <li className="p-4 bg-gray-100 rounded shadow-sm">
      <h1 className='text-2xl'>Searched for <strong>"{query}"</strong></h1>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      {coords?.lat && (
        <p><strong>Location:</strong> {coords.lat}, {coords.lon}</p>
      )}
    </li>
  );
};

export default SearchEntryCard;
