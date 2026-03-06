import React, { useState, useEffect, useRef } from 'react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

const IntelligentAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Xin chào! Tôi là Greenie 🌿, trợ lý thông minh của Vườn Nhà Mình. Tôi có thể giúp gì cho bạn hôm nay?',
            sender: 'assistant',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (text: string = inputValue) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const { chatWithAI } = await import('../services/ai.service');
            const data = await chatWithAI(text);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Xin lỗi, tôi đang mất kết nối một chút. Bạn thử lại sau nhé! 🌿',
                sender: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const quickActions = [
        { label: '🌤️ Thời tiết', value: 'Thời tiết hôm nay thế nào?' },
        { label: '🍏 Sản phẩm', value: 'Vườn có những sản phẩm gì?' },
        { label: '📍 Liên hệ', value: 'Địa chỉ vườn ở đâu?' },
    ];

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-6 z-[100]">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#13ec49] to-[#0ba33c] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                    >
                        <div className="absolute inset-0 animate-ping rounded-full bg-[#13ec49]/40 opacity-75"></div>
                        <span className="material-symbols-outlined text-3xl font-light">smart_toy</span>

                        {/* Tooltip */}
                        <div className="absolute right-full mr-4 hidden scale-0 items-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#111813] shadow-xl transition-all duration-200 group-hover:flex group-hover:scale-100">
                            <span className="h-2 w-2 rounded-full bg-[#13ec49]"></span>
                            Chat với Greenie
                        </div>
                    </button>
                )}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-[101] flex h-[520px] w-full max-w-[350px] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-10 duration-500 sm:w-[350px]">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-[#13ec49] to-[#0ba33c] p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-md">
                                <span className="material-symbols-outlined text-xl">agriculture</span>
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#13ec49]"></span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold tracking-tight">Greenie Assistant</h3>
                                <p className="text-[9px] font-medium opacity-80 uppercase tracking-widest">Đang trực tuyến</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200">
                        <div className="flex flex-col gap-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    <div
                                        className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${msg.sender === 'user'
                                            ? 'bg-[#13ec49] text-white rounded-tr-none'
                                            : 'bg-[#f0f4f1] text-[#111813] rounded-tl-none border border-gray-100'
                                            }`}
                                    >
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <span className={`mt-1 block text-[8px] opacity-60 ${msg.sender === 'user' ? 'text-white' : 'text-gray-500'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#f0f4f1] border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="h-1 w-1 animate-bounce rounded-full bg-gray-400"></div>
                                            <div className="h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></div>
                                            <div className="h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-1.5 overflow-x-auto p-3 pt-0 no-scrollbar">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(action.value)}
                                className="whitespace-nowrap rounded-full border border-[#13ec49]/30 bg-white px-2.5 py-1 text-[10px] font-bold text-[#13ec49] transition-all hover:bg-[#13ec49] hover:text-white"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 rounded-b-3xl">
                        <div className="flex items-center gap-2 rounded-xl bg-[#f6f8f6] p-1.5 focus-within:ring-2 focus-within:ring-[#13ec49]/20 transition-all">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-1 bg-transparent px-2 text-xs outline-none placeholder:text-gray-400"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim()}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#13ec49] text-white shadow-lg shadow-[#13ec49]/20 transition-all hover:bg-[#0ba33c] active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default IntelligentAssistant;
