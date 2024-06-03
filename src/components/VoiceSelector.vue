<template>
  <div
    class="py-1 px-2 max-w-xs rounded w-fit bg-gray-800 border border-gray-800 hover:bg-gray-400 hover:border-gray-400 group transition-colors cursor-pointer"
    :class="{ '!px-4 pb-4  hover:bg-gray-800': showModal }"
  >
    <div
      @click="showModal = !showModal"
      class="flex items-center justify-between"
      :class="{ 'mb-2': showModal }"
    >
      <div class="text-sm text-left text-primary-light">
        <span v-if="showModal">Select AI voice</span>
        <font-awesome-icon
          class="text-gray-400 group-hover:text-gray-800 transition-colors"
          :class="{
            'ml-4 text-primary-light group-hover:text-primary-light': showModal,
          }"
          :icon="['fasr', 'comment-dots']"
        />
      </div>
      <button
        v-if="showModal"
        class="text-xs text-primary-light hover:text-gray-400 transition-colors"
        @click.stop="showModal = !showModal"
      >
        {{ showModal ? 'Close' : 'Open' }}
      </button>
    </div>
    <div v-if="showModal" class="flex flex-col">
      <div class="">
        <input
          v-model="text"
          type="text"
          class="w-full text-sm p-2 bg-gray-800 border-0 border-b-2 border-b-primary-light mb-2 text-primary-light placeholder-primary-lighter outline-none"
          placeholder="Enter text to speak"
        />
      </div>
      <div class="flex items-stretch justify-between h-full">
        <select
          v-model="selectedVoiceName"
          class="w-full h-full text-sm p-2 mr-4 outline-none bg-gray-800 border-0 border-b-2 border-b-primary-light text-primary-light placeholder-primary-lighter"
          @change="selectVoice"
        >
          <option
            v-for="(voice, index) in voices"
            :key="index"
            :value="voice.name"
          >
            {{ voice.name }} ({{ voice.lang }})
          </option>
        </select>
        <button
          @click="speak"
          class="inline-flex text-sm h-full py-2 px-4 border border-primary-light bg-gray-800 rounded text-primary-light hover:border-gray-400 hover:text-gray-400 transition-colors"
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
        const defaultVoice = voices.value.find(v =>
          v.name.startsWith('Daniel')
        );
        selectedVoiceName.value = defaultVoice
          ? defaultVoice.name
          : voices.value[0].name;
        emit('voice-selected', selectedVoiceName.value);
      }
    };

    const selectVoice = () => {
      const voice = voices.value.find(v => v.name === selectedVoiceName.value);
      if (voice) {
        emit('voice-selected', voice);
      }
    };

    const speak = () => {
      if (!text.value || !selectedVoiceName.value) return;

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text.value);
      const voice = voices.value.find(v => v.name === selectedVoiceName.value);

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

    watch(selectedVoiceName, () => {
      selectVoice();
    });

    return {
      text,
      selectedVoiceName,
      voices,
      speak,
      selectVoice,
      showModal,
    };
  },
});
</script>
