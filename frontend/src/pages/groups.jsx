import { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { getGroups, joinGroup, leaveGroup, createGroup, searchUsers, addMember, deleteGroup as deleteGroupApi } from '../api';
import MobileNavbar from "../components/mobile-navbar";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Groups = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("groups");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [errorGroups, setErrorGroups] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    image: "https://placehold.co/80x80",
  });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [groupError, setGroupError] = useState(null);
  const [deletingGroupId, setDeletingGroupId] = useState(null);

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, []);

  const handleJoinLeave = async (id, joined) => {
    try {
      setGroupError(null);
      if (joined) {
        await leaveGroup(id);
      } else {
        const res = await joinGroup(id);
        // بعد نجاح الانضمام، أضف الجروب إلى localStorage
        if (res && res.group) {
          const joinedGroups = JSON.parse(localStorage.getItem('joinedGroups') || '[]');
          if (!joinedGroups.some(g => g._id === res.group._id)) {
            joinedGroups.push(res.group);
            localStorage.setItem('joinedGroups', JSON.stringify(joinedGroups));
          }
        }
      }
      await fetchGroups();
    } catch (err) {
      console.error("Error updating group membership:", err);
      setGroupError(err.response?.data?.message || "فشل في تحديث عضوية المجموعة");
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    setLoadingGroups(true);
    setErrorGroups(null);
    try {
      const response = await getGroups();
      // تأكد من أن البيانات مصفوفة
      const groupsData = Array.isArray(response.groups) ? response.groups : [];
      
      // تحديث حالة الانضمام لكل مجموعة
      const updatedGroups = groupsData.map(group => ({
        ...group,
        joined: group.members?.some(member => 
          typeof member === 'object' ? member._id === user?._id : member === user?._id
        ) || false
      }));
      
      setChannels(updatedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setErrorGroups("فشل في تحميل المجموعات");
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleChannelClick = (id) => {
    navigate(`/groups/${id}`);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);

    switch (page) {
      case "home":
        navigate("/home");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "groups":
        navigate("/");
        break;
      default:
        navigate("/");
    }
  };

  const handleAddChannel = async () => {
    if (!newChannel.name.trim()) {
      setGroupError("يرجى إدخال اسم المجموعة");
      return;
    }
    try {
      setGroupError(null);
      await createGroup({
        name: newChannel.name,
        description: newChannel.description,
        avatar: newChannel.image
      });
      
      setNewChannel({
        name: "",
        description: "",
        image: "https://placehold.co/80x80",
      });
      setShowForm(false);
      await fetchGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      setGroupError(err.response?.data?.message || "فشل في إنشاء المجموعة");
    }
  };

  const handleAddMember = (groupId) => {
    setSelectedGroupId(groupId);
    setShowAddMemberModal(true);
    setGroupError(null);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching users:", err);
      setGroupError("فشل في البحث عن المستخدمين");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddUserToGroup = async (userId) => {
    try {
      setGroupError(null);
      await addMember(selectedGroupId, userId);
      setShowAddMemberModal(false);
      setSearchQuery("");
      setSearchResults([]);
      await fetchGroups();
    } catch (err) {
      console.error("Error adding member:", err);
      setGroupError(err.response?.data?.message || "فشل في إضافة العضو");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذه المجموعة؟")) return;
    setDeletingGroupId(groupId);
    try {
      await deleteGroupApi(groupId);
      await fetchGroups();
    } catch (err) {
      setGroupError(err.response?.data?.message || "فشل في حذف المجموعة");
    } finally {
      setDeletingGroupId(null);
    }
  };

  if (loadingGroups) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl text-gray-600 dark:text-gray-300">جاري تحميل المجموعات...</div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 shadow-md z-10"
      >
        <div className="flex justify-between items-center  pr-4 pl-4 pt-2 pb-2">
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
            ></MobileNavbar>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}

      <div className="flex flex-1">
        {/* Sidebar - fixed width */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block w-20 flex-shrink-0 bg-indigo-800 rounded-2xl dark:bg-indigo-800 m-1 border-r border-gray-200 dark:border-slate-700 h-full fixed left-0 top-0 bottom-0 z-20"
          style={{ height: '100vh' }}
        >
          <Sidebar
            activePage={activePage}
            setActivePage={handleNavigation}
            user={user}
            onLogout={onLogout}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6 overflow-y-auto ml-0 md:ml-24"
          style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
        >
          {groupError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg flex items-center justify-between"
            >
              <span>{groupError}</span>
              <button
                onClick={() => setGroupError(null)}
                className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex justify-between items-center mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Channels
            </h1>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-indigo-700  hover:bg-indigo-800  text-white font-semibold px-4 py-2 rounded-full shadow"
              >
                <FaPlus /> Create Channel
              </motion.button>
            </div>
          </motion.div>

          {/* Create Channel Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 space-y-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Channel Name"
                  className="w-full p-2 border rounded"
                  value={newChannel.name}
                  onChange={(e) =>
                    setNewChannel({ ...newChannel, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                  value={newChannel.description}
                  onChange={(e) =>
                    setNewChannel({
                      ...newChannel,
                      description: e.target.value,
                    })
                  }
                />
                <button
                  onClick={handleAddChannel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Add Channel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {channels.map((channel) => (
              <motion.div
                key={channel._id || channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg cursor-pointer"
                onClick={() => handleChannelClick(channel._id || channel.id)}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={channel.avatar || channel.image || "https://placehold.co/80x80"}
                    alt={channel.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {channel.name}
                      </h2>
                      {channel.isAdmin && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                          مشرف
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      {channel.description || "لا يوجد وصف"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {channel.members?.length || 0} عضو
                      </span>
                      {channel.joined && (
                        <span className="text-xs text-green-500">• عضو</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {channel.joined && channel.isAdmin && (
                    <>
                      <button
                        onClick={() => handleAddMember(channel._id || channel.id)}
                        className="flex-1 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <FaPlus className="text-xs" /> إضافة عضو
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(channel._id || channel.id)}
                        className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white ${deletingGroupId === (channel._id || channel.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={deletingGroupId === (channel._id || channel.id)}
                      >
                        {deletingGroupId === (channel._id || channel.id) ? 'جارٍ الحذف...' : 'حذف المجموعة'}
                      </button>
                    </>
                  )}
                  {channel.joined ? (
                    <button
                      onClick={() => handleJoinLeave(channel._id || channel.id, true)}
                      className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      مغادرة
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinLeave(channel._id || channel.id, false)}
                      className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      انضمام
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                إضافة عضو جديد
              </h2>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن مستخدم..."
                  className="w-full p-2 pl-10 border rounded-lg dark:bg-slate-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              {searchLoading && (
                <div className="text-center py-4 text-gray-600 dark:text-gray-300">
                  جاري البحث...
                </div>
              )}
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.profilePic || "https://placehold.co/40x40"}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {user.fullName}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddUserToGroup(user._id)}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      إضافة
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Groups;