import { App } from './dist/client/app.js';

// Uygulamayı başlat
const app = new App();
app.start().catch((error) => {
  console.error("Uygulama başlatılamadı:", error);
  process.exit(1);
});