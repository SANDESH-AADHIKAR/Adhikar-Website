'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ChatMessage } from '@/lib/types';
import LanguageSelector from '@/components/LanguageSelector';
import { ChatIcon, MicIcon, MicOffIcon, SpeakerIcon, SpeakerMuteIcon } from '@/components/Icons';
import { useLanguage, useTranslation, useAuth } from '@/components/AppContext';
import { translations } from '@/lib/i18n';
import { useVoice } from '@/lib/voice';
import ChatMessageView from '@/components/ChatMessageView';

function AssistantContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const voice = useVoice();
  const hasVoiceAutoTriggered = useRef(false);

  // Synchronize speech transcript into chat input
  useEffect(() => {
    if (voice.transcript) {
      setInput(voice.transcript);
    }
  }, [voice.transcript]);

  // Handle auto voice activation from query params (?voice=auto or ?voice=true)
  useEffect(() => {
    const voiceParam = searchParams.get('voice');
    if ((voiceParam === 'auto' || voiceParam === 'true') && !hasVoiceAutoTriggered.current) {
      hasVoiceAutoTriggered.current = true;
      setAutoSpeak(true);
      // Small timeout to allow user interaction context
      const timer = setTimeout(() => {
        voice.startListening('en-IN');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, voice]);

  // Track speech end to reset speaking index
  useEffect(() => {
    if (!voice.isSpeaking) {
      setSpeakingIdx(null);
    }
  }, [voice.isSpeaking]);

  // Get prompts tailored to selected language
  const langDict = translations[language] || translations['English'];
  const quickPrompts: string[] = langDict?.assistant?.prompts || [
    'I am a small farmer in Maharashtra, what subsidies can I apply for?',
    'Scholarships available for girl students from low-income families',
    'How to check eligibility for Ayushman Bharat cashless healthcare card?',
    'What are the interest rates and criteria for a PM Mudra business loan?',
    'Eligibility requirements for rural house construction subsidy under PMAY',
  ];

  async function handleSend(promptText?: string) {
    const textToSend = promptText ?? input;
    if (!textToSend.trim() || loading) return;

    // If currently listening, stop
    if (voice.isListening) {
      voice.stopListening();
    }

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
          userId: user?.email || 'guest',
          message: textToSend,
          language,
          history,
        }),
      });

      const data = await res.json();
      const reply = data.text ?? t('assistant.errorReply');
      const updatedMessages: ChatMessage[] = [...next, { role: 'model', text: reply }];
      setMessages(updatedMessages);

      // Auto-speak reply in English if auto-speak is enabled
      if (autoSpeak) {
        const replyIndex = updatedMessages.length - 1;
        setSpeakingIdx(replyIndex);
        voice.speak(reply, () => {
          setSpeakingIdx(null);
        });
      }

      // Persist to user activity history
      const historyKey = `history_${user?.email || 'guest'}`;
      const prev = JSON.parse(localStorage.getItem(historyKey) ?? '[]');
      prev.push({
        timestamp: new Date().toISOString(),
        type: 'CITIZEN ASSISTANT',
        message: textToSend,
        response: reply,
      });
      localStorage.setItem(historyKey, JSON.stringify(prev));
    } catch {
      const fallbackReply = t('assistant.errorReply');
      setMessages([
        ...next,
        {
          role: 'model',
          text: fallbackReply,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function toggleVoiceInput() {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.stopSpeaking();
      voice.startListening('en-IN');
    }
  }

  function handleSpeakMessage(text: string, idx: number) {
    if (speakingIdx === idx && voice.isSpeaking) {
      voice.stopSpeaking();
      setSpeakingIdx(null);
    } else {
      setSpeakingIdx(idx);
      voice.speak(text, () => {
        setSpeakingIdx(null);
      });
    }
  }

  function handleStopSpeaking() {
    voice.stopSpeaking();
    setSpeakingIdx(null);
  }

  function clearChat() {
    if (confirm(t('assistant.clearConfirm'))) {
      voice.stopSpeaking();
      voice.stopListening();
      setSpeakingIdx(null);
      setMessages([]);
    }
  }

  return (
    <div className="chat-page-container">
      <div className="chat-header-bar">
        <div>
          <span className="badge badge-neutral">{t('assistant.badge')}</span>
          <h1>{t('assistant.heading')}</h1>
          <p className="page-subtitle">{t('assistant.subtitle')}</p>
        </div>

        <div className="chat-header-controls">
          {/* Language Selector Toggle */}
          <div className="chat-language-toggle">
            <LanguageSelector value={language} onChange={setLanguage} variant="dropdown" />
          </div>

          {/* Voice Auto-Read Toggle (English) */}
          <button
            type="button"
            className={`voice-toggle-btn ${autoSpeak ? 'active' : ''}`}
            onClick={() => {
              if (autoSpeak && voice.isSpeaking) {
                voice.stopSpeaking();
              }
              setAutoSpeak(!autoSpeak);
            }}
            title={autoSpeak ? t('voice.autoReadEnabled') : t('voice.autoReadDisabled')}
            aria-pressed={autoSpeak}
          >
            {autoSpeak ? <SpeakerIcon size={16} /> : <SpeakerMuteIcon size={16} />}
            <span className="voice-toggle-label">
              {autoSpeak ? t('voice.autoRead') : 'Muted'} (EN)
            </span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              className="text-btn"
              onClick={clearChat}
            >
              {t('assistant.clearConversation')}
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
            <h3>{t('assistant.emptyTitle')}</h3>
            <p className="muted-text">{t('assistant.emptySub')}</p>

            {/* Voice Prompt Starter Banner */}
            <div className="chat-voice-starter-pill" onClick={toggleVoiceInput}>
              <span className={`voice-mic-indicator ${voice.isListening ? 'listening' : ''}`}>
                <MicIcon size={16} />
              </span>
              <span>
                {voice.isListening
                  ? t('voice.listening') || 'Listening in English... Speak your question now'
                  : 'Tap to Ask via Voice (English STT & Audio Guidance)'}
              </span>
            </div>

            <div className="quick-prompt-chips">
              {quickPrompts.map((prompt, idx) => (
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
                className={`message-bubble ${m.role === 'user' ? 'user' : 'model'} ${
                  speakingIdx === i ? 'speaking-active' : ''
                }`}
              >
                <div className="message-author">
                  {m.role === 'user' ? (user?.user_metadata?.full_name || 'Citizen') : 'Adhikar Sahayak'}
                </div>
                <ChatMessageView
                  role={m.role}
                  text={m.text}
                  isSpeaking={speakingIdx === i}
                  onSpeak={m.role === 'model' ? () => handleSpeakMessage(m.text, i) : undefined}
                  onStopSpeaking={handleStopSpeaking}
                />
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="message-bubble model loading-bubble">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span style={{ marginLeft: 8 }}>{t('assistant.thinking')}</span>
          </div>
        )}

        {/* Listening Status Strip */}
        {voice.isListening && (
          <div className="voice-listening-bar" role="status" aria-live="polite">
            <span className="voice-pulse-dot" />
            <span className="voice-listening-text">
              {t('voice.listening') || 'Listening in English... Speak clearly into your microphone'}
            </span>
            <button
              type="button"
              className="voice-stop-btn"
              onClick={() => voice.stopListening()}
            >
              Done Speaking
            </button>
          </div>
        )}

        {voice.error && (
          <div className="voice-error-notice">
            <span>{voice.error}</span>
          </div>
        )}

        <div className="chat-input-toolbar">
          {/* Integrated Mic Button for Voice Input */}
          <button
            type="button"
            className={`btn-mic-toolbar ${voice.isListening ? 'listening' : ''}`}
            onClick={toggleVoiceInput}
            title={voice.isListening ? 'Stop listening' : 'Speak your query in English'}
            aria-label={voice.isListening ? 'Stop voice recording' : 'Start voice input in English'}
            disabled={loading}
          >
            {voice.isListening ? <MicOffIcon size={18} /> : <MicIcon size={18} />}
          </button>

          <input
            type="text"
            className="chat-text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              voice.isListening
                ? 'Listening to your voice (English)...'
                : t('assistant.inputPlaceholder')
            }
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />

          <button
            type="button"
            className="btn btn-primary chat-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            {t('assistant.sendBtn')}
          </button>
        </div>
      </div>

      <div className="privacy-notice">
        {t('assistant.disclaimer')}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40, textAlign: 'center' }}>Loading Citizen Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
