import { useCallback, useEffect, useRef, useState } from "react";

const useStream = () => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [micId, setMicId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [streamIsLive, setStreamIsLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micIsEnabled, setMicIsEnabled] = useState(false);
  const [videoIsEnabled, setVideoIsEnabled] = useState(false);

  const showStream = useCallback(
    async (nextCameraId?: string | null, nextMicId?: string | null) => {
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setVideoIsEnabled(false);
        setMicIsEnabled(false);
        setStreamIsLive(false);

        if (nextCameraId) {
          setCameraId(nextCameraId);
        }
        if (nextMicId) {
          setMicId(nextMicId);
        }

        const nextStream = await navigator.mediaDevices.getUserMedia({
          video: nextCameraId ? { deviceId: { exact: nextCameraId } } : true,
          audio: nextMicId ? { deviceId: { exact: nextMicId } } : true,
        });

        streamRef.current = nextStream;
        if (videoRef.current) videoRef.current.srcObject = nextStream;

        setCameraId(
          nextStream.getVideoTracks()[0]?.getSettings().deviceId ?? null,
        );
        setMicId(
          nextStream.getAudioTracks()[0]?.getSettings().deviceId ?? null,
        );
        setVideoIsEnabled(true);
        setMicIsEnabled(true);
        setStreamIsLive(true);
        setErrorMessage("");

        return nextStream;
      } catch (error) {
        console.error("Could not access media devices.", error);
        setErrorMessage("Could not access the selected camera or microphone.");
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const stream = await showStream();
      if (!stream) return;

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      if (cancelled) return;

      setCameras(devices.filter((d) => d.kind === "videoinput"));
      setMics(devices.filter((d) => d.kind === "audioinput"));
    }

    void initialize();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [showStream]);

  useEffect(() => {
    let active = true;

    async function handleDeviceChange() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!active) return;

        const nextCameras = devices.filter((d) => d.kind === "videoinput");
        const nextMics = devices.filter((d) => d.kind === "audioinput");

        setCameras(nextCameras);
        setMics(nextMics);

        const nextCameraId = nextCameras.some((d) => d.deviceId === cameraId)
          ? cameraId
          : (nextCameras[0]?.deviceId ?? null);

        const nextMicId = nextMics.some((d) => d.deviceId === micId)
          ? micId
          : (nextMics[0]?.deviceId ?? null);

        if (nextCameraId !== cameraId || nextMicId !== micId) {
          if (nextCameraId && nextMicId) {
            await showStream(nextCameraId, nextMicId);
          }
        }
      } catch {
        if (active) {
          setErrorMessage("Could not read the available media devices.");
        }
      }
    }

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      active = false;
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [cameraId, micId, showStream]);

  return {
    cameras,
    mics,
    cameraId,
    micId,
    errorMessage,
    videoRef,
    streamRef,
    micIsEnabled,
    setMicIsEnabled,
    videoIsEnabled,
    setVideoIsEnabled,
    showStream,
    streamIsLive,
  };
};

export default useStream;
