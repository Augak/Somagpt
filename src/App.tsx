import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, BookOpen, Brain, Check, ChevronDown, Clock3, FileText, GraduationCap, Languages, Menu, MessageSquare, Moon, MoreHorizontal, NotebookPen, Paperclip, Plus, Search, Settings2, ShieldCheck, Sparkles, Sun, X, LibraryBig, Calculator, Lightbulb, Trash2 } from 'lucide-react';

type Message = { id: string; role: 'user' | 'assistant'; text: string; time: number };
type Conversation = { id: string; title: string; messages: Message[]; updatedAt: number };
const starters = [
  { icon: Brain, title: 'Explain a difficult topic', detail: 'Break it down into simple steps', prompt: 'Explain a difficult topic to me in simple steps.' },
  { icon: FileText, title: 'Solve an exam question', detail: 'Work through it with explanations', prompt: 'Help me solve an exam question step by step.' },
  { icon: BookOpen, title: 'Make revision notes', detail: 'Turn a topic into clear study notes', prompt: 'Create concise revision notes for a topic I am studying.' },
  { icon: Lightbulb, title: 'Test my knowledge', detail: 'Practise with questions and feedback', prompt: 'Quiz me on a topic and mark my answers.' }
];
const tools = [
  { icon: FileText, label: 'Study a paper', prompt: 'I want to upload and work through a past paper.' },
  { icon: NotebookPen, label: 'Summarise notes', prompt: 'Help me summarise my study notes.' },
  { icon: Calculator, label: 'Maths help', prompt: 'Help me understand and solve a Mathematics problem.' },
  { icon: Languages, label: 'Translate', prompt: 'Help me translate a learning topic into a local language.' }
];
const makeId = () => Math.random().toString(36).slice(2, 10);

