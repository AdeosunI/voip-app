import { useCallback, useEffect, useRef, useState } from "react";
import cameraIcon from "./assets/icons/camera.svg";
import cameraDisabledIcon from "./assets/icons/camera-off.svg";
import microphoneIcon from "./assets/icons/microphone.svg";
import microphoneDisabledIcon from "./assets/icons/microphone-off.svg";
import MicrophoneToggleButton from "./device-selectors/MicrophoneToggleButton";
import "./App.css";
import CameraSelector from "./device-selectors/CameraToggleButton";

function App() {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [micId, setMicId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioOutputRef = useRef<HTMLAudioElement>(null);
  const [isHoveringOverVideo, setIsHoveringOverVideo] = useState(false);
  const [micIsEnabled, setMicIsEnabled] = useState(false);
  const [videoIsEnabled, setVideoIsEnabled] = useState(false);
  // const { showStream } = useStream();

  const showStream = useCallback(
    async (newCameraId?: string, newMicId?: string) => {
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());

        const stream = await navigator.mediaDevices.getUserMedia({
          video:
            newCameraId !== undefined
              ? { deviceId: { exact: newCameraId } }
              : true,
          audio:
            newMicId !== undefined ? { deviceId: { exact: newMicId } } : true,
        });

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        if (newCameraId == undefined) {
          newCameraId = stream.getVideoTracks()[0]!.getSettings().deviceId!;
        }
        if (newMicId == undefined) {
          newMicId = stream.getAudioTracks()[0]!.getSettings().deviceId!;
        }

        setMicIsEnabled(true);
        setVideoIsEnabled(true);

        return {
          newCameraId,
          newMicId,
        };
      } catch (error) {
        console.error("Error accessing media devices.", error);
        return { newCameraId: null, newMicId: null };
      }
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const updateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!isMounted) return;

        const nextCameras = devices.filter(
          (device) => device.kind === "videoinput",
        );
        const nextMics = devices.filter(
          (device) => device.kind === "audioinput",
        );

        setCameras(nextCameras);
        setMics(nextMics);
        setCameraId((current) =>
          nextCameras.some((device) => device.deviceId === current)
            ? current
            : (nextCameras[0]?.deviceId ?? null),
        );
        setMicId((current) =>
          current === "default" ||
          nextMics.some((device) => device.deviceId === current)
            ? current
            : (nextMics[0]?.deviceId ?? null),
        );
      } catch {
        if (isMounted)
          setErrorMessage("Could not read the available media devices.");
      }
    };

    const initialize = async () => {
      const { newCameraId, newMicId } = await showStream();
      if (!isMounted) return;

      setCameraId(newCameraId);
      setMicId(newMicId);
      navigator.mediaDevices.addEventListener("devicechange", updateDevices);
      await updateDevices();
    };

    void initialize();

    return () => {
      isMounted = false;
      navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [showStream]);

  function handleCameraChange(nextId: string) {
    setCameraId(nextId);
    if (streamRef.current) showStream(nextId, micId);
  }

  function handleMicChange(nextId: string) {
    setMicId(nextId);
    if (streamRef.current) showStream(cameraId, nextId);
  }

  function toggleCamera() {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setVideoIsEnabled(videoTracks[0].enabled);
      }
    }
  }

  function toggleMicrophone() {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setMicIsEnabled(audioTracks[0].enabled);
      }
    }
  }

  const showControlButtons =
    isHoveringOverVideo || (!micIsEnabled && !videoIsEnabled);

  return (
    <main className="device-console">
      <h1>Devices</h1>

      <div
        className="video-frame"
        onMouseEnter={() => setIsHoveringOverVideo(true)}
        onMouseLeave={() => setIsHoveringOverVideo(false)}
      >
        <video ref={videoRef} autoPlay playsInline muted />
        {showControlButtons && (
          <div className="stream-controls" aria-label="stream controls">
            <button
              onClick={toggleCamera}
              type="button"
              className="stream-control"
              aria-label="Toggle camera"
              title="Toggle camera"
            >
              <img
                src={videoIsEnabled ? cameraIcon : cameraDisabledIcon}
                alt=""
              />
            </button>
            <button
              onClick={toggleMicrophone}
              type="button"
              className="stream-control"
              aria-label="Toggle microphone"
              title="Toggle microphone"
            >
              <img
                src={micIsEnabled ? microphoneIcon : microphoneDisabledIcon}
                alt=""
              />
            </button>
          </div>
        )}
      </div>

      <button disabled={!videoIsEnabled && !micIsEnabled}>Record video</button>

      <div className="device-selectors">
        <CameraSelector
          cameraId={cameraId}
          onChange={(event) => handleCameraChange(event.target.value)}
          cameras={cameras}
        />

        <MicrophoneToggleButton
          micId={micId}
          onChange={(event) => handleMicChange(event.target.value)}
          mics={mics}
        />
      </div>

      <audio ref={audioOutputRef} hidden />
      {errorMessage && (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      )}
    </main>
  );
}

export default App;
