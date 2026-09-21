import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../context/ErpContext';

export default function MentorshipChatHub({ receiverId, receiverName, receiverRole, receiverAvatar }) {
    const { userSession } = useERP();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isOpen || !userSession?.db_id || !receiverId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('mentorship_messages')
                .select('*')
                .or(`and(sender_id.eq.${userSession.db_id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userSession.db_id})`)
                .order('created_at', { ascending: true });
            
            if (data) setMessages(data);
            setTimeout(scrollToBottom, 100);
        };

        fetchMessages();

        const channel = supabase.channel(`chat_${userSession.db_id}_${receiverId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'mentorship_messages',
                filter: `receiver_id=eq.${userSession.db_id}` // Only listen for incoming to me
            }, payload => {
                if (payload.new.sender_id === receiverId) {
                    setMessages(prev => [...prev, payload.new]);
                    setTimeout(scrollToBottom, 100);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isOpen, userSession?.db_id, receiverId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isSending || !userSession?.db_id || !receiverId) return;

        setIsSending(true);
        const newMsg = {
            sender_id: userSession.db_id,
            receiver_id: receiverId,
            content: input.trim()
        };

        // Optimistic update
        setMessages(prev => [...prev, { ...newMsg, id: 'temp-' + Date.now(), created_at: new Date().toISOString() }]);
        setInput('');
        setTimeout(scrollToBottom, 100);

        const { error } = await supabase.from('mentorship_messages').insert([newMsg]);
        if (error) {
            console.error("Chat error:", error);
            window.erpDialog?.alert("Chat failed. Please ensure the mentorship_messages table is created.");
        }
        setIsSending(false);
    };

    if (!receiverId) return null;

    return (
        <>
            {/* FAB */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 rounded-full bg-amber-500 text-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 ${isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100 scale-100'}`}
            >
                <i className="fa-solid fa-message text-2xl"></i>
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-themeApp hidden"></div>
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-4 right-4 lg:bottom-8 lg:right-8 w-[calc(100vw-32px)] sm:w-[380px] h-[600px] max-h-[80vh] bg-themeApp/95 dark:bg-[#121212]/95 backdrop-blur-3xl saturate-[1.8] border border-black/10 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        {receiverAvatar ? (
                            <img src={receiverAvatar} alt={receiverName} className="w-10 h-10 rounded-full object-cover border border-black/5 dark:border-white/5" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-themeTextSec dark:text-white/60">
                                <i className="fa-solid fa-user"></i>
                            </div>
                        )}
                        <div>
                            <h4 className="text-[15px] font-bold tracking-tight text-themeText dark:text-white leading-tight">{receiverName || 'Loading...'}</h4>
                            <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest">{receiverRole || 'Mentorship'}</span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-themeTextSec">
                        <i className="fa-solid fa-chevron-down text-sm"></i>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar bg-black/[0.01] dark:bg-white/[0.01]">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <i className="fa-regular fa-comments text-4xl mb-3"></i>
                            <p className="text-sm font-semibold tracking-tight text-themeTextSec">Send a message to start the conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === userSession.db_id;
                            const showAvatar = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id);
                            
                            return (
                                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`flex max-w-[80%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        
                                        {/* Avatar space for receiver */}
                                        {!isMe && (
                                            <div className="w-6 shrink-0 flex items-end pb-1">
                                                {showAvatar && (
                                                    <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                                        {receiverAvatar ? <img src={receiverAvatar} alt="" className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-[8px] opacity-50"></i>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                                            isMe 
                                            ? 'bg-amber-500 text-black rounded-br-sm' 
                                            : 'bg-white dark:bg-themeElevated border border-black/5 dark:border-white/5 text-themeText dark:text-white rounded-bl-sm'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-themePanel/50 backdrop-blur-md">
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-[1.25rem] p-1.5 border border-black/5 dark:border-white/5">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="iMessage..."
                            className="flex-1 bg-transparent px-4 py-2 text-[14px] font-medium focus:outline-none text-themeText dark:text-white placeholder:text-themeTextSec/50"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isSending}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                input.trim() ? 'bg-amber-500 text-black shadow-md' : 'bg-transparent text-themeTextSec/50'
                            }`}
                        >
                            <i className="fa-solid fa-arrow-up text-sm"></i>
                        </button>
                    </div>
                </form>

            </div>
        </>
    );
}
