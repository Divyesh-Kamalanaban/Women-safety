'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
}

interface ChatProps {
    myId: string;
    partnerId: string;
    partnerName?: string;
    onClose?: () => void;
}

export default function Chat({ myId, partnerId, partnerName = "Helper", onClose }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Poll messages
    useEffect(() => {
        let isMounted = true;
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/messages?user1=${myId}&user2=${partnerId}`);
                const data = await res.json();
                if (isMounted && data.messages) {
                    setMessages(data.messages);
                }
            } catch (e) {
                console.error("Chat poll error", e);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [myId, partnerId]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const tempId = Date.now().toString();
        const optimisticMsg = {
            id: tempId,
            senderId: myId,
            content: inputText,
            createdAt: new Date().toISOString()
        };

        // UI Optimism
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText("");

        try {
            await fetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    senderId: myId,
                    receiverId: partnerId,
                    content: optimisticMsg.content
                })
            });
            // Next poll will correct any ID/timestamp diffs
        } catch (e) {
            console.error("Send failed", e);
            // Revert on failure? For now just log
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl border border-neutral-200 flex flex-col z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="p-3 bg-blue-600 text-white rounded-t-xl flex justify-between items-center shadow-sm">
                <div className="font-bold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    {partnerName}
                </div>
                {onClose && (
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
                {messages.length === 0 && (
                    <div className="text-center text-xs text-neutral-400 mt-10">
                        Start the conversation...
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === myId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t rounded-b-xl flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
        </div>
    );
}
