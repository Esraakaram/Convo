import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Chatbox from "../components/Chatbox";
import axiosInstance from "../lib/axios";
import Sidebar from "../components/sidebar";
import { motion } from "framer-motion";

const GroupChatPage = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/groups/${groupId}`);
        setGroup(res.data.group);
      } catch (err) {
        setError("تعذر تحميل بيانات المجموعة");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

 

  if (loading) return <div className="flex items-center justify-center h-screen">جاري تحميل المجموعة...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  if (!group) return <div className="flex items-center justify-center h-screen text-red-500">المجموعة غير موجودة</div>;

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 shadow-md z-10"
      >
        <div className="flex justify-between items-center pr-4 pl-4 pt-2 pb-2">
          <div className="flex items-center">
            <img
              src="https://img.icons8.com/?size=100&id=hCvhdugyicF1&format=png&color=000000"
              width={"50px"}
              height={"10px"}
              alt="logo"
            />
            <h1 className="text-2xl font-bold ml-2 text-black dark:text-gray-50 font-englebert">
              Convo
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{group.name}</span>
            <button
              onClick={toggleDarkMode}
              className="relative p-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
              style={{
                backgroundColor: darkMode ? "#0f172a" : "#f0f9ff",
                width: "48px",
                height: "48px",
                transform: darkMode ? "rotate(180deg)" : "rotate(0deg)",
                transition: "background-color 0.5s, transform 0.5s",
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center">
                <img
                  src={group.avatar || group.image || "https://placehold.co/40x40"}
                  alt={group.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>
      <div className="flex flex-1">
        {/* Sidebar - fixed under header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block w-20 flex-shrink-0 bg-indigo-800 rounded-2xl dark:bg-indigo-800 m-1 border-r border-gray-200 dark:border-slate-700 h-full"
          style={{ height: 'calc(100vh - 72px)' }}
        >
          <Sidebar user={user} onLogout={onLogout} activePage="groups" darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </motion.div>
        <div className="flex-1 flex flex-col">
          {/* لا داعي لهيدر المجموعة هنا لأنه في الأعلى */}
          <div className="flex-1">
            <Chatbox groupId={groupId} group={group} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatPage; 