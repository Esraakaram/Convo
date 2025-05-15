"use client";

import { useState, useEffect } from "react";
import { getUserProfile, getFriends, getConversationMessages, sendMessage, getGroups } from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import ChatList from "../components/chat-list";
import Chatbox from "../components/Chatbox";
import Welcome from "../components/welcome-screen";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import MobileNavbar from "../components/mobile-navbar";
import { motion, AnimatePresence } from "framer-motion";
import { initSocket, sendDirectMessage, disconnectSocket, getSocket } from "../lib/socket";

const Home = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorChats, setErrorChats] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const setupSocket = async () => {
      const socket = await initSocket();
      setSocketInstance(socket);
      
      if (socket) {
        // Listen for incoming direct messages
        socket.on('receive-message', (message) => {
          console.log('Received message via socket:', message);
          
          // If the message is from or to the currently selected chat
          if (selectedChat && 
             (message.sender === selectedChat.id || message.receiver === selectedChat.id)) {
            // Refresh messages for the current chat
            handleChatSelect(selectedChat);
          }
          
          // Update the chat list to show the latest message
          updateChatWithNewMessage(message);
        });
      }
    };
    
    setupSocket();
    
    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);
  
  // Update socket listeners when selected chat changes
  useEffect(() => {
    const updateSocketRoom = async () => {
      if (selectedChat) {
        const socket = await getSocket();
        if (socket) {
          // Join the room for the selected chat to receive messages
          socket.emit('join');
        }
      }
    };
    
    updateSocketRoom();
  }, [selectedChat]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Fetch friends list and format as chats
    const fetchChats = async () => {
      setLoadingChats(true);
      setErrorChats(null);
      try {
        // Get current user profile
        const userProfile = await getUserProfile();
        console.log('Fetched user profile:', userProfile);
        
        // Get friends list
        const friendsList = await getFriends();
        console.log('Fetched friends list:', friendsList);
        
        // Get joined groups
        const groupsResponse = await getGroups();
        const joinedGroups = groupsResponse.groups.filter(group => 
          group.members?.some(member => 
            typeof member === 'object' ? member._id === user?._id : member === user?._id
          )
        );
        
        // Format friends as chats
        const friendChats = friendsList.map(friend => ({
          id: friend._id,
          name: friend.fullName,
          avatar: friend.profilePic,
          lastMessage: "Start chatting...",
          time: "",
          isOnline: false,
          unread: 0,
          type: 'private'
        }));

        // Format groups as chats
        const groupChats = joinedGroups.map(group => ({
          id: group._id,
          name: group.name,
          avatar: group.avatar || group.image,
          lastMessage: "Group chat",
          time: "",
          isOnline: false,
          unread: 0,
          type: 'group',
          description: group.description
        }));
        
        // Combine both lists
        setChats([...friendChats, ...groupChats]);
      } catch (err) {
        console.error("Failed to load chats:", err);
        setErrorChats("Failed to load chats");
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // Check if we have a selectedFriend from navigation
  useEffect(() => {
    if (location.state?.selectedFriend) {
      setSelectedChat(location.state.selectedFriend);
      // Clear the location state to avoid persisting the selection
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Update a chat in the list with a new message
  const updateChatWithNewMessage = (message) => {
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      
      // Find the chat that this message belongs to
      const chatIndex = updatedChats.findIndex(chat => 
        chat.id === message.sender || chat.id === message.receiver
      );
      
      if (chatIndex !== -1) {
        // Update the last message for this chat
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: message.content,
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // Increment unread count if this is not the selected chat
          unread: selectedChat && selectedChat.id === updatedChats[chatIndex].id 
            ? 0 
            : updatedChats[chatIndex].unread + 1
        };
        
        // Move this chat to the top of the list
        const updatedChat = updatedChats.splice(chatIndex, 1)[0];
        updatedChats.unshift(updatedChat);
      }
      
      return updatedChats;
    });
  };

  const handleChatSelect = async (chat) => {
    console.log("Selected chat:", chat);
    
    // Reset unread count when selecting a chat
    setChats(prevChats => 
      prevChats.map(c => 
        c.id === chat.id ? { ...c, unread: 0 } : c
      )
    );
    
    // If it's a group chat, navigate to the group chat page
    if (chat.type === 'group') {
      navigate(`/groups/${chat.id}`);
      return;
    }
    
    setSelectedChat(chat);
  };

  const handleSendMessage = (chatId, messageObj) => {
    // Only update the chat list if a message object is provided (from Chatbox after successful send)
    if (messageObj && messageObj.content) {
      updateChatWithNewMessage(messageObj);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);

    switch (page) {
      case "home":
        navigate("/");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "groups":
        navigate("/groups");
        break;
      case "friends":
        navigate("/friends");
        break;
      default:
        navigate("/");
    }
  };

  if (loadingChats) return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900">
      <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  );
  
  if (errorChats) return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900">
      <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
        {errorChats}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300 h-screen w-screen overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 shadow-md z-10 animate-fade-in"
      >
        <div className="flex justify-between items-center pr-4 pl-4 pt-2 pb-2 ">
          {isMobile ? (
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full mr-2"
            >
              <FaBars className="text-gray-600 dark:text-gray-300" />
            </button>
          ) : null}

          <div className="flex items-center">
            <img
              src="https://img.icons8.com/?size=100&id=hCvhdugyicF1&format=png&color=000000"
              width={"50px"}
              height={"10px"}
              alt="logo"
            ></img>

            <h1 className="text-2xl font-bold ml-2 text-black dark:text-gray-50 font-englebert">
              Convo
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-full  transition-all duration-300 shadow-md hover:shadow-lg"
            style={{
              backgroundColor: darkMode ? "#0f172a" : "#f0f9ff",
              width: "48px",
              height: "48px",
              transform: darkMode ? "rotate(180deg)" : "rotate(0deg)",
              transition: "background-color 0.5s, transform 0.5s",
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: darkMode ? 0 : 1,
                transition: "opacity 0.5s",
                transform: darkMode ? "scale(0.5)" : "scale(1)",
              }}
            >
              <div className="relative">
                <FaMoon style={{ color: "#334155", fontSize: "20px" }} />
                <div
                  className="absolute top-0 right-0 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: "#94a3b8",
                    transform: "translate(25%, -25%)",
                  }}
                />
              </div>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: darkMode ? 1 : 0,
                transition: "opacity 0.5s",
                transform: darkMode ? "scale(1)" : "scale(0.5)",
              }}
            >
              <div className="relative">
                <FaSun style={{ color: "#fbbf24", fontSize: "22px" }} />
                <div
                  className="absolute top-0 left-0 w-1 h-1 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "#fef3c7",
                    boxShadow: "0 0 8px 2px rgba(251, 191, 36, 0.6)",
                  }}
                />
              </div>
            </div>

            <div
              className="absolute inset-0 bg-gradient-to-br"
              style={{
                opacity: 0.1,
                background: darkMode
                  ? "radial-gradient(circle at 70% 70%, #60a5fa, transparent 50%)"
                  : "radial-gradient(circle at 30% 30%, #fbbf24, transparent 50%)",
              }}
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-md z-10"
          >
            <MobileNavbar
              activePage={activePage}
              setActivePage={handleNavigation}
              user={user}
              onLogout={onLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area with sidebar and chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block md:w-20 flex-shrink-0 bg-indigo-800 rounded-2xl dark:bg-indigo-800 m-1 border-r border-gray-200 dark:border-slate-700"
        >
          <Sidebar
            activePage={activePage}
            setActivePage={handleNavigation}
            user={user}
            onLogout={onLogout}
          />
        </motion.div>

        <div className="flex flex-1">
          {/* Chat List */}
          <AnimatePresence mode="wait">
            {(!selectedChat || !isMobile) && (
              <motion.div
                key="chat-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-96 flex-shrink-0 border-r border-gray-200 dark:border-slate-700 h-full overflow-hidden"
              >
                <ChatList
                  chats={chats}
                  onChatSelect={handleChatSelect}
                  selectedChat={selectedChat}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat or Welcome Screen */}
          <AnimatePresence mode="wait">
            {(selectedChat || !isMobile) && (
              <motion.div
                key={selectedChat ? "chat" : "welcome"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 w-full h-full overflow-hidden"
              >
                {selectedChat ? (
                  <Chatbox
                    chat={selectedChat}
                    onSendMessage={handleSendMessage}
                    user={user}
                    isMobile={isMobile}
                    socketInstance={socketInstance}
                  />
                ) : (
                  <Welcome user={user} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Home;
