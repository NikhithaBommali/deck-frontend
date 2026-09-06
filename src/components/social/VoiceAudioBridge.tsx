import { useEffect, useRef } from 'react';
import { useOptionalRoomSocial } from '../../context/RoomSocialContext';

export function VoiceAudioBridge() {
  const social = useOptionalRoomSocial();
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (!social?.remoteStreams) return;

    social.remoteStreams.forEach((stream, peerId) => {
      let audio = audioRefs.current.get(peerId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audioRefs.current.set(peerId, audio);
      }
      if (audio.srcObject !== stream) {
        audio.srcObject = stream;
        void audio.play().catch(() => {
          // Autoplay may require a user gesture in some browsers.
        });
      }
    });

    audioRefs.current.forEach((audio, peerId) => {
      if (!social.remoteStreams.has(peerId)) {
        audio.pause();
        audio.srcObject = null;
        audioRefs.current.delete(peerId);
      }
    });
  }, [social?.remoteStreams]);

  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.srcObject = null;
      });
      audioRefs.current.clear();
    };
  }, []);

  return null;
}
