"use client";

import { useCallback, useRef, useState } from "react";

export interface UseAudioPitchOptions {
  minPitch?: number;
  maxPitch?: number;
  minSpeed?: number;
  maxSpeed?: number;
  updateInterval?: number;
  throttleInterval?: number;
}

export interface UseAudioPitchReturn {
  speed: number;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export function useAudioPitch(options: UseAudioPitchOptions = {}): UseAudioPitchReturn {
  const {
    minPitch = 80,
    maxPitch = 1000,
    minSpeed = 1,
    maxSpeed = 6,
    updateInterval = 200,
    throttleInterval = 150,
  } = options;

  const [speed, setSpeed] = useState(minSpeed);
  const [isRecording, setIsRecording] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentSpeedRef = useRef(minSpeed);
  const lastUpdateTimeRef = useRef(0);

  // Pitch detection using FFT frequency domain analysis
  const detectPitch = useCallback(
    (analyser: AnalyserNode, sampleRate: number): number => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Find the peak frequency in the voice range
      const nyquist = sampleRate / 2;
      const minBin = Math.floor((minPitch / nyquist) * bufferLength);
      const maxBin = Math.floor((maxPitch / nyquist) * bufferLength);

      let maxValue = 0;
      let maxIndex = 0;

      // Find the strongest frequency component
      for (let i = minBin; i <= maxBin && i < bufferLength; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }

      // Skip if signal is too weak
      if (maxValue < 10) return 0;

      // Convert bin index to frequency
      const frequency = (maxIndex / bufferLength) * nyquist;

      // Validate frequency is in human voice range
      if (frequency < minPitch || frequency > maxPitch) return 0;

      return frequency;
    },
    [minPitch, maxPitch],
  );

  // Map pitch (Hz) to speed range
  const mapPitchToSpeed = useCallback(
    (pitch: number): number => {
      const normalized = Math.max(0, Math.min(1, (pitch - minPitch) / (maxPitch - minPitch)));
      const curved = Math.sqrt(normalized);
      return minSpeed + curved * (maxSpeed - minSpeed);
    },
    [minPitch, maxPitch, minSpeed, maxSpeed],
  );

  const processAudio = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    // Throttle updates to avoid excessive computation
    const now = performance.now();
    if (now - lastUpdateTimeRef.current < throttleInterval) return;
    lastUpdateTimeRef.current = now;

    const pitch = detectPitch(analyserRef.current, audioContextRef.current.sampleRate);

    if (pitch > 200) {
      let newSpeed = mapPitchToSpeed(pitch);
      newSpeed = Math.round(newSpeed * 10) / 10;
      newSpeed = Math.max(minSpeed, Math.min(maxSpeed, newSpeed));

      // Only update if there's a meaningful change (0.1 threshold)
      if (Math.abs(newSpeed - currentSpeedRef.current) >= 0.1) {
        currentSpeedRef.current = newSpeed;
        setSpeed(newSpeed);
      }
    } else {
      if (currentSpeedRef.current > minSpeed) {
        currentSpeedRef.current = minSpeed;
        setSpeed(minSpeed);
      }
    }
  }, [detectPitch, mapPitchToSpeed, minSpeed, maxSpeed, throttleInterval]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsRecording(true);

      // Process audio at specified interval
      audioIntervalRef.current = setInterval(processAudio, updateInterval);
      processAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [processAudio, updateInterval]);

  const stopRecording = useCallback(() => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsRecording(false);
    currentSpeedRef.current = minSpeed;
    setSpeed(minSpeed);
  }, [minSpeed]);

  return {
    speed,
    isRecording,
    startRecording,
    stopRecording,
  };
}
