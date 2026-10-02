const fs = require('fs');

const path = 'Frontend/ERP/components/shared/MentorshipChatHub.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add getAvatarUrl import
if (!content.includes('getAvatarUrl')) {
    content = content.replace("import { useNotification }", "import { useNotification } from '../../../Shared/context/NotificationContext';\nimport { getAvatarUrl } from '../../utils/avatarUtils';");
}

// 2. Mark messages as read function
const markReadCode = `
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
`;

// Insert after unreadCount clear logic
content = content.replace("setTimeout(scrollToBottom, 100);\n }\n }, [isOpen]);", "setTimeout(scrollToBottom, 100);\n }\n }, [isOpen]);\n" + markReadCode);

// 3. Fix avatar loading
content = content.replace(
    '{receiverAvatar ? <img src={receiverAvatar} alt="" className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-[8px] opacity-50"></i>}',
    '{receiverAvatar ? <img src={getAvatarUrl(receiverAvatar)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.parentElement.innerHTML = \'<i class="fa-solid fa-user text-[8px] opacity-50"></i>\'; }} /> : <i className="fa-solid fa-user text-[8px] opacity-50"></i>}'
);

// 4. Render blue ticks
const originalMessageDiv = `
 <div className={\`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm \${
 isMe 
 ? 'bg-amber-500 text-themeText rounded-br-sm' 
 : 'bg-themePanel dark:bg-themeElevated border border-themeBorder text-themeText rounded-bl-sm'
 }\`}>
 {msg.content}
 </div>
`;

const newMessageDiv = `
 <div className={\`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm flex flex-col \${
 isMe 
 ? 'bg-amber-500 text-themeText rounded-br-sm' 
 : 'bg-themePanel dark:bg-themeElevated border border-themeBorder text-themeText rounded-bl-sm'
 }\`}>
 <span>{msg.content}</span>
 <div className={\`text-[10px] flex items-center justify-end gap-1 mt-1 \${isMe ? 'text-themeText/70' : 'text-themeTextSec'}\`}>
 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 {isMe && (
 <i className={\`fa-solid fa-check-double \${msg.read_at ? 'text-blue-500' : 'opacity-50'}\`}></i>
 )}
 </div>
 </div>
`;

content = content.replace(originalMessageDiv, newMessageDiv);

fs.writeFileSync(path, content);
console.log('Patched MentorshipChatHub.jsx');
