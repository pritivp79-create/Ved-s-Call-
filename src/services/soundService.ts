// Audio synthesis using browser Web Audio API for real dial tones, ringers, and call sound effects

class SoundService {
  private ctx: AudioContext | null = null;
  private ringtoneInterval: number | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopRingtone();
    }
  }

  // DTMF standard frequencies for telephone keypads
  public playDtmf(key: string, durationMs: number = 160) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const dtmfFreqs: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477],
    };

    const freqs = dtmfFreqs[key] || [800, 1200];
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freqs[0], now);
    osc2.frequency.setValueAtTime(freqs[1], now);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationMs / 1000);
    osc2.stop(now + durationMs / 1000);
  }

  // Plays a tone sequence based on theme signature ringtone
  public startRingtone(themeId: string) {
    if (this.isMuted) return;
    this.stopRingtone();

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playPattern = () => {
      if (this.isMuted) return;
      const now = ctx.currentTime;

      if (themeId === 'samsung') {
        // "Over The Horizon" signature 5-note motif: E5 -> G#5 -> A5 -> B5 -> E6
        const notes = [659.25, 830.61, 880.0, 987.77, 1318.51];
        notes.forEach((freq, index) => {
          this.playNote(freq, now + index * 0.22, 0.25, 'triangle', 0.16);
        });
      } else if (themeId === 'mi') {
        // Xiaomi / HyperOS energetic double chime chord
        const chords = [
          [523.25, 659.25, 783.99], // C5 chord
          [587.33, 739.99, 880.0],  // D5 chord
          [659.25, 830.61, 987.77], // E5 chord
        ];
        chords.forEach((chord, i) => {
          chord.forEach((freq) => {
            this.playNote(freq, now + i * 0.28, 0.26, 'sine', 0.08);
          });
        });
      } else if (themeId === 'jolt') {
        // Cyber neon arpeggiator synth pulse
        const cyberNotes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        cyberNotes.forEach((freq, idx) => {
          this.playNote(freq, now + idx * 0.12, 0.15, 'sawtooth', 0.07);
        });
      } else if (themeId === 'oneplus') {
        // OnePlus clean double chime
        this.playNote(880, now, 0.18, 'sine', 0.15);
        this.playNote(1320, now + 0.2, 0.25, 'sine', 0.15);
        this.playNote(880, now + 0.6, 0.18, 'sine', 0.15);
        this.playNote(1760, now + 0.8, 0.35, 'sine', 0.18);
      } else if (themeId === 'huawei') {
        // Huawei Harmony calm harp chime
        const harp = [523.25, 659.25, 783.99, 1046.5];
        harp.forEach((freq, idx) => {
          this.playNote(freq, now + idx * 0.18, 0.35, 'sine', 0.12);
        });
      } else if (themeId === 'sony') {
        // Sony Xperia crisp electronic harmonic
        this.playNote(784, now, 0.15, 'sine', 0.12);
        this.playNote(988, now + 0.15, 0.15, 'sine', 0.12);
        this.playNote(1175, now + 0.3, 0.3, 'sine', 0.14);
      } else {
        // Default standard modern cellular ring pattern
        this.playNote(853, now, 0.35, 'sine', 0.12);
        this.playNote(960, now, 0.35, 'sine', 0.12);
        this.playNote(853, now + 0.5, 0.35, 'sine', 0.12);
        this.playNote(960, now + 0.5, 0.35, 'sine', 0.12);
      }
    };

    playPattern();
    this.ringtoneInterval = window.setInterval(playPattern, 2600);
  }

  public stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  public playCallAnswerTone() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.playNote(880, now, 0.1, 'sine', 0.12);
    this.playNote(1320, now + 0.1, 0.18, 'sine', 0.15);
  }

  public playCallEndTone() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // 3 rapid short beeps
    [0, 0.14, 0.28].forEach((timeOffset) => {
      this.playNote(480, now + timeOffset, 0.08, 'sine', 0.15);
      this.playNote(620, now + timeOffset, 0.08, 'sine', 0.15);
    });
  }

  private playNote(freq: number, startTime: number, duration: number, type: OscillatorType, volume: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // Ignore audio timeline errors gracefully
    }
  }
}

export const soundService = new SoundService();
