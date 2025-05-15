import axiosInstance from './lib/axios';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/check');
    
    // Normalize the user data to ensure consistent field names
    const userData = response.data;
    
    return {
      ...userData,
      id: userData.id || userData._id,
      username: userData.username || userData.fullName,
      profileImage: userData.profileImage || userData.profilePic,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/auth/update-profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Signup user
export const signupUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Send a direct (one-to-one) message
export const sendMessage = async (receiverId, content) => {
  try {
    const response = await axiosInstance.post('/messages/send', { receiver: receiverId, content });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Send a message to a group
export const sendGroupMessage = async (groupId, content) => {
  try {
    const response = await axiosInstance.post(`/groups/${groupId}/messages`, { content });
    return response.data;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
};

// Get all messages between the current user and another user
export const getConversationMessages = async (otherUserId) => {
  try {
    const response = await axiosInstance.get(`/messages/conversation/${otherUserId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
};

// Get all groups
export const getGroups = async () => {
  try {
    const response = await axiosInstance.get('/groups');
    // تأكد من أن الاستجابة تحتوي على البيانات المطلوبة
    if (!response.data || !response.data.groups) {
      throw new Error('Invalid response format');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

// Join a group
export const joinGroup = async (groupId) => {
  try {
    const response = await axiosInstance.post(`/groups/${groupId}/join`, {});
    return response.data;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

// Leave a group
export const leaveGroup = async (groupId) => {
  try {
    const response = await axiosInstance.post(`/groups/${groupId}/leave`, {});
    return response.data;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

export const getGroupMessages = async (groupId) => {
  try {
    const response = await axiosInstance.get(`/groups/${groupId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group messages:', error);
    throw error;
  }
};

// Search for users
export const searchUsers = async (searchQuery) => {
  try {
    const response = await axiosInstance.get(`/auth/search?query=${searchQuery}`);
    return response.data.users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Add a friend
export const addFriend = async (friendId) => {
  try {
    const response = await axiosInstance.post('/auth/add-friend', { friendId });
    return response.data;
  } catch (error) {
    console.error('Error adding friend:', error);
    throw error;
  }
};

// Get friends list
export const getFriends = async () => {
  try {
    const response = await axiosInstance.get('/auth/friends');
    return response.data.friends || [];
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

// Remove a friend
export const removeFriend = async (friendId) => {
  try {
    const response = await axiosInstance.post('/auth/remove-friend', { friendId });
    return response.data;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

// Block a user
export const blockUser = async (blockId) => {
  try {
    const response = await axiosInstance.post('/auth/block-user', { blockId });
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

// Unblock a user
export const unblockUser = async (blockId) => {
  try {
    const response = await axiosInstance.post('/auth/unblock-user', { blockId });
    return response.data;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

// Get blocked users
export const getBlockedUsers = async () => {
  try {
    const response = await axiosInstance.get('/auth/blocked');
    return response.data.blocked || [];
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (groupData) => {
  try {
    const response = await axiosInstance.post('/groups', groupData);
    if (!response.data || !response.data.group) {
      throw new Error('Invalid response format');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Add a member to a group
export const addMember = async (groupId, userId) => {
  try {
    const response = await axiosInstance.post(`/groups/${groupId}/add-member`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

// Delete a group
export const deleteGroup = async (groupId) => {
  try {
    const response = await axiosInstance.delete(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};
