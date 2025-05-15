import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaUserFriends, FaUserSlash, FaTrash, FaLock, FaUnlock, FaCheck } from 'react-icons/fa';
import { searchUsers, getFriends, getBlockedUsers, addFriend, removeFriend, blockUser, unblockUser } from '../api';
import { Input } from './ui/input';
import { Button } from './ui/button';

const FriendManagement = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({});
  const [success, setSuccess] = useState({});

  // Load friends and blocked users
  useEffect(() => {
    if (activeTab === 'friends') {
      loadFriends();
    } else if (activeTab === 'blocked') {
      loadBlockedUsers();
    }
  }, [activeTab]);

  const loadFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (err) {
      console.error("Failed to load friends:", err);
      setError("Failed to load friends list");
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const blockedList = await getBlockedUsers();
      setBlockedUsers(blockedList);
    } catch (err) {
      console.error("Failed to load blocked users:", err);
      setError("Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  };

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
    setActionInProgress(prev => ({ ...prev, [userId]: true }));
    setError(null);
    
    try {
      await addFriend(userId);
      setSuccess(prev => ({ ...prev, [userId]: 'added' }));
      
      // Refresh friends list
      loadFriends();
      
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
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setActionInProgress(prev => ({ ...prev, [friendId]: true }));
    setError(null);
    
    try {
      await removeFriend(friendId);
      setSuccess(prev => ({ ...prev, [friendId]: 'removed' }));
      
      // Refresh friends list
      loadFriends();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(prev => {
          const newState = { ...prev };
          delete newState[friendId];
          return newState;
        });
      }, 3000);
    } catch (err) {
      setError(`Failed to remove friend: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[friendId];
        return newState;
      });
    }
  };

  const handleBlockUser = async (userId) => {
    setActionInProgress(prev => ({ ...prev, [userId]: true }));
    setError(null);
    
    try {
      await blockUser(userId);
      setSuccess(prev => ({ ...prev, [userId]: 'blocked' }));
      
      // Refresh lists
      if (activeTab === 'friends') {
        loadFriends();
      } else {
        loadBlockedUsers();
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
      setError(`Failed to block user: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleUnblockUser = async (userId) => {
    setActionInProgress(prev => ({ ...prev, [userId]: true }));
    setError(null);
    
    try {
      await unblockUser(userId);
      setSuccess(prev => ({ ...prev, [userId]: 'unblocked' }));
      
      // Refresh blocked users list
      loadBlockedUsers();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }, 3000);
    } catch (err) {
      setError(`Failed to unblock user: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  // Tab navigation items
  const tabs = [
    { id: 'search', label: 'Find Users', icon: <FaUserPlus /> },
    { id: 'friends', label: 'My Friends', icon: <FaUserFriends /> },
    { id: 'blocked', label: 'Blocked Users', icon: <FaUserSlash /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 font-medium text-sm ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name or email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {loading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || searchQuery.trim().length < 1}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2"
                >
                  Search
                </Button>
              </div>

              {/* Search Results */}
              <div className="space-y-3 mt-4">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
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
                      <div className="flex space-x-2">
                        {success[user._id] === 'added' ? (
                          <span className="flex items-center text-green-600 dark:text-green-400 px-2">
                            <FaCheck className="mr-1" /> Added
                          </span>
                        ) : (
                          <Button 
                            onClick={() => handleAddFriend(user._id)}
                            disabled={actionInProgress[user._id]}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2"
                            title="Add Friend"
                          >
                            {actionInProgress[user._id] ? (
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <FaUserPlus />
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => handleBlockUser(user._id)}
                          disabled={actionInProgress[user._id]}
                          className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-2"
                          title="Block User"
                        >
                          {actionInProgress[user._id] ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <FaLock />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : searchQuery && !loading ? (
                  <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                    No users found matching "{searchQuery}"
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <motion.div
                    key={friend._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden mr-3">
                        {friend.profilePic ? (
                          <img src={friend.profilePic} alt={friend.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
                            {friend.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{friend.fullName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {success[friend._id] === 'removed' ? (
                        <span className="flex items-center text-red-600 dark:text-red-400 px-2">
                          Removed
                        </span>
                      ) : (
                        <Button 
                          onClick={() => handleRemoveFriend(friend._id)}
                          disabled={actionInProgress[friend._id]}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                          title="Remove Friend"
                        >
                          {actionInProgress[friend._id] ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <FaTrash />
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => handleBlockUser(friend._id)}
                        disabled={actionInProgress[friend._id]}
                        className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-2"
                        title="Block User"
                      >
                        {actionInProgress[friend._id] ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <FaLock />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-4">You don't have any friends yet.</p>
                  <Button 
                    onClick={() => setActiveTab('search')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                  >
                    Find Friends
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Blocked Users Tab */}
          {activeTab === 'blocked' && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : blockedUsers.length > 0 ? (
                blockedUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
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
                    <div className="flex space-x-2">
                      {success[user._id] === 'unblocked' ? (
                        <span className="flex items-center text-green-600 dark:text-green-400 px-2">
                          Unblocked
                        </span>
                      ) : (
                        <Button 
                          onClick={() => handleUnblockUser(user._id)}
                          disabled={actionInProgress[user._id]}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2"
                          title="Unblock User"
                        >
                          {actionInProgress[user._id] ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <FaUnlock />
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  You haven't blocked any users.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FriendManagement; 