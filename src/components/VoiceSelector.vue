<template>
  <div class="py-2 px-2 max-w-xs border border-gray-900 rounded w-fit bg-white" :class="{ '!px-4 pb-4': showModal }">
    <div @click="showModal = !showModal" class="flex items-center justify-between" :class="{ 'mb-2': showModal }">
      <h5 class="text-sm text-left" :class="{ 'mr-4': showModal }">
        {{selectedVoiceName.split(' ')[0]}} <font-awesome-icon :icon="['fasr', 'comment-dots']" />
      </h5>
      <button v-if="showModal" class="text-xs" @click.stop="showModal = !showModal">{{showModal ? 'Close' : 'Open'}}</button>
    </div>
    <div v-if="showModal" class="flex flex-col text-xs">
      <div class="">
        <input
          v-model="text"
          type="text"
          class="w-full p-2 border border-gray-900 rounded mb-2"
          placeholder="Enter text to speak"
        />
      </div>
      <div class="flex items-center justify-between">
        <select
          v-model="selectedVoiceName"
          class="w-full h-fit p-2 mr-4 border border-gray-900 rounded"
          @change="selectVoice"
        >
          <option v-for="(voice, index) in voices" :key="index" :value="voice.name">
            {{ voice.name }} ({{ voice.lang }})
          </option>
        </select>
        <button
          @click="speak"
          class="py-1 px-4 h-fit border border-gray-900 rounded"
        >
          Speak
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';

export default defineComponent({
  name: 'VoiceSelector',
  emits: ['voice-selected'],
  setup(props, { emit }) {
    const showModal = ref<boolean>(false);
    const text = ref<string>('Hello! How can I assist you today?');
    const selectedVoiceName = ref<string>('');
    const voices = ref<SpeechSynthesisVoice[]>([]);

    const loadVoices = () => {
      const synth = window.speechSynthesis;
      voices.value = synth.getVoices();

      if (voices.value.length > 0) {
        selectedVoiceName.value = voices.value[0].name;
        emit('voice-selected', voices.value[0]);
      }
    };

    const selectVoice = () => {
      const voice = voices.value.find((v) => v.name === selectedVoiceName.value);
      if (voice) {
        emit('voice-selected', voice);
      }
    };

    const speak = () => {
      if (!text.value || !selectedVoiceName.value) return;

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text.value);
      const voice = voices.value.find((v) => v.name === selectedVoiceName.value);

      if (voice) {
        utterance.voice = voice;
        synth.speak(utterance);
      }
    };

    onMounted(() => {
      loadVoices();

      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    });

    watch(selectedVoiceName, (newVoiceName) => {
      selectVoice();
    });

    return {
      text,
      selectedVoiceName,
      voices,
      speak,
      selectVoice,
      showModal
    };
  },
});
</script>

<style scoped>
</style>