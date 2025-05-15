"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// UI Components
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Icons
import { 
  Search, Send, Paperclip, Smile, X, Mic, 
  CheckCheck, Check, MoreVertical 
} from "lucide-react";

// Other dependencies
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

// Socket and API
import { getSocket, sendDirectMessage } from "../lib/socket";
import { getConversationMessages, sendMessage } from "../api";

const Chatbox = ({ chat, onSendMessage, user, isMobile }) => {
  // State for messages
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Input states
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  
  // Refs
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const notificationSound = useRef(typeof Audio !== 'undefined' ? new Audio("/notification.mp3") : null);
  
  // Socket connection and message handling
  useEffect(() => {
    let isMounted = true;
    let socket;
    async function setupSocket() {
      socket = await getSocket();
      socketRef.current = socket;
      if (!socket) return;
      // Always clear previous listeners
      socket.off("receive-message");
      socket.off("message-read");
      // Join personal room
      socket.emit("join");
      // Listen for new messages
      socket.on("receive-message", (msg) => {
        if (!isMounted) return;
        // Only add if for this chat
        if (
          (msg.sender === chat.id && msg.receiver === user.id) ||
          (msg.sender === user.id && msg.receiver === chat.id)
        ) {
          setMessages((prev) => {
            // Deduplicate by _id
            if (prev.some((m) => m._id === msg._id)) return prev;
            // Replace temp message if optimistic
            if (msg.sender === user.id) {
              const tempIdx = prev.findIndex(
                (m) => m._id.startsWith("temp-") && m.content === msg.content && m.sender === msg.sender
              );
              if (tempIdx !== -1) {
                const newArr = [...prev];
                newArr[tempIdx] = msg;
                return newArr;
              }
            }
            return [...prev, msg];
          });
          // Play sound if from other user
          if (msg.sender === chat.id && notificationSound.current) {
            notificationSound.current.play().catch(() => {});
          }
        }
      });
      // Listen for read receipts
      socket.on("message-read", (messageId) => {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, read: true } : m)));
      });
    }
    setupSocket();
    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.off("receive-message");
        socketRef.current.off("message-read");
      }
    };
  }, [chat.id, user.id]);
  
  // Fetch initial messages
  useEffect(() => {
    let isMounted = true;
    async function fetchMessages() {
      setLoading(true);
      setError(null);
      try {
        if (chat && chat.id) {
          const data = await getConversationMessages(chat.id);
          if (!isMounted) return;
          setMessages(data.messages || []);
          // Mark unread as read
          if (socketRef.current && data.messages?.length) {
            data.messages.filter((m) => m.sender === chat.id && !m.read).forEach((m) => {
              socketRef.current.emit("mark-as-read", { messageId: m._id });
            });
          }
        }
      } catch (e) {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [chat.id]);
  
  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = messages.filter((m) => m.content?.toLowerCase().includes(searchQuery.toLowerCase()));
      setSearchResults(results);
      if (results.length > 0) {
        setHighlightedMessage(results[0]);
        const el = document.getElementById(`message-${results[0]._id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setSearchResults([]);
      setHighlightedMessage(null);
    }
  }, [searchQuery, messages]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const content = input.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      sender: user.id,
      receiver: chat.id,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    try {
      let sentMsg = null;
      if (socketRef.current) {
        sentMsg = await sendDirectMessage(chat.id, content);
      } else {
        sentMsg = await sendMessage(chat.id, content);
      }
      // sentMsg may be wrapped in .data depending on API
      const messageObj = sentMsg?.data || sentMsg;
      if (onSendMessage && messageObj) onSendMessage(chat.id, messageObj);
    } catch (e) {
      setError("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  }, [input, user.id, chat.id, onSendMessage]);
  
  // Emoji picker handler
  const handleEmojiClick = (emojiData) => {
    setInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  // File input handler
  const handleFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would handle file upload
      console.log("File selected:", file);
    }
  };
  
  // Helper functions for formatting dates and times
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  // Group messages by date for better UI organization
  const groupMessagesByDate = () => {
    const groups = {};
    messages
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .forEach((message) => {
        const date = new Date(message.createdAt).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
      });
    return groups;
  };
  
  // Check if a message is from the current user
  const isCurrentUser = (senderId) => {
    return user && (user.id === senderId || user._id === senderId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-gray-50 dark:bg-slate-900">
        <div className="p-5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg max-w-md">
          <p className="font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Render message groups
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center p-6 bg-gray-50 dark:bg-slate-700/30 rounded-lg max-w-md">
            <p className="text-gray-600 dark:text-gray-300 mb-2">No messages yet</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Send a message to start the conversation</p>
          </div>
        </div>
      );
    }
    
    const messageGroups = groupMessagesByDate();
    
    return Object.entries(messageGroups).map(([date, msgs]) => (
      <div key={date} className="mb-6">
        <div className="flex justify-center mb-4">
          <Badge variant="outline" className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
            {date}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {msgs.map((message) => {
            const fromCurrentUser = isCurrentUser(message.sender);
            const isHighlighted = highlightedMessage && highlightedMessage._id === message._id;
            
            return (
              <div 
                id={`message-${message._id}`}
                key={message._id} 
                className={cn(
                  "flex items-end space-x-2",
                  fromCurrentUser ? "justify-end" : "justify-start",
                  isHighlighted && "bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg"
                )}
              >
                {!fromCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {chat.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn("max-w-[70%]", !fromCurrentUser && "ml-2")}>
                  <div 
                    className={cn(
                      "px-4 py-2 rounded-t-lg",
                      fromCurrentUser 
                        ? "bg-indigo-600 text-white rounded-bl-lg rounded-br-none" 
                        : "bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white rounded-br-lg rounded-bl-none"
                    )}
                  >
                    {message.content}
                  </div>
                  
                  <div className={cn("flex items-center mt-1 text-xs text-gray-500", fromCurrentUser ? "justify-end" : "justify-start")}>
                    <span>{formatTime(message.createdAt)}</span>
                    {fromCurrentUser && (
                      <span className="ml-2">
                        {message.read ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-white dark:bg-slate-800 transition-colors duration-300 overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700"
      >
        <div className="flex items-center">
          <div className="relative flex-shrink-0">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xl font-bold">
                  {chat.name?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {chat.isOnline && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"
              />
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="ml-3 min-w-0"
          >
            <Label className="font-medium text-gray-900 dark:text-white truncate">
              {chat.name}
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chat.isOnline ? "Online" : "Last seen recently"}
            </p>
          </motion.div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-gray-600 dark:text-gray-300"
                >
                  {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showSearch ? "Close search" : "Search messages"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 dark:text-gray-300"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>More options</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-gray-200 dark:border-slate-700"
          >
            <div className="p-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search in conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="p-2 bg-gray-50 dark:bg-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Found {searchResults.length} results
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-auto scroll-smooth"
      >
        <div className="p-4">
          {renderMessages()}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="resize-none min-h-[40px] max-h-[120px] py-2 px-3 pr-20 bg-gray-100 dark:bg-slate-700 border-0 focus:ring-1 focus:ring-indigo-600"
            />
            
            <div className="absolute bottom-1 right-2 flex items-center gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500"
                      onClick={handleFileInput}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-500"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add emoji</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbox;