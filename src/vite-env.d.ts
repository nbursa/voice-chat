/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }

  var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  interface SpeechRecognition extends EventTarget {
    readonly grammars: SpeechGrammarList;
    readonly lang: string;
    readonly continuous: boolean;
    readonly interimResults: boolean;
    readonly maxAlternatives: number;
    onresult: (event: SpeechRecognitionEvent) => void;
    onaudiostart: (event: Event) => void;
    onsoundstart: (event: Event) => void;
    onspeechstart: (event: Event) => void;
    onspeechend: (event: Event) => void;
    onsoundend: (event: Event) => void;
    onaudioend: (event: Event) => void;
    onend: (event: Event) => void;
    onerror: (event: Event) => void;
    onnomatch: (event: SpeechRecognitionEvent) => void;
    onstart: (event: Event) => void;
    abort(): void;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechGrammarList {
    readonly length: number;
    item(index: number): SpeechGrammar;
    addFromURI(src: string, weight?: number): void;
    addFromString(string: string, weight?: number): void;
    [index: number]: SpeechGrammar;
  }

  interface SpeechGrammar {
    readonly src: string;
    readonly weight: number;
  }
}