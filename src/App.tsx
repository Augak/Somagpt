import { useRef, useState } from 'react';
import { BookOpen, BrainCircuit, GraduationCap, History, House, Languages, Menu, Paperclip, Plus, Search, Send, Settings, Sparkles, X, FileText, School, FolderKanban } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; text: string };
const navigation = [
  { name: 'Home', icon: House },
  { name: 'AI Tutor', icon: BrainCircuit },
  { name: 'Content Discovery', icon: Search },
  { name: 'Exam Preparation', icon: FileText },
  { name: 'Project Workspace', icon: FolderKanban },
  { name: 'School Discovery', icon: School },
  { name: 'Languages', icon: Languages },
];
const suggestions = [
  'Explain photosynthesis in simple steps',
  'Create 10 S.2 Mathematics revision questions',
  'Help me understand quadratic equations',
  'Summarise this topic into revision notes',
];

export default function App() {
  const [active, setActive] = useState('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function sendMessage(value = draft) {
    if (!value.trim() && !attachment) return;
    const text = (attachment ? `Attached file: ${attachment.name}. ` : '') + value.trim();
    setMessages((current) => [
      ...current,
      { role: 'user', text },
      { role: 'assistant', text: 'The learning interface is ready. The secure AI service, document extraction and curriculum retrieval are not connected yet, so this build will not pretend to generate an academic answer. Those services are the next engineering phase.' },
    ]);
    setDraft('');
    setAttachment(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><strong>SomaGPT</strong><small>Learn without limits</small></div>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={19}/></button>
        </div>
        <button className="new-chat" onClick={() => { setMessages([]); setActive('Home'); setMenuOpen(false); }}><Plus size={17}/> New conversation</button>
        <div className="nav-label">LEARNING</div>
        {navigation.map(({ name, icon: Icon }) => (
          <button key={name} className={`nav-item ${active === name ? 'active' : ''}`} onClick={() => { setActive(name); setMenuOpen(false); }}>
            <Icon size={18}/><span>{name}</span>
          </button>
        ))}
        <div className="nav-label space-label">YOUR SPACE</div>
        <button className="nav-item" onClick={() => setActive('Recent activity')}><History size={18}/><span>Recent activity</span></button>
        <div className="sidebar-bottom">
          <div className="plan-summary"><div className="plan-icon"><GraduationCap size={19}/></div><div><strong>Free learning plan</strong><small>Explore SomaGPT</small></div></div>
          <button className="nav-item"><Settings size={18}/><span>Settings</span></button>
        </div>
      </aside>
      {menuOpen && <button className="scrim" aria-label="Close navigation overlay" onClick={() => setMenuOpen(false)} />}
      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20}/></button>
          <div className="breadcrumb">SomaGPT <span>/</span> {active}</div>
          <div className="topbar-right"><span className="language-choice"><Languages size={15}/> English</span><div className="avatar" aria-label="User profile">K</div></div>
        </header>
        <section className="main-content">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL STUDY COMPANION</div>
              <h1>{active === 'Home' ? 'What are we learning today?' : active}</h1>
              <p className="intro">Ask questions, explore your subjects, or upload an exam paper to work through it step by step.</p>
              <div className="feature-grid">
                <button className="feature-card" onClick={() => setActive('AI Tutor')}><BrainCircuit size={20}/><strong>AI Tutor</strong><span>Get clear explanations at your learning level.</span></button>
                <button className="feature-card" onClick={() => setActive('Exam Preparation')}><FileText size={20}/><strong>Exam Preparation</strong><span>Practise, revise and work through papers.</span></button>
                <button className="feature-card" onClick={() => setActive('Content Discovery')}><BookOpen size={20}/><strong>Discover content</strong><span>Find useful notes by subject and topic.</span></button>
                <button className="feature-card" onClick={() => setActive('School Discovery')}><School size={20}/><strong>School Discovery</strong><span>Explore pathways and institutions.</span></button>
              </div>
              <div className="suggestions"><div className="suggestion-heading">TRY ASKING</div>{suggestions.map((item) => <button key={item} onClick={() => sendMessage(item)}>{item}<span>↗</span></button>)}</div>
            </div>
          ) : (
            <div className="conversation" aria-live="polite">
              {messages.map((message, index) => <div className={`message ${message.role}`} key={index}><div className="message-author">{message.role === 'user' ? 'You' : 'SomaGPT'}</div><div className="message-body">{message.text}</div></div>)}
            </div>
          )}
        </section>
        <div className="composer-area">
          <div className="composer">
            {attachment && <div className="attachment-chip"><FileText size={14}/>{attachment.name}<button onClick={() => setAttachment(null)} aria-label="Remove attachment"><X size={13}/></button></div>}
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Ask SomaGPT anything about your studies..." rows={2} aria-label="Message SomaGPT"/>
            <div className="composer-actions">
              <button className="attach-button" onClick={() => fileInput.current?.click()}><Paperclip size={17}/> Attach exam or notes</button>
              <input ref={fileInput} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}/>
              <button className="send-button" onClick={() => sendMessage()} disabled={!draft.trim() && !attachment} aria-label="Send message"><Send size={17}/></button>
            </div>
          </div>
          <p className="disclaimer">Check important answers against your class notes and official learning materials.</p>
        </div>
      </main>
    </div>
  );
}