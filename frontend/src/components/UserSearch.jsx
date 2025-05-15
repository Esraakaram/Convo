import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { searchUsers, addFriend } from '../api';
import { Input } from './ui/input';
import { Button } from './ui/button';

const UserSearch = ({ onFriendAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingFriend, setAddingFriend] = useState({});
  const [success, setSuccess] = useState({});

  const handleSearch = async () => {
    if (searchQuery.trim().length < 1) return;
    
    setLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    setAddingFriend(prev => ({ ...prev, [userId]: true }));
    setError(null);
    
    try {
      await addFriend(userId);
      setSuccess(prev => ({ ...prev, [userId]: true }));
      
      // Notify parent component that a friend was added
      if (onFriendAdded) {
        onFriendAdded();
      }
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }, 3000);
    } catch (err) {
      setError(`Failed to add user: ${err.response?.data?.message || err.message}`);
    } finally {
      setAddingFriend(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Find Friends</h2>
      
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loading && (
              <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
            )}
          </div>
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center"
        >
          <FaSearch className="mr-2" />
          Search
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {searchResults.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden mr-3">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{user.fullName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div>
                  {success[user._id] ? (
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <FaCheck className="mr-1" /> Added
                    </span>
                  ) : (
                    <Button 
                      onClick={() => handleAddFriend(user._id)}
                      disabled={addingFriend[user._id]}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2"
                    >
                      {addingFriend[user._id] ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <FaUserPlus />
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {searchResults.length === 0 && !loading && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center p-4 text-gray-500 dark:text-gray-400"
          >
            No users found. Try a different search.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearch; 