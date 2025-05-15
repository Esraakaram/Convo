import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";

const ChatList = ({ chats, onChatSelect, selectedChat }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full bg-white dark:bg-slate-800 transition-colors duration-300"
    >
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-3 border-b border-gray-200 dark:border-slate-700"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:text-white shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden border-1 shadow-lg rounded-4xl m-3">
        <AnimatePresence>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 ${
                  selectedChat?.id === chat.id
                    ? "bg-gray-100 dark:bg-slate-700"
                    : ""
                }`}
                onClick={() => onChatSelect(chat)}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex-shrink-0"
                >
                  <img
                    src={chat.avatar || "/placeholder.svg"}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                  />
                  {chat.isOnline && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"
                    />
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="ml-3 flex-1 min-w-0"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 flex-shrink-0">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p
                      className={`text-sm truncate ${
                        chat.isTyping
                          ? "text-green-500"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {chat.isTyping ? "Typing..." : chat.lastMessage}
                    </p>
                    {chat.type === 'group' && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">
                        جروب
                      </span>
                    )}
                    {chat.unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full ml-1 flex-shrink-0"
                      >
                        {chat.unread}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <p className="text-gray-500 dark:text-gray-400">No chats found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatList;
