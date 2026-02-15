import { pipeline, env } from '@huggingface/transformers';

// Configuración para ejecución local
env.allowRemoteModels = true;
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;

self.onmessage = async (event) => {
    const { audio, language } = event.data;

    try {
        if (!transcriber) {
            self.postMessage({ status: 'loading', message: 'Cargando modelo de voz (Whisper Tiny)...' });
            transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
                device: 'wasm', // Forzar WASM para máxima compatibilidad en local
            });
            self.postMessage({ status: 'ready', message: 'Modelo listo' });
        }

        self.postMessage({ status: 'processing', message: 'Transcribiendo audio...' });

        const result = await transcriber(audio, {
            language: language || 'spanish',
            task: 'transcribe',
        });

        self.postMessage({ status: 'complete', text: result.text });
    } catch (error) {
        self.postMessage({ status: 'error', message: error.message });
    }
};
