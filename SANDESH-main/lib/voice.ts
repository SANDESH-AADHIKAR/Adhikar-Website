'use client';

/**
 * Universal Voice Module for Next.js Web App
 * Compatible with React Native Voice event patterns:
 * (onSpeechStart, onSpeechEnd, onSpeechResults, onSpeechError, start, stop, destroy)
 * plus Web Speech Synthesis (TTS) for voice output.
 * Limited to English as requested.
 */

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export type VoiceListener = (state: VoiceState) => void;

class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private listeners: Set<VoiceListener> = new Set();
  private isListening = false;
  private isSpeaking = false;
  private transcript = '';
  private error: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;

      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-IN'; // English (India) default for civic portal, works for all English

          this.recognition.onstart = () => {
            this.isListening = true;
            this.error = null;
            this.emit();
          };

          this.recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const res = event.results[i];
              if (res.isFinal) {
                finalTranscript += res[0].transcript;
              } else {
                interimTranscript += res[0].transcript;
              }
            }

            const currentText = finalTranscript || interimTranscript;
            if (currentText) {
              this.transcript = currentText;
              this.emit();
            }
          };

          this.recognition.onerror = (event: any) => {
            // 'no-speech' is common and not fatal
            if (event.error !== 'no-speech') {
              this.error = event.error || 'Voice recognition error';
            }
            this.isListening = false;
            this.emit();
          };

          this.recognition.onend = () => {
            this.isListening = false;
            this.emit();
          };
        } catch (e: any) {
          console.warn('SpeechRecognition initialization error:', e);
          this.recognition = null;
        }
      }

      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition || this.synthesis);
  }

  public isRecognitionSupported(): boolean {
    return Boolean(this.recognition);
  }

  public isSynthesisSupported(): boolean {
    return Boolean(this.synthesis);
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Voice listener error:', err);
      }
    });
  }

  public getState(): VoiceState {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      transcript: this.transcript,
      error: this.error,
      isSupported: this.isSupported(),
    };
  }

  /**
   * Start listening for voice input (English only)
   */
  public async startListening(lang: string = 'en-IN'): Promise<void> {
    if (!this.recognition) {
      this.error = 'Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.';
      this.emit();
      return;
    }

    try {
      // Stop ongoing speech synthesis if any
      this.stopSpeaking();

      this.transcript = '';
      this.error = null;
      this.recognition.lang = lang; // English
      this.recognition.start();
    } catch (e: any) {
      // Ignore if already started
      if (e.name !== 'InvalidStateError') {
        this.error = e.message || 'Could not start voice recognition';
        this.emit();
      }
    }
  }

  /**
   * Stop listening for voice input
   */
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    this.emit();
  }

  /**
   * Read text aloud using SpeechSynthesis (English only)
   */
  public speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported in this browser');
      if (onEnd) onEnd();
      return;
    }

    try {
      // Cancel previous speech
      this.synthesis.cancel();

      // Clean text of markdown, badges, and weird characters for smooth TTS
      const cleanText = text
        .replace(/[*#_~`]/g, '')
        .replace(/https?:\/\/\S+/g, 'link provided')
        .replace(/[^\w\s.,?!₹\-\(\)]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN'; // English voice
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Pick an English voice if available
      const voices = this.synthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.includes('en-IN') || v.name.includes('India')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null;

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.emit();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.emit();
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.emit();
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    } catch (e: any) {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.emit();
      if (onEnd) onEnd();
    }
  }

  /**
   * Stop speaking
   */
  public stopSpeaking(): void {
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.emit();
  }

  /**
   * Reset / destroy state
   */
  public destroy(): void {
    this.stopListening();
    this.stopSpeaking();
    this.listeners.clear();
  }
}

// Singleton instance
export const voiceService = new VoiceService();

import { useState, useEffect, useCallback } from 'react';

export function useVoice() {
  const [state, setState] = useState<VoiceState>(() => voiceService.getState());

  useEffect(() => {
    return voiceService.subscribe(setState);
  }, []);

  const startListening = useCallback((lang: string = 'en-IN') => {
    return voiceService.startListening(lang);
  }, []);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    voiceService.speak(text, onEnd);
  }, []);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
  }, []);

  return {
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    transcript: state.transcript,
    error: state.error,
    isSupported: state.isSupported,
    isRecognitionSupported: voiceService.isRecognitionSupported(),
    isSynthesisSupported: voiceService.isSynthesisSupported(),
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
