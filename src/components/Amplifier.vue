<template>
  <canvas ref="canvas" class="block w-full h-full"></canvas>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue';

export default defineComponent({
  name: 'Amplifier',
  props: {
    recording: {
      type: Boolean,
      required: true,
    },
    aiSpeech: {
      type: Object as () => MediaStream | null,
      default: null,
    },
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let animationFrameId: number | null = null;
    let userMicrophoneSource: MediaStreamAudioSourceNode | null = null;
    let aiSpeechSource: MediaStreamAudioSourceNode | null = null;

    const startVisualization = async () => {
      if (!canvas.value) return;

      if (!audioContext) {
        audioContext = new AudioContext();
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
      }

      if (props.recording && !userMicrophoneSource) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        userMicrophoneSource = audioContext.createMediaStreamSource(stream);
        userMicrophoneSource.connect(analyser);
      }

      if (props.aiSpeech) {
        if (aiSpeechSource) {
          aiSpeechSource.disconnect();
        }
        console.log('AI Speech:', props.aiSpeech, aiSpeechSource)
        aiSpeechSource = audioContext.createMediaStreamSource(props.aiSpeech);
        aiSpeechSource.connect(analyser);
      }

      draw();
    };

    const stopVisualization = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      if (userMicrophoneSource) {
        userMicrophoneSource.disconnect();
        userMicrophoneSource = null;
      }
      if (aiSpeechSource) {
        aiSpeechSource.disconnect();
        aiSpeechSource = null;
      }
      if (analyser) {
        analyser.disconnect();
        analyser = null;
      }
    };

    const draw = () => {
      if (!canvas.value || !analyser || !dataArray) return;

      const canvasCtx = canvas.value.getContext('2d');
      if (!canvasCtx) return;

      const drawVisual = () => {
        if (!analyser || !dataArray || !canvas.value) return;

        analyser.getByteTimeDomainData(dataArray);

        const { width, height } = canvas.value.getBoundingClientRect();
        canvas.value.width = width;
        canvas.value.height = height;

        canvasCtx.fillStyle = 'black';
        canvasCtx.fillRect(0, 0, width, height);

        canvasCtx.lineWidth = 2;

        const gradient = canvasCtx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'green');

        canvasCtx.strokeStyle = gradient;

        canvasCtx.beginPath();

        const sliceWidth = (width * 1.0) / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(width, height / 2);
        canvasCtx.stroke();

        animationFrameId = requestAnimationFrame(drawVisual);
      };

      drawVisual();
    };

    watch(
      () => props.recording,
      (newVal) => {
        if (newVal) {
          startVisualization();
        } else {
          stopVisualization();
        }
      }
    );

    // watch(
    //   () => props.aiSpeech,
    //   (newStream) => {
    //     if (newStream) {
    //       startVisualization();
    //     } else {
    //       if (!props.recording) {
    //         stopVisualization();
    //       }
    //     }
    //   }
    // );

    onMounted(() => {
      if (canvas.value) {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
      }
    });

    // onMounted(() => {
    //   if (canvas.value) {
    //     const resumeAudioContext = async () => {
    //       await initializeAudioContext();
    //       resizeCanvas();
    //       window.addEventListener('resize', resizeCanvas);
    //     };
    //
    //     // Attach a user gesture event to resume AudioContext
    //     window.addEventListener('click', resumeAudioContext, { once: true });
    //     window.addEventListener('keydown', resumeAudioContext, { once: true });
    //   }
    // });
    //
    // const initializeAudioContext = async () => {
    //   if (!audioContext) {
    //     audioContext = new AudioContext();
    //   }
    //
    //   if (audioContext.state === 'suspended') {
    //     await audioContext.resume();
    //   }
    // };

    const resizeCanvas = () => {
      if (canvas.value) {
        const { width, height } = canvas.value.getBoundingClientRect();
        canvas.value.width = width;
        canvas.value.height = height;
      }
    };

    onBeforeUnmount(() => {
      stopVisualization();
      window.removeEventListener('resize', resizeCanvas);
    });

    return {
      canvas,
    };
  },
});
</script>

<style scoped>
</style>