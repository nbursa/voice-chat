<template>
  <div class="p-4 text-center">
    <button @click="startRecognition">Start Speaking</button>
    <button @click="readTranscript" v-if="transcript">Read Transcript</button>
    <p v-if="transcript">You said: {{ transcript }}</p>
    <p v-if="response">AI responded: {{ response }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'VoiceChat',
  props: {
    apiUrl: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const transcript = ref<string>('');
    const response = ref<string>('');

    const startRecognition = () => {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.onresult = (event: any) => {
        transcript.value = event.results[0][0].transcript;
        sendMessageToAI(transcript.value);
      };
      recognition.start();

    };

    const sendMessageToAI = async (text: string) => {
      try {
        const res = await axios.post(props.apiUrl, { text });
        response.value = res.data.response;
        speakText(response.value);
      } catch (error) {
        console.error("Error sending message to AI:", error);
      }
    };

    const speakText = (text: string) => {
      const speechSynthesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    };

    const readTranscript = () => {
      if (transcript.value) {
        speakText(transcript.value);
      }
    };

    return { transcript, response, startRecognition, readTranscript };
  }
});
</script>

<style scoped></style>