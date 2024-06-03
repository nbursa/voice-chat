<template>
  <VoiceChat />
  <!--  <TestComponent />-->
</template>

<script lang="ts">
import VoiceChat from './views/VoiceChat.vue';
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

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #00c9ff;
}
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
