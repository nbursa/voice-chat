<template>
  <div class="relative p-4 text-center">
    <div class="absolute top-4 right-4">
      <VoiceSelector @voice-selected="setVoice" />
    </div>

    <h1 class="text-2xl font-bold mb-2">Voice Chat with ChatGPT</h1>

    <div class="text-left mb-4 p-4 rounded max-w-2xl mx-auto" v-if="messages.length">
      <div v-for="(msg, index) in messages" :key="index">
        <p><strong>{{ msg.role }}:</strong> {{ msg.content }}</p>
      </div>
    </div>

    <div>
      <button class="border border-gray-900 py-1 px-3 rounded mr-4" @click="startRecording">
        <font-awesome-icon :icon="['fas', 'microphone']" /> Speak
      </button>
      <button v-if="isRecording" class="border border-gray-900 py-1 px-3 rounded" @click="stopRecording">
        <font-awesome-icon :icon="['fas', 'stop']" />
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';
import VoiceSelector from './VoiceSelector.vue';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default defineComponent({
  name: 'VoiceChat',
  components: {
    VoiceSelector,
  },
  setup() {
    const showVoice = ref<boolean>(false);
    const messages = ref<Message[]>([]);
    const isRecording = ref(false);
    const selectedVoice = ref<SpeechSynthesisVoice | null>(null);
    let recognition: SpeechRecognition | null = null;

    const setVoice = (voice: SpeechSynthesisVoice) => {
      selectedVoice.value = voice;
    };

    const startRecording = () => {
      isRecording.value = true;
      if (!('webkitSpeechRecognition' in window)) {
        console.error('Speech recognition not supported');
        return;
      }
      recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);

        // Add user's message to conversation history
        messages.value.push({ role: 'user', content: transcript });

        const url = import.meta.env.VITE_CHATGPT_API_URL;
        const apiKey = import.meta.env.VITE_CHATGPT_API_KEY;

        try {
          const res = await axios.post(url, {
            messages: messages.value,
            model: 'gpt-3.5-turbo',
            max_tokens: 100,
            temperature: 0.9,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            }
          });
          const assistantMessage = res.data.choices[0].message.content.trim();

          // Add assistant's response to conversation history
          messages.value.push({ role: 'assistant', content: assistantMessage });

          speakResponse(assistantMessage);
        } catch (error) {
          console.error('Error accessing ChatGPT API:', error);
        }
      };

      recognition.onspeechend = () => {
        stopRecording();
      };

      recognition.onerror = (event: Event) => {
        console.error('Speech recognition error', event);
      };

      recognition.onend = () => {
        if (isRecording.value) {
          recognition.start();
        }
      };

      recognition.start();
    };

    const stopRecording = () => {
      isRecording.value = false;
      if (recognition) {
        recognition.stop();
      }
    };

    const speakResponse = (text: string) => {
      const synthesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice.value) {
        utterance.voice = selectedVoice.value;
      }
      utterance.lang = 'en-US';
      synthesis.speak(utterance);
    };

    return {
      messages,
      startRecording,
      stopRecording,
      setVoice,
      showVoice,
      isRecording
    };
  },
});
</script>

<style scoped>
</style>