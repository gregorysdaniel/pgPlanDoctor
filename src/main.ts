import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import '@fontsource/jetbrains-mono/latin-700.css'
import App from './App.vue'
import { router } from './router'
import { initializeLocale } from './i18n'
import './styles.css'

initializeLocale()
createApp(App).use(router).mount('#app')
