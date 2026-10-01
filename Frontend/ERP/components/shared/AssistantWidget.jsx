/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../context/ErpContext';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, ArtificialIntelligence01Icon, Chatting01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import HoldButton from '../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { getLocalAvatar } from '../../utils/avatarUtils';

// Subcomponent: Chat Inbox Item
function ChatInboxItem({ conversation, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(conversation)}
      className="p-3 border-b border-themeBorder hover:bg-themeElevated cursor-pointer transition-colors flex items-center gap-3 relative"
    >
      <div className="w-10 h-10 rounded-full bg-themePanel overflow-hidden shrink-0 border border-themeBorder">
        <img 
          src={conversation.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name)}&background=random`} 
          alt={conversation.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-bold text-themeText truncate">{conversation.name}</h4>
          <span className="text-[10px] font-medium text-themeTextSec">{new Date(conversation.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <p className={`text-xs truncate ${conversation.unread > 0 ? 'text-themeText font-bold' : 'text-themeTextSec'}`}>
          {conversation.last_message}
        </p>
      </div>
      {conversation.unread > 0 && (
        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white absolute right-3 top-1/2 -translate-y-1/2 shadow-lg shadow-red-500/30">
          {conversation.unread}
        </div>
      )}
    </div>
  );
}

// Subcomponent: Active Chat View
function ActiveChatView({ conversation, onBack, userSession }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel(`chat_${conversation.userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'erp_chat_messages',
        filter: `sender_id=eq.${conversation.userId}` 
      }, payload => {
        if (payload.new.receiver_id === userSession.db_id) {
          setMessages(prev => [...prev, payload.new]);
          markAsRead(payload.new.id);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [conversation.userId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('erp_chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userSession.db_id},receiver_id.eq.${conversation.userId}),and(sender_id.eq.${conversation.userId},receiver_id.eq.${userSession.db_id})`)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      
      // Mark unread as read
      const unreads = data.filter(m => m.receiver_id === userSession.db_id && !m.read_status);
      if (unreads.length > 0) {
        unreads.forEach(m => markAsRead(m.id));
      }
    }
  };

  const markAsRead = async (msgId) => {
    await supabase.from('erp_chat_messages').update({ read_status: true }).eq('id', msgId);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const msg = input.trim();
    setInput('');
    setIsSending(true);

    const tempId = Date.now().toString();
    const newMessage = { id: tempId, sender_id: userSession.db_id, receiver_id: conversation.userId, message: msg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    await supabase.from('erp_chat_messages').insert([{
      sender_id: userSession.db_id,
      receiver_id: conversation.userId,
      message: msg
    }]);
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-full bg-themePanel">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 border-b border-themeBorder bg-themeElevated/50 backdrop-blur-xl shrink-0">
        <button type="button" onClick={onBack} className="w-8 h-8 rounded-full hover:bg-themePanel flex items-center justify-center text-themeText transition">
          <i className="fa-solid fa-arrow-left text-xs"></i>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-themePanel border border-themeBorder shrink-0">
          <img src={conversation.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name)}&background=random&color=fff`} alt="User" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-themeText leading-none mb-1">{conversation.name}</h4>
          <span className="text-[9px] font-bold text-themeAccent uppercase tracking-widest">{conversation.role}</span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-black/[0.02] dark:bg-transparent">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userSession.db_id;
          return (
            <div key={msg.id} className={`max-w-[85%] px-4 py-2 text-[13px] leading-relaxed shadow-sm flex flex-col gap-1 ${
              isMe 
                ? 'bg-themeAccent text-white self-end rounded-2xl rounded-tr-sm ml-auto'
                : 'bg-themeElevated border border-themeBorder text-themeText self-start rounded-2xl rounded-tl-sm'
            }`}>
              <div>{msg.message}</div>
              <div className="flex justify-end items-center gap-1.5 opacity-80">
                <span className="text-[9px]">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                {isMe && (
                  <i className={`fa-solid ${msg.read_status ? 'fa-check-double text-blue-300' : 'fa-check'} text-[10px]`}></i>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-themeElevated/50 border-t border-themeBorder flex items-center gap-2 shrink-0">
        <button type="button" onClick={() => { if(window.erpToast) window.erpToast.show("Image attachments require Supabase Storage setup.", "warning"); }} className="w-10 h-10 rounded-full hover:bg-themePanel flex items-center justify-center text-themeTextSec transition">
          <i className="fa-solid fa-paperclip"></i>
        </button>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-themePanel border border-themeBorder rounded-full px-4 py-2 text-sm text-themeText outline-none focus:border-themeAccent transition"
        />
        <button type="submit" disabled={!input.trim() || isSending} className="w-10 h-10 rounded-full bg-themeAccent text-white flex items-center justify-center disabled:opacity-50">
          <i className="fa-solid fa-paper-plane text-xs translate-x-[-1px] translate-y-[1px]"></i>
        </button>
      </form>
    </div>
  );
}

// Subcomponent: New Chat Picker
function NewChatPicker({ onSelect, onBack, userSession }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const myRole = userSession?.role;
      // Determine which roles this user can message
      let allowedRoles = ['faculty', 'admin'];
      if (myRole === 'faculty' || myRole === 'admin') allowedRoles = ['student', 'faculty', 'admin'];
      
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, profile_picture_url')
        .in('role', allowedRoles)
        .neq('id', userSession.db_id)
        .order('full_name', { ascending: true });
      setContacts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = contacts.filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-themeBorder bg-themeElevated/50 shrink-0">
        <button type="button" onClick={onBack} className="w-8 h-8 rounded-full hover:bg-themePanel flex items-center justify-center text-themeText transition">
          <i className="fa-solid fa-arrow-left text-xs"></i>
        </button>
        <input 
          type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." autoFocus
          className="flex-1 bg-themePanel border border-themeBorder rounded-full px-3 py-1.5 text-xs text-themeText outline-none focus:border-themeAccent transition"
        />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-32"><i className="fa-solid fa-circle-notch fa-spin text-themeTextSec"></i></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-themeTextSec p-6">No contacts found</p>
        ) : (
          filtered.map(c => (
            <div key={c.id} onClick={() => onSelect({ userId: c.id, name: c.full_name, role: c.role, avatar: c.profile_picture_url })} className="p-3 flex items-center gap-3 hover:bg-themeElevated cursor-pointer transition border-b border-themeBorder/50">
              <div className="w-9 h-9 rounded-full bg-themePanel overflow-hidden border border-themeBorder shrink-0">
                <img src={c.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=random&color=fff&background=random`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-themeText truncate">{c.full_name}</h4>
                <span className="text-[9px] font-bold text-themeAccent uppercase tracking-widest">{c.role}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AssistantWidget() {
  const { userSession } = useERP();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assistant'); // 'assistant' or 'chat'
  
  // Chat States
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [showNewChat, setShowNewChat] = useState(false);

  // Assistant States
  const [botMessages, setBotMessages] = useState([
    { id: 'welcome', sender: 'bot', text: 'Hello! I am your Intelligent ERP Assistant. How can I help optimize your workflow today?' }
  ]);
  const [botInput, setBotInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const botEndRef = useRef(null);

  // Refs for current view state to avoid reconnecting realtime channels on UI interactions
  const viewStateRef = useRef({ isOpen, activeTab, activeConversationUserId: activeConversation?.userId });
  useEffect(() => {
    viewStateRef.current = { isOpen, activeTab, activeConversationUserId: activeConversation?.userId };
  }, [isOpen, activeTab, activeConversation]);

  // 1. Listen for global events to open specific chat or inbox
  useEffect(() => {
    const handleOpenGlobalChat = (e) => {
      const { userId, name, role, avatar, openInbox } = e.detail || {};
      setIsOpen(true);
      setActiveTab('chat');
      if (openInbox) {
        setActiveConversation(null); // show inbox list
      } else if (userId) {
        setActiveConversation({ userId, name, role, avatar });
      }
    };
    window.addEventListener('openGlobalChat', handleOpenGlobalChat);
    return () => window.removeEventListener('openGlobalChat', handleOpenGlobalChat);
  }, []);

  // 2. Fetch Inbox Conversations
  const loadInbox = async () => {
    if (!userSession?.db_id) return;
    const { data, error } = await supabase
      .from('erp_chat_messages')
      .select(`
        id, sender_id, receiver_id, message, read_status, created_at,
        sender:profiles!erp_chat_messages_sender_id_fkey(full_name, role, profile_picture_url),
        receiver:profiles!erp_chat_messages_receiver_id_fkey(full_name, role, profile_picture_url)
      `)
      .or(`sender_id.eq.${userSession.db_id},receiver_id.eq.${userSession.db_id}`)
      .order('created_at', { ascending: false });
      
    if (data && !error) {
      // Group by user
      const convoMap = new Map();
      let unreadTotal = 0;

      data.forEach(msg => {
        const isMeSender = msg.sender_id === userSession.db_id;
        const otherId = isMeSender ? msg.receiver_id : msg.sender_id;
        const otherProfile = isMeSender ? msg.receiver : msg.sender;
        
        if (!convoMap.has(otherId)) {
          convoMap.set(otherId, {
            userId: otherId,
            name: otherProfile?.full_name || 'Unknown',
            role: otherProfile?.role,
            avatar: otherProfile?.profile_picture_url,
            last_message: msg.message,
            last_message_at: msg.created_at,
            unread: 0
          });
        }
        
        if (!isMeSender && !msg.read_status) {
          convoMap.get(otherId).unread += 1;
          unreadTotal++;
        }
      });
      
      setConversations(Array.from(convoMap.values()));
      setGlobalUnreadCount(unreadTotal);
    }
  };

  useEffect(() => {
    if (!userSession?.db_id) return;
    
    loadInbox();

    // Global realtime listener for unread count updates
    const channel = supabase.channel(`global_inbox_${userSession.db_id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'erp_chat_messages',
        filter: `receiver_id=eq.${userSession.db_id}` 
      }, async (payload) => {
        loadInbox(); // Reload inbox on new message
        
        // Notify user if they are NOT actively reading this chat
        const currentView = viewStateRef.current;
        const isReadingChat = currentView.isOpen && currentView.activeTab === 'chat' && currentView.activeConversationUserId === payload.new.sender_id;
        
        if (!isReadingChat && window.erpToast) {
           try {
               const { data } = await supabase.from('profiles').select('full_name').eq('id', payload.new.sender_id).single();
               const senderName = data?.full_name || 'Someone';
               window.erpToast.show(`New message from ${senderName}`, "info");
           } catch (e) {
               window.erpToast.show(`New message received`, "info");
           }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userSession?.db_id]); 

  // Re-run loadInbox when closing chat to refresh unreads
  useEffect(() => {
    if (!isOpen) {
      loadInbox();
    }
  }, [isOpen]);

  // Bot Logic
  const handleBotSend = (e) => {
    e.preventDefault();
    if (!botInput.trim()) return;
    const msg = botInput.trim();
    setBotInput('');
    setBotMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: msg }]);
    setIsTyping(true);
    setTimeout(() => botEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    setTimeout(() => {
      let botReply = "I couldn't process that command natively. Please check the Helpdesk.";
      const lowMsg = msg.toLowerCase();
      if (lowMsg.includes('hi') || lowMsg.includes('hello')) botReply = "Hello there! How can I help?";
      else if (lowMsg.includes('clear')) { setBotMessages([]); setIsTyping(false); return; }
      
      setBotMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botReply }]);
      setIsTyping(false);
      setTimeout(() => botEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 1000);
  };

  return (
    <div className="fixed bottom-[110px] lg:bottom-6 right-4 lg:right-6 z-[200] flex flex-col items-end">
      {!isOpen ? (
        <button type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-themePanel/85 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-themeBorder flex items-center justify-center text-themeAccent hover:scale-110 transition-all duration-300 cursor-pointer relative"
        >
          <HugeiconsIcon icon={ArtificialIntelligence01Icon} size={28} />
          {globalUnreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-themePanel shadow-lg">{globalUnreadCount}</span>
          ) : (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-themePanel rounded-full animate-pulse"></span>
          )}
        </button>
      ) : (
        <div className="w-[calc(100vw-2rem)] max-w-sm h-[550px] max-h-[80vh] bg-themePanel shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-themeBorder rounded-3xl flex flex-col overflow-hidden animate-[fadeIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
          
          {/* Header & Tabs */}
          <div className="bg-themeElevated/80 border-b border-themeBorder shrink-0 flex flex-col">
            <div className="flex justify-between items-center p-4 pb-2">
              <h3 className="font-black text-themeText text-sm tracking-normal">ERP Communications</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-themePanel/50 flex items-center justify-center text-themeText transition">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            {/* Tabs */}
            <div className="flex p-2 gap-2">
              <button 
                onClick={() => { setActiveTab('assistant'); setActiveConversation(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab === 'assistant' ? 'bg-themePanel text-themeAccent shadow-sm' : 'text-themeTextSec hover:bg-themePanel/50'}`}
              >
                <HugeiconsIcon icon={ArtificialIntelligence01Icon} size={16} /> Bot
              </button>
              <button 
                onClick={() => { setActiveTab('chat'); setActiveConversation(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 relative ${activeTab === 'chat' ? 'bg-themePanel text-themeAccent shadow-sm' : 'text-themeTextSec hover:bg-themePanel/50'}`}
              >
                <HugeiconsIcon icon={Chatting01Icon} size={16} /> Inbox
                {globalUnreadCount > 0 && <span className="absolute top-1.5 right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* --- ASSISTANT TAB --- */}
            {activeTab === 'assistant' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-black/[0.01] dark:bg-transparent">
                  {botMessages.map(msg => (
                    <div key={msg.id} className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-themeAccent to-[#0056b3] text-white self-end rounded-2xl rounded-tr-sm ml-auto'
                        : 'bg-themeElevated border border-themeBorder text-themeText self-start rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-themeElevated border border-themeBorder self-start rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-themeAccent/70 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-themeAccent/70 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-themeAccent/70 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                  <div ref={botEndRef} className="h-1" />
                </div>
                {/* Bot Input */}
                <form onSubmit={handleBotSend} className="p-3 bg-themeElevated/50 border-t border-themeBorder flex gap-2 shrink-0">
                  <input type="text" value={botInput} onChange={e => setBotInput(e.target.value)} placeholder="Ask ERP Assistant..." className="flex-1 bg-themePanel border border-themeBorder rounded-full px-4 py-2 text-sm text-themeText outline-none focus:border-themeAccent transition" />
                  <button type="submit" disabled={!botInput.trim() || isTyping} className="w-10 h-10 rounded-full bg-themeAccent text-white flex items-center justify-center disabled:opacity-50"><i className="fa-solid fa-paper-plane text-xs"></i></button>
                </form>
              </div>
            )}

            {/* --- CHAT HUB TAB --- */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full bg-themeApp">
                {showNewChat ? (
                  <NewChatPicker 
                    userSession={userSession} 
                    onBack={() => setShowNewChat(false)} 
                    onSelect={(convo) => { setShowNewChat(false); setActiveConversation(convo); }} 
                  />
                ) : !activeConversation ? (
                  // Inbox List
                  <div className="flex-1 overflow-y-auto no-scrollbar relative">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-themeTextSec p-6 text-center gap-3">
                        <HugeiconsIcon icon={Chatting01Icon} size={48} className="opacity-20" />
                        <p className="text-xs">No conversations yet.</p>
                        <button onClick={() => setShowNewChat(true)} className="mt-2 px-4 py-2 rounded-xl bg-themeAccent text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                          Start a Conversation
                        </button>
                      </div>
                    ) : (
                      <>
                        {conversations.map(convo => (
                          <ChatInboxItem key={convo.userId} conversation={convo} onSelect={setActiveConversation} />
                        ))}
                      </>
                    )}
                    {/* Floating + button */}
                    <button 
                      onClick={() => setShowNewChat(true)} 
                      className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-themeAccent text-white shadow-xl shadow-themeAccent/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                    >
                      <i className="fa-solid fa-plus text-sm"></i>
                    </button>
                  </div>
                ) : (
                  // Active Chat View
                  <ActiveChatView conversation={activeConversation} onBack={() => setActiveConversation(null)} userSession={userSession} />
                )}
              </div>
            )}

          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
