<template>
  <nav
    class="absolute top-0 left-0 right-0 bg-gray-400/25 m-4 flex justify-between items-center gap-4 rounded py-1 px-2 shadow-lg z-10 backdrop-blur-sm"
  >
    <h1 class="flex gap-1 md:gap-2 items-baseline">
      <span class="font-bold md:text-3xl gradient-bg">Voice Chat</span>
      <span class="text-xs md:text-lg font-bold text-gray-800"
        >with ChatGPT</span
      >
    </h1>
    <VoiceSelector @voice-selected="setVoice" />
  </nav>
  <div
    class="relative w-screen h-screen py-20 overflow-hidden overflow-y-auto p-4 text-center bg-gray-800 text-white min-h-screen"
  >
    <div
      class="text-left text-xs sm:text-sm md:text-md max-w-lg mx-auto"
      v-if="messages.length"
    >
      <div v-for="(msg, index) in messages" :key="index">
        <div
          v-if="msg.role === 'user'"
          class="flex mb-4 text-white w-full ml-0"
        >
          <div
            class="flex items-center justify-center mr-2 p-3 w-12 h-12 rounded-full bg-gray-700 shadow-lg"
          >
            U
          </div>
          <div class="rounded-lg p-3 bg-gray-700 shadow-lg max-w-[65%]">
            {{ msg.content }}
          </div>
        </div>
        <div v-else class="flex text-white w-full mr-0 mb-4">
          <div class="rounded-lg p-3 bg-gray-700 shadow-lg max-w-[65%] ml-auto">
            {{ msg.content }}
          </div>
          <div
            class="flex items-center justify-center ml-2 p-3 w-[50px] h-[50px] rounded-full bg-gray-700 shadow-lg fixed-size"
          >
            AI
          </div>
        </div>
      </div>
    </div>

    <div
      class="fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded w-fit bg-gray-400/25 backdrop-blur-sm max-w-lg"
    >
      <div v-if="isRecording" class="rounded max-w-[200px] h-[40px] mx-auto">
        <AudioVisualizer :recording="isRecording" :aiSpeech="aiSpeechStream" />
      </div>
      <button
        class="border border-gray-800 text-gray-400 bg-gray-800 hover:border-gray-400 hover:bg-gray-400 hover:text-gray-700 py-1 px-10 rounded shadow-lg"
        :class="{ 'mr-4': isRecording }"
        @click="startRecording"
      >
        <font-awesome-icon :icon="['fas', 'microphone']" />
      </button>
      <button
        v-if="isRecording"
        class="border border-gray-800 text-gray-400 bg-gray-800 hover:border-gray-400 hover:bg-gray-400 hover:text-gray-700 py-1 px-10 rounded shadow-lg"
        @click="stopRecording"
      >
        <font-awesome-icon :icon="['fas', 'stop']" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import axios from 'axios';
import VoiceSelector from '../components/VoiceSelector.vue';
import AudioVisualizer from '../components/AudioVisualizer.vue';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default defineComponent({
  name: 'VoiceChat',
  components: {
    AudioVisualizer,
    VoiceSelector,
  },
  setup() {
    const showVoice = ref<boolean>(false);
    const messages = ref<Message[]>([]);
    const isRecording = ref(false);
    const selectedVoice = ref<SpeechSynthesisVoice | null>(null);
    const aiSpeechStream = ref<MediaStream | null>(null);
    const audioContext = new AudioContext();
    let recognition: SpeechRecognition | null = null;

    const haveSound = computed(
      () => !!aiSpeechStream.value || isRecording.value
    );

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

        messages.value.push({ role: 'user', content: transcript });

        const url = import.meta.env.VITE_CHATGPT_API_URL;
        const apiKey = import.meta.env.VITE_CHATGPT_API_KEY;

        try {
          const res = await axios.post(
            url,
            {
              messages: messages.value,
              model: 'gpt-3.5-turbo',
              max_tokens: 100,
              temperature: 0.9,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
            }
          );
          const assistantMessage = res.data.choices[0].message.content.trim();

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

      const dest = audioContext.createMediaStreamDestination();
      utterance.onstart = () => {
        aiSpeechStream.value = dest.stream;
      };
      utterance.onend = () => {
        aiSpeechStream.value = null;
      };
      synthesis.speak(utterance);

      const source = audioContext.createMediaStreamSource(dest.stream);
      source.connect(audioContext.destination);
    };

    return {
      audioContext,
      messages,
      startRecording,
      stopRecording,
      setVoice,
      showVoice,
      isRecording,
      aiSpeechStream,
      haveSound,
    };
  },
});
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.no-gradient {
  background: none;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
