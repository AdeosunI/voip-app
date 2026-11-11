import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useEffectEvent,
} from "react";

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

  const handleDeviceChange = useEffectEvent(async (isActive: () => boolean) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!isActive()) return;

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
      if (isActive()) {
        setErrorMessage("Could not read the available media devices.");
      }
    }
  });

  useEffect(() => {
    let isActive = false;

    async function initialize() {
      const stream = await showStream();
      if (!stream) return;

      if (!isActive) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      handleDeviceChange(() => isActive);
    }

    const handler = () => {
      handleDeviceChange(() => isActive);
    };

    void initialize();
    navigator.mediaDevices.addEventListener("devicechange", handler);

    return () => {
      isActive = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      navigator.mediaDevices.removeEventListener("devicechange", handler);
    };
  }, [showStream]);

  function handleCameraChange(nextCameraId: string) {
    showStream(nextCameraId, micId);
  }

  function handleMicChange(nextMicId: string) {
    showStream(cameraId, nextMicId);
  }

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setVideoIsEnabled(videoTracks[0].enabled);
      }
    }
  }, [setVideoIsEnabled, streamRef]);

  const toggleMicrophone = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setMicIsEnabled(audioTracks[0].enabled);
      }
    }
  }, [setMicIsEnabled, streamRef]);

  return {
    cameras,
    mics,
    cameraId,
    micId,
    errorMessage,
    videoRef,
    streamRef,
    micIsEnabled,
    videoIsEnabled,
    streamIsLive,
    handleCameraChange,
    handleMicChange,
    toggleCamera,
    toggleMicrophone,
  };
};

export default useStream;
