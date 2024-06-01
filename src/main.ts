import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css';
import { FontAwesomeIcon } from './fontAwesome';

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');
