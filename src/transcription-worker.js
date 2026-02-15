import { pipeline, env } from '@huggingface/transformers';

// Configuración para ejecución local
env.allowRemoteModels = true;
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;

// Importar lamejs (emulado o vía importScripts si estuviera en public, 
// pero como es Vite, usaremos una versión inline o esperaremos a que la app lo provea)
// Para este entorno, asumiremos que el worker puede recibir la librería o usar una versión simplificada.
// Como lamejs es complejo de inlinear, usaremos la capacidad de Vite para agruparlo o 
// simplemente procesaremos el MP3 en el worker si logramos importar la librería.

self.onmessage = async (event) => {
    const { action, audio, sampleRate, lamejsCode } = event.data;

    try {
        if (!transcriber && (action === 'load' || audio)) {
            self.postMessage({ status: 'loading', message: 'Iniciando cerebro de voz (Whisper Base)...' });
            transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
                device: 'wasm',
                progress_callback: (p) => {
                    if (p.status === 'progress') {
                        self.postMessage({ status: 'loading', message: `Descargando IA: ${Math.round(p.progress)}%` });
                    }
                }
            });
            self.postMessage({ status: 'ready', message: 'Cerebro de voz listo' });
            if (action === 'load') return;
        }

        if (action === 'load') {
            self.postMessage({ status: 'ready', message: 'Cerebro de voz ya está listo' });
            return;
        }

        if (action === 'encode-mp3') {
            // Lógica de codificación MP3 usando lamejs
            // Intentamos cargar lamejs si se pasó el código
            if (lamejsCode && !self.lamejs) {
                try {
                    const blob = new Blob([lamejsCode], { type: 'application/javascript' });
                    importScripts(URL.createObjectURL(blob));
                } catch (e) { console.error("Error cargando lamejs", e); }
            }

            if (self.lamejs) {
                const mp3encoder = new self.lamejs.Mp3Encoder(1, sampleRate || 44100, 128);
                const samples = new Int16Array(audio.length);
                for (let i = 0; i < audio.length; i++) {
                    samples[i] = audio[i] * 32767;
                }
                const mp3Data = [];
                const mp3buf = mp3encoder.encodeBuffer(samples);
                if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
                const end = mp3encoder.flush();
                if (end.length > 0) mp3Data.push(new Uint8Array(end));

                const blob = new Blob(mp3Data, { type: 'audio/mp3' });
                self.postMessage({ status: 'mp3-complete', blob: blob });
            }
            return;
        }

        if (audio) {
            self.postMessage({ status: 'processing', message: 'Transcribiendo audio...' });
            const result = await transcriber(audio, {
                language: 'spanish',
                task: 'transcribe',
            });
            self.postMessage({ status: 'complete', text: result.text });
        }
    } catch (error) {
        self.postMessage({ status: 'error', message: error.message });
    }
};
