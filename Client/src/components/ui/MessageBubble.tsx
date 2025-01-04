import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: string;
  isBot?: boolean;
  timestamp?: string;
}

export const MessageBubble = ({ message, isBot = false, timestamp }: MessageBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isBot ? 'bg-black text-white' : 'bg-white border-2 border-black'
      }`}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className={`max-w-[80%] ${isBot ? 'bg-gray-100' : 'bg-black text-white'} rounded-2xl px-4 py-3`}>
        <p className="text-sm">{message}</p>
        {timestamp && (
          <span className={`text-xs ${isBot ? 'text-gray-500' : 'text-gray-300'} mt-1 block`}>
            {timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
};