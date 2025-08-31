class AudioEngine {
    private context: AudioContext | null = null;
    private buttonBuffer: AudioBuffer | null = null;
    private reportBuffer: AudioBuffer | null = null;
    private bgmBuffer: AudioBuffer | null = null;
    private dondonpufpufBuffer: AudioBuffer | null = null;
    private missBuffer: AudioBuffer | null = null;
    private bgmSourceNode: AudioBufferSourceNode | null = null;
    private bgmGainNode: GainNode | null = null;
    
    private isInitialized = false;
    private isBgmPlaying = false;
    private requestedBgmPlay = false;
    private currentVolume: number = 0.5; // Keep track of the current volume

    private readonly BUTTON_VOLUME = 0.8;
    private readonly REPORT_VOLUME = 0.3;
    private readonly MAX_BGM_VOLUME = 0.2;
    private readonly RECRUIT_SUCCESS_VOLUME = 0.8;
    private readonly RECRUIT_FAIL_VOLUME = 0.7;

    public async initialize() {
        if (this.isInitialized || this.context) {
            return;
        }
        // Must be called in a user gesture
        try {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.isInitialized = true;
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            await this.loadSounds();
            if (this.requestedBgmPlay) {
                this.playBgm();
            }
        } catch (e) {
            console.error("Could not initialize Web Audio API.", e);
            this.isInitialized = false;
            this.context = null;
        }
    }
    
    private async loadSounds() {
        if (!this.context) return;
        try {
            const [buttonRes, reportRes, bgmRes, recruitSuccessRes, recruitFailRes] = await Promise.all([
                fetch('assets_bgm/button.mp3'),
                fetch('assets_bgm/kirakira.mp3'),
                fetch('assets_bgm/You_and_Me_2 (1).mp3'),
                fetch('assets_bgm/dondonpufpuf.mp3'),
                fetch('assets_bgm/miss.mp3'),
            ]);
            const [buttonArrayBuffer, reportArrayBuffer, bgmArrayBuffer, recruitSuccessArrayBuffer, recruitFailArrayBuffer] = await Promise.all([
                buttonRes.arrayBuffer(),
                reportRes.arrayBuffer(),
                bgmRes.arrayBuffer(),
                recruitSuccessRes.arrayBuffer(),
                recruitFailRes.arrayBuffer(),
            ]);
            [this.buttonBuffer, this.reportBuffer, this.bgmBuffer, this.dondonpufpufBuffer, this.missBuffer] = await Promise.all([
                this.context.decodeAudioData(buttonArrayBuffer),
                this.context.decodeAudioData(reportArrayBuffer),
                this.context.decodeAudioData(bgmArrayBuffer),
                this.context.decodeAudioData(recruitSuccessArrayBuffer),
                this.context.decodeAudioData(recruitFailArrayBuffer),
            ]);
        } catch(e) {
            console.error("Failed to load sounds", e);
        }
    }

    private playSound(buffer: AudioBuffer | null, baseVolume: number) {
        if (!this.context || !buffer) {
            return;
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        const gainNode = this.context.createGain();
        gainNode.gain.setValueAtTime(baseVolume * this.currentVolume, this.context.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        source.start(0);
    }
    
    private playFallback(src: string, baseVolume: number) {
        try {
            const audio = new Audio(src);
            audio.volume = baseVolume * this.currentVolume;
            audio.play().catch(e => console.warn("Fallback sound play failed:", e));
        } catch(e) {
            console.error("Error playing fallback sound:", e);
        }
    }

    public playButtonClick() {
        if (this.context && this.buttonBuffer) {
            this.playSound(this.buttonBuffer, this.BUTTON_VOLUME);
        } else {
            this.playFallback('assets_bgm/button.mp3', this.BUTTON_VOLUME);
        }
    }
    
    public playReport() {
        if (this.context && this.reportBuffer) {
            this.playSound(this.reportBuffer, this.REPORT_VOLUME);
        } else {
            this.playFallback('assets_bgm/kirakira.mp3', this.REPORT_VOLUME);
        }
    }

    public playRecruitSuccess() {
        if (this.context && this.dondonpufpufBuffer) {
            this.playSound(this.dondonpufpufBuffer, this.RECRUIT_SUCCESS_VOLUME);
        } else {
            this.playFallback('assets_bgm/dondonpufpuf.mp3', this.RECRUIT_SUCCESS_VOLUME);
        }
    }

    public playRecruitFail() {
        if (this.context && this.missBuffer) {
            this.playSound(this.missBuffer, this.RECRUIT_FAIL_VOLUME);
        } else {
            this.playFallback('assets_bgm/miss.mp3', this.RECRUIT_FAIL_VOLUME);
        }
    }

    public playBgm() {
        if (!this.context || !this.bgmBuffer) {
            this.requestedBgmPlay = true;
            return;
        }
        if (this.isBgmPlaying) {
            return;
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        this.bgmSourceNode = this.context.createBufferSource();
        this.bgmSourceNode.buffer = this.bgmBuffer;
        this.bgmSourceNode.loop = true;

        this.bgmGainNode = this.context.createGain();
        
        this.bgmSourceNode.connect(this.bgmGainNode);
        this.bgmGainNode.connect(this.context.destination);
        
        // Set volume right after creating the nodes and before starting playback
        this.setVolume(this.currentVolume);

        this.bgmSourceNode.start(0);
        this.isBgmPlaying = true;
    }

    public stopBgm() {
        if (this.bgmSourceNode && this.isBgmPlaying) {
            this.bgmSourceNode.stop();
            this.bgmSourceNode.disconnect();
            this.bgmGainNode?.disconnect();
        }
        this.isBgmPlaying = false;
        this.bgmSourceNode = null;
        this.bgmGainNode = null;
        this.requestedBgmPlay = false;
    }

    public setVolume(volume: number) { // volume is 0-1
        this.currentVolume = volume; // Store the latest volume
        if (this.bgmGainNode && this.context) {
            const gainValue = this.MAX_BGM_VOLUME * (volume ** 2);
            this.bgmGainNode.gain.setTargetAtTime(gainValue, this.context.currentTime, 0.05);
        }
    }
}

const audioEngine = new AudioEngine();

export const initAudioSystem = () => {
    audioEngine.initialize();
};
export const playButtonClickSound = () => {
    audioEngine.playButtonClick();
};
export const playReportSound = () => {
    audioEngine.playReport();
};
export const playBgm = () => {
    audioEngine.playBgm();
};
export const stopBgm = () => {
    audioEngine.stopBgm();
};
export const setVolume = (volume: number) => {
    audioEngine.setVolume(volume);
};
export const playRecruitSuccessSound = () => {
    audioEngine.playRecruitSuccess();
};
export const playRecruitFailSound = () => {
    audioEngine.playRecruitFail();
};