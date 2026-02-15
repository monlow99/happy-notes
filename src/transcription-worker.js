import { pipeline, env } from '@huggingface/transformers';

// Configuración para ejecución local
env.allowRemoteModels = true;
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;

self.onmessage = async (event) => {
    const { action, audio, language } = event.data;

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
            if (action === 'load') return; // Solo precarga
        }

        if (action === 'load') {
            self.postMessage({ status: 'ready', message: 'Cerebro de voz ya está listo' });
            return;
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
