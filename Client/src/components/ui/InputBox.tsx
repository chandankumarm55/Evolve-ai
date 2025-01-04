import { SendHorizontal } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface InputBoxProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
}

export const InputBox = ({ onSubmit, placeholder = 'Type your message...' }: InputBoxProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-black outline-none transition-colors"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <SendHorizontal size={20} />
      </button>
    </form>
  );
};