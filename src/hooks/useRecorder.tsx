import { useCallback, useRef, useState, type RefObject } from "react";
import { handleDownload } from "../utils/helpers";

const useRecorder = (streamRef: RefObject<MediaStream | null>) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = useCallback(() => {
    mediaRecorderRef.current = new MediaRecorder(streamRef.current!);
    chunks.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      setIsRecording(false);
      const blob = new Blob(chunks.current, {
        type: mediaRecorderRef.current?.mimeType,
      });
      handleDownload(blob, "recording.webm");
    };

    mediaRecorderRef.current.onstart = () => {};

    mediaRecorderRef.current.start();

    setIsRecording(true);
  }, [streamRef]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  void streamRef;
  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};

export default useRecorder;
