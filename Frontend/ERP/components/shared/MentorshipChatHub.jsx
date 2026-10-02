/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../context/ErpContext';
import { useNotification } from '../../../Shared/context/NotificationContext';
import { getAvatarUrl } from '../../utils/avatarUtils';

export default function MentorshipChatHub({ receiverId, receiverName, receiverRole, receiverAvatar, variant = "default" }) {
 const { userSession } = useERP();
 const { addFlag } = useNotification();
 const [unreadCount, setUnreadCount] = useState(0);
 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState('');
 const [isSending, setIsSending] = useState(false);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 const handleOpen = () => setIsOpen(true);
 window.addEventListener('openMentorshipChat', handleOpen);
 return () => window.removeEventListener('openMentorshipChat', handleOpen);
 }, []);

 // Clear unreads when opened
 useEffect(() => {
 if (isOpen) {
 setUnreadCount(0);
 setTimeout(scrollToBottom, 100);
 }
 }, [isOpen]);

 // Mark as read logic
 useEffect(() => {
 if (isOpen && messages.length > 0) {
 const unreadMsgIds = messages.filter(m => m.receiver_id === userSession?.db_id && !m.read_at).map(m => m.id);
 if (unreadMsgIds.length > 0) {
 supabase.from('mentorship_messages').update({ read_at: new Date().toISOString() }).in('id', unreadMsgIds).then(({error}) => {
 if(!error) {
 setMessages(prev => prev.map(m => unreadMsgIds.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m));
 }
 });
 }
 }
 }, [isOpen, messages, userSession?.db_id]);


 // Independent Realtime Listener (Always On)
 useEffect(() => {
 if (!userSession?.db_id || !receiverId) return;

 const fetchMessages = async () => {
 const { data } = await supabase
 .from('mentorship_messages')
 .select('*')
 .or(`and(sender_id.eq.${userSession.db_id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userSession.db_id})`)
 .order('created_at', { ascending: true });
 
 if (data) {
 setMessages(data);
 setTimeout(scrollToBottom, 100);
 }
 };

 fetchMessages();

 const channel = supabase.channel(`chat_${userSession.db_id}_${receiverId}_${Date.now()}`)
 .on('postgres_changes', { 
 event: 'INSERT', 
 schema: 'public', 
 table: 'mentorship_messages',
 filter: `receiver_id=eq.${userSession.db_id}` // Only listen for incoming to me
 }, payload => {
 if (payload.new.sender_id === receiverId) {
 setMessages(prev => {
 const updated = [...prev, payload.new];
 // If chat is closed, trigger a hero reveal push notification!
 setIsOpen(currOpen => {
 if (!currOpen) {
 setUnreadCount(c => c + 1);
 addFlag({
 title: `New Message from ${receiverName || 'Mentorship'}`,
 description: payload.new.content.length > 40 ? payload.new.content.substring(0, 40) + '...' : payload.new.content,
 type: 'info',
 duration: 8000
 });
 }
 return currOpen; // Do not mutate isOpen
 });
 return updated;
 });
 setTimeout(scrollToBottom, 100);
 }
 })
 .subscribe();

 return () => { supabase.removeChannel(channel); };
 }, [userSession?.db_id, receiverId, addFlag, receiverName]);

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
 className={`${variant === "banner" ? "px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center gap-2 hover:bg-amber-500/20 transition-colors z-40 relative" : "fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 rounded-full bg-amber-500 text-themeText shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"} ${isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100 scale-100'}`}
 >
 <i className={`fa-solid fa-message ${variant === "banner" ? "text-sm" : "text-2xl"}`}></i>{variant === "banner" && <span>Message Student</span>}
 {unreadCount > 0 && (
 <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-[#121212] flex items-center justify-center text-[10px] font-black text-themeApp animate-bounce">
 {unreadCount}
 </div>
 )}
 </button>

 {/* Chat Window — full-screen on mobile, floating card on desktop */}
 <div className={`fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 lg:bottom-8 lg:right-8 w-full sm:w-[380px] h-full sm:h-[600px] sm:max-h-[80vh] bg-themeApp sm:bg-themeApp/95 dark:bg-themePanel sm:dark:bg-themePanel/95 sm:backdrop-blur-3xl sm:saturate-[1.8] sm:border sm:border-themeBorder rounded-none sm:rounded-[2rem] sm:shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full sm:translate-y-20 opacity-0 sm:scale-95 pointer-events-none'}`}>
 
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-themeBorder bg-black/[0.02] dark:bg-themePanel/[0.02]">
 <div className="flex items-center gap-3">
 {receiverAvatar ? (
 <img src={receiverAvatar} alt={receiverName} className="w-10 h-10 rounded-full object-cover border border-themeBorder " />
 ) : (
 <div className="w-10 h-10 rounded-full bg-themeElevated flex items-center justify-center text-themeTextSec /60">
 <i className="fa-solid fa-user"></i>
 </div>
 )}
 <div>
 <h4 className="text-[15px] font-bold tracking-tight text-themeText leading-tight">{receiverName || 'Loading...'}</h4>
 <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest">{receiverRole || 'Mentorship'}</span>
 </div>
 </div>
 <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-themeElevated hover:bg-black/10 flex items-center justify-center transition-colors text-themeTextSec">
 <i className="fa-solid fa-chevron-down text-sm"></i>
 </button>
 </div>

 {/* Messages Area */}
 <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar bg-black/[0.01] dark:bg-themePanel/[0.01]">
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
 <div className="w-6 h-6 rounded-full bg-themeElevated flex items-center justify-center overflow-hidden">
 {receiverAvatar ? <img src={getAvatarUrl(receiverAvatar)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.parentElement.innerHTML = '<i class="fa-solid fa-user text-[8px] opacity-50"></i>'; }} /> : <i className="fa-solid fa-user text-[8px] opacity-50"></i>}
 </div>
 )}
 </div>
 )}

 <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm flex flex-col ${
 isMe 
 ? 'bg-amber-500 text-themeText rounded-br-sm' 
 : 'bg-themePanel dark:bg-themeElevated border border-themeBorder text-themeText rounded-bl-sm'
 }`}>
 <span>{msg.content}</span>
 <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-themeText/70' : 'text-themeTextSec'}`}>
 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 {isMe && (
 <i className={`fa-solid fa-check-double ${msg.read_at ? 'text-blue-500' : 'opacity-50'}`}></i>
 )}
 </div>
 </div>
 </div>
 </div>
 );
 })
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input Area */}
 <form onSubmit={handleSend} className="p-4 border-t border-themeBorder bg-themePanel/50 dark:bg-themePanel/50 backdrop-blur-md">
 <div className="flex items-center gap-2 bg-themeElevated rounded-[1.25rem] p-1.5 border border-themeBorder ">
 <input 
 type="text" 
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="iMessage..."
 className="flex-1 bg-transparent px-4 py-2 text-[14px] font-medium focus:outline-none text-themeText placeholder:text-themeTextSec/50"
 />
 <button 
 aria-label="Action button" type="submit" 
 disabled={!input.trim() || isSending}
 className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
 input.trim() ? 'bg-amber-500 text-themeText shadow-md' : 'bg-transparent text-themeTextSec/50'
 }`}
 ><i className="fa-solid fa-arrow-up text-sm"></i></button>
 </div>
 </form>

 </div>
 </>
 );
}
