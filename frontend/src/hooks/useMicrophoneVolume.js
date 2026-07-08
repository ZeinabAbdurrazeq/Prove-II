import { useEffect, useRef, useState } from "react";

export default function useMicrophoneVolume(isListening = true) {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let stream = null;
    
    async function startListening() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        
        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          
          // Map average (0-255) to a 0-1 scale smoothly, using a slight ease
          let normalized = Math.min(average / 100, 1);
          // Apply a bit of easing/smoothing
          setVolume((prev) => prev + (normalized - prev) * 0.3);
          
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
      } catch (err) {
        console.error("Microphone access denied for volume analysis", err);
      }
    }

    if (isListening) {
      startListening();
    } else {
      setVolume(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isListening]);

  return volume;
}
