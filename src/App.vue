<template>
  <VoiceChat />
<!--  <TestComponent />-->
</template>

<script lang="ts">
import VoiceChat from './components/VoiceChat.vue';
// import TestComponent from './components/Test.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    VoiceChat,
    // TestComponent
  },
});
</script>

<style scoped>
</style>
