import React, { useRef, useEffect, useState } from 'react';
import { X, Eraser, Copy, CornerDownLeft, Loader2, Sparkles, Brain, PenLine, Wand2 } from 'lucide-react';
import { sendChatMessage, ChatMessage } from '../services/chatService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const parseInlineStyles = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return <span key={i} className="text-white font-semibold mx-0.5">{content}</span>;
      }
      return part;
  });
};

const renderFormattedMessage = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    const key = `line-${index}`;
    const trimmed = line.trim();
    
    if (!trimmed) {
       elements.push(<div key={key} className="h-2" />);
       return;
    }

    if (line.startsWith('# ')) {
        elements.push(
            <h1 key={key} className="text-base font-bold text-white/90 mt-5 mb-3 border-b border-white/10 pb-2">
                {line.replace(/^#\s/, '')}
            </h1>
        );
        return;
    }
    
    if (line.startsWith('## ')) {
         elements.push(
            <h2 key={key} className="text-sm font-bold text-white/80 mt-4 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-white/40 rounded-full inline-block" />
                {line.replace(/^##\s/, '')}
            </h2>
        );
        return;
    }

    if (line.startsWith('### ') || line.startsWith('#### ')) {
        const content = line.replace(/^#+\s/, '');
         elements.push(
            <h3 key={key} className="text-xs font-bold text-white/60 mt-3 mb-1 uppercase tracking-wider">
                {content}
            </h3>
        );
        return;
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.replace(/^[\*\-]\s/, '');
        elements.push(
            <div key={key} className="flex gap-2 ml-1 mb-1.5 items-start group/list">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 mt-[7px] shrink-0 group-hover/list:bg-white/60 transition-colors" />
                <div className="text-[13px] leading-relaxed text-white/70 flex-1">
                    {parseInlineStyles(content)}
                </div>
            </div>
        );
        return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
        const [num, ...rest] = trimmed.split(/\.\s/);
        const content = rest.join('. ');
        elements.push(
            <div key={key} className="flex gap-2 ml-1 mb-1.5 items-start">
                <span className="text-xs font-mono text-white/50 mt-[2px] shrink-0">{num}.</span>
                <div className="text-[13px] leading-relaxed text-white/70 flex-1">
                    {parseInlineStyles(content)}
                </div>
            </div>
        );
        return;
    }

    if (trimmed.startsWith('> ')) {
        const content = trimmed.replace(/^>\s/, '');
        elements.push(
            <div key={key} className="pl-3 border-l-2 border-white/20 italic text-white/50 my-2 text-xs">
                {parseInlineStyles(content)}
            </div>
        );
        return;
    }

    elements.push(
        <div key={key} className="text-[13px] leading-relaxed text-white/70 mb-1">
            {parseInlineStyles(line)}
        </div>
    );
  });
  
  return <div className="space-y-0.5 select-text cursor-text">{elements}</div>;
};

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: '你好！我是您的创意助手。今天想创作些什么？' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isStoryboardActive, setIsStoryboardActive] = useState(false);
  const [isHelpMeWriteActive, setIsHelpMeWriteActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput(''); 
    const newMessages: Message[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
        // 转换消息格式为 ChatMessage[]
        const chatMessages: ChatMessage[] = messages.map(m => ({ 
            role: m.role === 'user' ? 'user' : 'assistant', 
            content: m.text 
        }));
        // 添加当前用户消息
        chatMessages.push({ role: 'user', content: userText });
        
        const responseText = await sendChatMessage(chatMessages, { 
            isThinkingMode, 
            isStoryboard: isStoryboardActive,
            isHelpMeWrite: isHelpMeWriteActive 
        });
        setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error: any) {
        setMessages(prev => [...prev, { role: 'assistant', text: error.message || "连接错误，请稍后重试。" }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', text: '你好！我是您的创意助手。今天想创作些什么？' }]);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => console.error("Copy failed", err));
  };

  return (
    <div 
      ref={panelRef}
      className={`fixed right-6 top-1/2 -translate-y-1/2 h-[85vh] w-[420px] bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl z-40 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95 pointer-events-none'}`}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-1">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
          >
            <X size={14} className="text-white/60" />
          </button>
          <button 
            onClick={handleClearChat} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-all active:scale-95 group"
            title="清空对话"
          >
            <Eraser size={14} className="text-white/60 group-hover:text-red-400" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-white/90">AI 创意助手</span>
            <span className="text-[10px] text-white/40">提示词优化 & 灵感生成</span>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
             <Sparkles size={16} className="text-white/70" />
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-black/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[92%] gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 px-1">
                    {m.role === 'assistant' && <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">SunStudio AI</span>}
                    {m.role === 'user' && <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">You</span>}
                </div>
                <div className="group relative transition-all w-full">
                    <div 
                        className={`
                            relative px-5 py-4 rounded-3xl shadow-sm border select-text cursor-text
                            ${m.role === 'user' 
                                ? 'bg-white/10 border-white/10 text-white/90 rounded-tr-lg' 
                                : 'bg-white/5 border-white/5 text-white/80 rounded-tl-lg w-full pr-10'
                            }
                        `}
                    >
                        {m.role === 'assistant' ? renderFormattedMessage(m.text) : <p className="leading-6 text-[13px] whitespace-pre-wrap">{m.text}</p>}
                        <button 
                            onClick={() => handleCopy(m.text, i)}
                            className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 opacity-0 group-hover:opacity-100 transition-all hover:text-white active:scale-95`}
                            title="复制内容"
                        >
                            {copiedIndex === i ? <span className="text-[9px] font-bold text-green-400">OK</span> : <Copy size={11} />}
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ))}

        {isLoading && (
            <div className="flex justify-start w-full">
                <div className="flex flex-col gap-2 max-w-[85%]">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1 ${isThinkingMode ? 'text-white/60' : 'text-white/40'}`}>
                        {isThinkingMode ? 'Deep Thinking' : 'Thinking'}
                    </span>
                    <div className={`px-5 py-4 bg-white/5 border border-white/10 rounded-3xl rounded-tl-lg flex items-center gap-3 w-fit`}>
                        <Loader2 size={16} className="animate-spin text-white/60" />
                        <span className="text-xs font-medium text-white/50">
                            {isThinkingMode ? "深度思考中..." : isStoryboardActive ? "正在规划分镜..." : isHelpMeWriteActive ? "正在润色文本..." : "正在思考创意..."}
                        </span>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#1c1c1e] border-t border-white/5 shrink-0 flex flex-col gap-3">
        {/* Tool Bar */}
        <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => { setIsThinkingMode(!isThinkingMode); setIsStoryboardActive(false); setIsHelpMeWriteActive(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${isThinkingMode ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/40 border-transparent hover:text-white/60'}`}
                 >
                    <Brain size={12} className={isThinkingMode ? "animate-pulse" : ""} />
                    <span>深度思考</span>
                 </button>

                 <button 
                    onClick={() => { setIsStoryboardActive(!isStoryboardActive); setIsThinkingMode(false); setIsHelpMeWriteActive(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${isStoryboardActive ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/40 border-transparent hover:text-white/60'}`}
                 >
                    <PenLine size={12} />
                    <span>分镜脚本</span>
                 </button>

                 <button 
                    onClick={() => { setIsHelpMeWriteActive(!isHelpMeWriteActive); setIsThinkingMode(false); setIsStoryboardActive(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${isHelpMeWriteActive ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/40 border-transparent hover:text-white/60'}`}
                 >
                    <Wand2 size={12} />
                    <span>帮我写</span>
                 </button>
             </div>
        </div>

        <div className="relative">
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-14 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all resize-none custom-scrollbar leading-5" 
            placeholder={
                isStoryboardActive ? "输入视频描述，我将为您生成专业分镜脚本..." :
                isThinkingMode ? "输入复杂问题，进行深度逻辑推理..." : 
                isHelpMeWriteActive ? "输入简短想法，我将帮您扩写和润色..." :
                "输入您的想法，让 AI 为您完善..."
            }
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            }}
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${input.trim() && !isLoading ? 'bg-white text-black hover:bg-white/90 shadow-lg' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CornerDownLeft size={16} />}
          </button>
        </div>
        <div className="text-[9px] text-white/30 text-center font-medium">
            Shift + Enter 换行
        </div>
      </div>
    </div>
  );
};
