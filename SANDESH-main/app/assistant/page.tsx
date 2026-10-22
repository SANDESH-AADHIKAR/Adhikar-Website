'use client';
import { useState } from 'react';
import { Language, type ChatMessage } from '@/lib/types';
import LanguageSelector from '@/components/LanguageSelector';
import { ChatIcon, GovtBuildingIcon } from '@/components/Icons';

const QUICK_PROMPTS = [
  'I am a small farmer in Maharashtra, what subsidies can I apply for?',
  'Scholarships available for girl students from low-income families',
  'How to check eligibility for Ayushman Bharat cashless healthcare card?',
  'What are the interest rates and criteria for a PM Mudra business loan?',
  'Eligibility requirements for rural house construction subsidy under PMAY',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [loading, setLoading] = useState(false);

  async function handleSend(promptText?: string) {
    const textToSend = promptText ?? input;
    if (!textToSend.trim() || loading) return;

    const next = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(next);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const history = next.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest',
          message: textToSend,
          language,
          history,
        }),
      });

      const data = await res.json();
      const reply = data.text ?? 'No response received from assistant.';
      setMessages([...next, { role: 'model', text: reply }]);

      // Persist to local activity history
      const key = 'history_guest';
      const prev = JSON.parse(localStorage.getItem(key) ?? '[]');
      prev.push({
        timestamp: new Date().toISOString(),
        type: 'CITIZEN ASSISTANT',
        message: textToSend,
        response: reply,
      });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {
      setMessages([
        ...next,
        {
          role: 'model',
          text: 'Unable to reach the assistant service. Please check your connection or environment settings.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    if (confirm('Clear current conversation?')) {
      setMessages([]);
    }
  }

  return (
    <div className="chat-page-container">
      <div className="chat-header-bar">
        <div>
          <span className="badge badge-neutral">Information Support</span>
          <h1>Citizen Assistant</h1>
          <p className="page-subtitle">
            Ask questions regarding scheme eligibility, required documentation, and application procedures.
          </p>
        </div>

        <div className="chat-header-controls">
          <LanguageSelector value={language} onChange={setLanguage} />
          {messages.length > 0 && (
            <button
              type="button"
              className="text-btn"
              onClick={clearChat}
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>

      <div className="chat-window">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <ChatIcon size={32} />
            </div>
            <h3>How can we assist you with government schemes?</h3>
            <p className="muted-text">
              Select a sample question below or type your inquiry in your preferred language:
            </p>
            <div className="quick-prompt-chips">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message-bubble ${m.role === 'user' ? 'user' : 'model'}`}
              >
                <div className="message-author">
                  {m.role === 'user' ? 'Citizen' : 'Adhikar Assistant'}
                </div>
                <div className="message-text">{m.text}</div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="message-bubble model loading-bubble">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span style={{ marginLeft: 8 }}>Reviewing eligibility criteria and scheme rules…</span>
          </div>
        )}

        <div className="chat-input-toolbar">
          <input
            type="text"
            className="chat-text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a question in ${language}...`}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-primary chat-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>

      <div className="privacy-notice">
        <strong>Privacy Notice:</strong> Adhikar Assistant will never ask for personal banking PINs, OTPs, or passwords.
      </div>
    </div>
  );
}
