import { motion } from 'framer-motion';

export default function MessageBubble({ msg, currentUserId }) {
  const isSender = msg.from === currentUserId;
  return (
    <motion.div
      initial={{ opacity: 0.3, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow
        ${isSender
          ? 'ml-auto bg-blue-500 text-white dark:bg-blue-600'
          : 'mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}
      `}
    >
      {msg.text}
      <div className="text-[10px] mt-1 text-right opacity-70">
        {msg.time?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </motion.div>
  );
}
