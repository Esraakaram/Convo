import { io } from 'socket.io-client';
import { getUserProfile } from '../api';

let socket = null;

// Create and initialize the socket connection
export const initSocket = async () => {
  try {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
    
    // Create a new socket instance with the token in auth
    socket = io('http://localhost:5000', {
      auth: { token },
      withCredentials: true,
    });
    
    // Set up event listeners for connection
    socket.on('connect', () => {
      console.log('Socket.IO connection established');
      
      // Join personal room to receive direct messages
      socket.emit('join');
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });
    
    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    return null;
  }
};

// Get the socket instance (creates one if it doesn't exist)
export const getSocket = async () => {
  if (!socket) {
    return await initSocket();
  }
  
  if (socket.connected) {
    return socket;
  } else {
    // Try to reconnect
    socket.connect();
    return socket;
  }
};

// Helper method to send a direct message via socket
export const sendDirectMessage = async (receiverId, content) => {
  const socket = await getSocket();
  
  if (!socket) {
    throw new Error('Socket connection not established');
  }
  
  // Get the current user
  const currentUser = await getUserProfile();
  
  return new Promise((resolve, reject) => {
    socket.emit('send-message', {
      sender: currentUser.id,
      receiver: receiverId,
      content
    }, (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
}; 