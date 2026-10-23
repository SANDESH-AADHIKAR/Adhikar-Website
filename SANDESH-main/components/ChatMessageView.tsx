'use client';
import React from 'react';
import { ExternalLinkIcon, SpeakerIcon, SpeakerMuteIcon, GovtBuildingIcon } from './Icons';

interface ChatMessageViewProps {
  role: 'user' | 'model';
  text: string;
  isSpeaking?: boolean;
  onSpeak?: () => void;
  onStopSpeaking?: () => void;
}

/**
 * Strips all markdown asterisks and vibe-coded artifacts
 */
export function cleanVibeCodedText(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove double asterisks (**bold**)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove single asterisks (*italic*)
    .replace(/\*([^*\n]+)\*/g, '$1')
    // Remove standalone asterisk bullets
    .replace(/^\s*\*\s+/gm, '• ')
    // Remove hashtag headers (### Header)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove vibe-coded AI meta notes
    .replace(/\(?Note: Set OPENROUTER_API_KEY.*?\)?/gi, '')
    .replace(/\(?Note:.*?(GEMINI_API_KEY|API key).*?\)?/gi, '')
    // Trim excess empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function ChatMessageView({
  role,
  text,
  isSpeaking = false,
  onSpeak,
  onStopSpeaking,
}: ChatMessageViewProps) {
  const isModel = role === 'model';
  const cleaned = cleanVibeCodedText(text);

  // If user message, render clean bubble
  if (!isModel) {
    return <div className="user-message-content">{cleaned}</div>;
  }

  // Split lines to detect structured sections
  const lines = cleaned.split('\n');

  return (
    <div className="assistant-message-wrapper">
      <div className="assistant-message-content">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="message-line-spacer" />;
          }

          // Check for URL links (e.g. https://... or [title](url))
          const markdownLinkMatch = trimmed.match(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
          if (markdownLinkMatch) {
            const [, label, url] = markdownLinkMatch;
            const prefix = trimmed.substring(0, markdownLinkMatch.index || 0).replace(/^[•\-]\s*/, '');
            return (
              <div key={idx} className="message-link-row">
                {prefix && <span className="message-label">{prefix}</span>}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="official-portal-chip"
                >
                  <GovtBuildingIcon size={14} />
                  <span>{label || 'Official Portal'}</span>
                  <ExternalLinkIcon size={12} />
                </a>
              </div>
            );
          }

          // Check if line contains a standard URL
          const plainUrlMatch = trimmed.match(/(https?:\/\/[^\s]+)/);
          if (plainUrlMatch && !markdownLinkMatch) {
            const url = plainUrlMatch[1];
            const cleanUrl = url.replace(/[.,;)]+$/, '');
            const prefix = trimmed.replace(url, '').replace(/^[•\-]\s*/, '').trim();
            return (
              <div key={idx} className="message-link-row">
                {prefix && <span className="message-label">{prefix}</span>}
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="official-portal-chip"
                >
                  <GovtBuildingIcon size={14} />
                  <span>{cleanUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLinkIcon size={12} />
                </a>
              </div>
            );
          }

          // Check for key-value bullet points like "Benefit: ...", "Eligibility: ..."
          const kvMatch = trimmed.match(/^([•\-\d.]*)\s*(Benefit|Eligibility|Required Documents|Documents Required|Official Portal|पात्रता|लाभ|कागदपत्रे|Documents|Interest Rate|Collateral):\s*(.+)$/i);
          if (kvMatch) {
            const [, bullet, key, value] = kvMatch;
            return (
              <div key={idx} className="message-attribute-row">
                <span className="attribute-badge">{key}</span>
                <span className="attribute-value">{value}</span>
              </div>
            );
          }

          // Check for section headers (e.g. "1. PM-KISAN..." or "Healthcare Support Schemes:")
          const isHeader =
            trimmed.endsWith(':') ||
            /^\d+\.\s+[A-Z]/.test(trimmed) ||
            /^(🌾|🏥|🎓|💼|🏛️|🛡️|💡)/.test(trimmed);

          if (isHeader) {
            return (
              <div key={idx} className="message-section-title">
                {trimmed}
              </div>
            );
          }

          // Standard bullet line
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            return (
              <div key={idx} className="message-bullet-row">
                <span className="bullet-dot">•</span>
                <span className="bullet-text">{trimmed.replace(/^[•\-]\s*/, '')}</span>
              </div>
            );
          }

          // Default paragraph text
          return (
            <p key={idx} className="message-paragraph">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Voice Read-Aloud Toolbar for Assistant Message */}
      {(onSpeak || onStopSpeaking) && (
        <div className="message-voice-bar">
          <button
            type="button"
            className={`message-listen-btn ${isSpeaking ? 'active-speaking' : ''}`}
            onClick={isSpeaking ? onStopSpeaking : onSpeak}
            title={isSpeaking ? 'Stop listening' : 'Listen to response (English voice)'}
            aria-label={isSpeaking ? 'Stop reading response' : 'Read response aloud'}
          >
            {isSpeaking ? (
              <>
                <SpeakerMuteIcon size={14} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <SpeakerIcon size={14} />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
