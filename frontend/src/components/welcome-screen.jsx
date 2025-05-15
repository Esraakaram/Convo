import { motion } from "framer-motion";

const Welcome = ({ user }) => {
  const displayName =
    user?.username?.split(" ")[0] || user?.fullName?.split(" ")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center w-full h-full rounded-none bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 shadow-lg p-10 text-center border border-indigo-800/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/10 via-indigo-800/10 to-indigo-800/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent pointer-events-none" />
      
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-7xl font-englebert text-white drop-shadow mb-4 bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent"
      >
        Convo
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-4xl font-semibold text-indigo-200 mb-2"
      >
        Hello, {displayName}! 👋
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-lg text-indigo-300/80 max-w-xl leading-relaxed"
      >
        Welcome to Convo — your private space to talk, chill, and vibe out.
      </motion.p>

      
    </motion.div>
  );
};

export default Welcome;
