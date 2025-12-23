"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-4">Counter Micro Frontend</h2>
      <p className="text-lg mb-4">Count: {count}</p>
      <div className="flex gap-2">
        <button
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
        >
          Increment
        </button>
        <button
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
        >
          Decrement
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
