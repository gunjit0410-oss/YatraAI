import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Trash2, ArrowRight } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Best places in Rajasthan for 3 days?',
  'Budget trip to Kerala under ₹12,000?',
  'Top hidden gems in Himachal Pradesh?',
  'Best spiritual temples near Varanasi?',
];

// Custom Markdown & Link Formatting Parser for Bot Messages
const FormattedChatMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="flex flex-col gap-1.5 leading-relaxed text-xs">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={lIdx} className="h-1" />;

        // Check if line is a bullet item
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('* ') || line.trim().startsWith('- ');
        const cleanLine = isBullet ? line.trim().replace(/^[•*-]\s*/, '') : line;

        // Parse bold **text** and markdown links [Label](/url)
        const parts = cleanLine.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

        const renderedContent = parts.map((part, pIdx) => {
          // Bold formatting
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-extrabold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          // Markdown link formatting [Label](/path)
          if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
              const label = match[1];
              const url = match[2];
              return (
                <a
                  key={pIdx}
                  href={`#${url}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = url;
                  }}
                  className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 transition-all mx-1 my-0.5 text-[11px]"
                >
                  <span>{label}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </a>
              );
            }
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1">
              <span className="text-amber-500 font-black text-sm leading-none">•</span>
              <div className="flex-1">{renderedContent}</div>
            </div>
          );
        }

        return <div key={lIdx}>{renderedContent}</div>;
      })}
    </div>
  );
};

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: "Namaste! 🙏 I am **Yatra AI Travel Assistant**.\n\nAsk me anything about Indian destinations, budget planning, or hidden gems!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMsgs: ChatMessage[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat/', { message: query });
      if (res.data && res.data.reply) {
        setMessages([...newMsgs, { sender: 'bot', text: res.data.reply }]);
      } else {
        setMessages([
          ...newMsgs,
          { sender: 'bot', text: 'I am here to help you plan your ideal trip across Incredible India!' },
        ]);
      }
    } catch {
      setMessages([
        ...newMsgs,
        {
          sender: 'bot',
          text: 'India offers incredible destinations! Ask me about specific states, budgets, or travel durations.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "Namaste! 🙏 I am **Yatra AI Travel Assistant**.\n\nAsk me anything about Indian destinations, budget planning, or hidden gems!",
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-md glass-panel bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[540px]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 flex items-center justify-between text-white font-black">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black leading-tight">YatraAI Travel Assistant</h3>
                <span className="text-[10px] font-bold opacity-90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Gemini 3.6 Flash Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 text-xs text-left bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/20">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-white font-bold rounded-br-xs shadow-sm text-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.sender === 'bot' ? (
                    <FormattedChatMessage text={m.text} />
                  ) : (
                    <div>{m.text}</div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start items-center text-slate-500 text-xs font-semibold py-2">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                Thinking & querying travel dataset...
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                className="text-[10px] font-bold bg-white text-amber-800 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask YatraAI travel questions..."
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