export default function App() {
  const [chats, setChats] = useState<Conversation[]>(() => { try { return JSON.parse(localStorage.getItem('somagpt-chats') || '[]'); } catch { return []; } });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [toolOpen, setToolOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const active = chats.find(c => c.id === activeId) || null;
  useEffect(() => { localStorage.setItem('somagpt-chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { if (!notice) return; const t = window.setTimeout(() => setNotice(''), 3500); return () => window.clearTimeout(t); }, [notice]);
  const visibleChats = useMemo(() => chats.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.messages.some(m => m.text.toLowerCase().includes(query.toLowerCase()))).sort((a,b) => b.updatedAt-a.updatedAt), [chats,query]);

  function newChat() { setActiveId(null); setDraft(''); setFile(null); setMobileNav(false); }
  function send(value = draft) {
    if (!value.trim() && !file) return;
    const now = Date.now();
    const message: Message = { id: makeId(), role: 'user', text: [value.trim(), file ? 'Attached file: ' + file.name : ''].filter(Boolean).join('\n'), time: now };
    if (active) setChats(prev => prev.map(c => c.id === active.id ? { ...c, messages: [...c.messages,message], updatedAt: now } : c));
    else {
      const chat = { id: makeId(), title: (value.trim() || file?.name || 'New conversation').slice(0,48), messages: [message], updatedAt: now };
      setChats(prev => [chat,...prev]); setActiveId(chat.id);
    }
    setDraft(''); setFile(null); setToolOpen(false); if (fileRef.current) fileRef.current.value = '';
    setNotice('Message saved locally. AI responses will be enabled when the AI service is connected.');
  }
  function prompt(value: string) { setDraft(value); setMobileNav(false); window.setTimeout(() => textRef.current?.focus(), 0); }
  function removeChat(id: string) { setChats(prev => prev.filter(c => c.id !== id)); if (activeId === id) setActiveId(null); }

  return <div className={'app-shell' + (dark ? ' theme-dark' : '')}>
    <aside className={'sidebar' + (mobileNav ? ' sidebar-open' : '') + (collapsed ? ' sidebar-collapsed' : '')}>
      <div className="sidebar-head">
        <button className="brand" onClick={newChat}><span className="brand-symbol"><i/></span><span className="brand-copy"><strong>SomaGPT</strong><small>Learn without limits</small></span></button>
        <button className="icon-btn collapse-btn" onClick={() => setCollapsed(v => !v)} aria-label="Collapse sidebar"><MoreHorizontal size={19}/></button>
        <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={19}/></button>
      </div>
      <button className="new-chat-btn" onClick={newChat}><Plus size={17}/><span>New chat</span></button>
      <button className="side-search" onClick={() => { setSearchOpen(v => !v); setQuery(''); }}><Search size={16}/><span>Search conversations</span></button>
      {searchOpen && <div className="search-field"><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chats..."/><button onClick={() => setSearchOpen(false)}><X size={14}/></button></div>}
      <div className="section-label">YOUR SPACE</div>
      <button className="side-link" onClick={() => prompt('Help me discover learning materials for my subject.')}><LibraryBig size={17}/><span>Discover learning</span></button>
      <button className="side-link" onClick={() => prompt('Help me prepare for my upcoming exams.')}><GraduationCap size={17}/><span>Exam preparation</span></button>
      <button className="side-link" onClick={() => prompt('Help me plan and organise a school project.')}><NotebookPen size={17}/><span>My projects</span></button>
      <div className="history-heading"><span>RECENT CHATS</span><button onClick={() => setSearchOpen(true)}><Search size={14}/></button></div>
      <div className="chat-history">{visibleChats.length ? visibleChats.map(c => <div className={'history-row' + (c.id === activeId ? ' selected' : '')} key={c.id}><button className="history-title" onClick={() => { setActiveId(c.id); setMobileNav(false); }}><MessageSquare size={14}/><span>{c.title}</span></button><button className="delete-chat" onClick={() => removeChat(c.id)} aria-label="Delete conversation"><Trash2 size={13}/></button></div>) : <p className="empty-history">{query ? 'No matching conversations' : 'Your conversations will appear here.'}</p>}</div>
      <div className="sidebar-bottom">
        <div className="plan-card"><span className="plan-icon"><GraduationCap size={18}/></span><span><strong>Free plan</strong><small>Learning starts here</small></span><ChevronDown size={14}/></div>
        <button className="side-link" onClick={() => setSettingsOpen(true)}><Settings2 size={17}/><span>Settings</span></button>
        <div className="profile-row"><span className="profile-avatar">S</span><span><strong>Student</strong><small>Personal workspace</small></span></div>
      </div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="workspace">
      <header className="topbar">
        <div className="top-left"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><span className="model-dot"/><strong>SomaGPT</strong><span className="model-sub">Learning assistant</span><ChevronDown size={14}/></div>
        <div className="top-actions"><span className="secure-label"><ShieldCheck size={14}/> Learning space</span><button className="icon-btn" onClick={() => setDark(v => !v)} aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="share-btn" onClick={() => setNotice('Conversation sharing will be available with account integration.')}>Share</button></div>
      </header>
      <section className={'chat-stage' + (active ? ' has-chat' : '')}>
        {!active ? <div className="welcome">
          <div className="hero-art"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="hero-core"><span/><i/><b/></div><i className="sparkle s1">✦</i><i className="sparkle s2">✧</i><i className="sparkle s3">✦</i></div>
          <div className="eyebrow"><Sparkles size={13}/> YOUR AI LEARNING COMPANION</div>
          <h1>Curiosity starts<br/><em>with a question.</em></h1>
          <p className="welcome-copy">Learn at your pace. Ask anything, understand difficult ideas and make progress with a little help from SomaGPT.</p>
          <div className="starter-grid">{starters.map(({icon:Icon,title,detail,prompt:p}) => <button className="starter-card" key={title} onClick={() => prompt(p)}><span className="starter-icon"><Icon size={18}/></span><span className="starter-text"><strong>{title}</strong><small>{detail}</small></span><ArrowUp className="starter-arrow" size={15}/></button>)}</div>
          <div className="quick-tools"><span>TRY A TOOL</span>{tools.map(({icon:Icon,label,prompt:p}) => <button key={label} onClick={() => prompt(p)}><Icon size={14}/>{label}</button>)}</div>
        </div> : <div className="conversation">{active.messages.map(m => <article className={'message-row ' + m.role} key={m.id}><span className={m.role === 'assistant' ? 'assistant-avatar' : 'user-avatar'}>{m.role === 'assistant' ? 'S' : 'U'}</span><div className="message-content"><div className="message-meta"><strong>{m.role === 'assistant' ? 'SomaGPT' : 'You'}</strong><time>{new Date(m.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time></div><p>{m.text}</p></div></article>)}<div className="backend-note"><Sparkles size={15}/><div><strong>Your message is saved.</strong><span>The AI response service is not connected yet. Your message is stored locally in this browser until backend integration is complete.</span></div></div></div>}
      </section>
      <div className="composer-wrap">
        <div className="composer">
          {file && <div className="file-chip"><FileText size={15}/><span>{file.name}</span><small>{(file.size/1048576).toFixed(1)} MB</small><button onClick={() => setFile(null)} aria-label="Remove attachment"><X size={13}/></button></div>}
          <textarea ref={textRef} rows={1} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey){e.preventDefault();send();}}} placeholder="Message SomaGPT..." aria-label="Message SomaGPT"/>
          <div className="composer-bottom"><div className="composer-left"><input ref={fileRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)}/><button className="composer-action" onClick={() => fileRef.current?.click()}><Plus size={18}/><span>Attach</span></button><div className="tool-wrap"><button className="composer-action" onClick={() => setToolOpen(v => !v)}><Sparkles size={15}/><span>Tools</span><ChevronDown size={12}/></button>{toolOpen && <div className="tool-popover">{tools.map(({icon:Icon,label,prompt:p}) => <button key={label} onClick={() => {prompt(p);setToolOpen(false);}}><Icon size={15}/>{label}</button>)}</div>}</div></div><div className="composer-right"><span>Enter to send · Shift + Enter for new line</span><button className="send-btn" disabled={!draft.trim() && !file} onClick={() => send()} aria-label="Send message"><ArrowUp size={19}/></button></div></div>
        </div>
        <p className="disclaimer">SomaGPT can make mistakes. Verify important information with your teacher and official learning materials.</p>
      </div>
      <footer className="workspace-footer"><span>Made for learners across East Africa</span><span><ShieldCheck size={12}/> Your learning space</span></footer>
    </main>
    {notice && <div className="toast" role="status"><Check size={15}/>{notice}</div>}
    {settingsOpen && <div className="modal-shade" onClick={() => setSettingsOpen(false)}><section className="settings-modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><small>PREFERENCES</small><h2>Settings</h2></div><button className="icon-btn" onClick={() => setSettingsOpen(false)}><X size={18}/></button></div><div className="setting-row"><span><strong>Appearance</strong><small>Choose a comfortable reading theme</small></span><button onClick={() => setDark(v => !v)}>{dark ? 'Dark' : 'Light'} <ChevronDown size={13}/></button></div><div className="setting-row"><span><strong>Language</strong><small>Interface language</small></span><b>English</b></div><div className="setting-row"><span><strong>Conversation storage</strong><small>Saved in this browser</small></span><b>Local</b></div><p className="settings-note"><ShieldCheck size={14}/> Account sync and advanced privacy controls will arrive with backend integration.</p></section></div>}
  </div>;
}
