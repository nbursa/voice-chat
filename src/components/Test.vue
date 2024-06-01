<template>
  <div class="p-4 text-center">
    <h1>Voice Chat with ChatGPT - test</h1>
    <button class="border border-gray-900 py-1 px-3 rounded mr-4" @click="startRecording">Speak</button>
    <button class="border border-gray-900 py-1 px-3 rounded" @click="stopRecording">Stop</button>
    <div class="text-left" v-if="messages.length">
      <div v-for="(msg, index) in messages" :key="index">
        <p><strong>{{ msg.role }}:</strong> {{ msg.content }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default defineComponent({
  name: 'VoiceChat',
  setup() {
    const messages = ref<Message[]>([]);
    const isRecording = ref(false);
    let recognition: SpeechRecognition | null = null;

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
      utterance.lang = 'en-US';
      synthesis.speak(utterance);
    };

    return {
      messages,
      startRecording,
      stopRecording,
    };
  },
});
</script>

<style scoped>
</style>