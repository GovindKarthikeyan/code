"use client";

import { useState } from "react";

interface UserProfileProps {
  initialName?: string;
  initialEmail?: string;
}

export default function UserProfile({
  initialName = "John Doe",
  initialEmail = "john.doe@example.com",
}: UserProfileProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-4">User Profile Micro Frontend</h2>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm opacity-80">Name</p>
            <p className="text-lg font-semibold">{name}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Email</p>
            <p className="text-lg font-semibold">{email}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
