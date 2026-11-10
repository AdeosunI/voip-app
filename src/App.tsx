import "./App.css";
import Selector from "./components/Selector";
import useStream from "./hooks/useStream";
import useRecorder from "./hooks/useRecorder";
import { useCallback } from "react";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const {
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
  } = useStream();

  const { isRecording, startRecording, stopRecording } = useRecorder(streamRef);

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

  return (
    <main className="device-console">
      <div className="video-shell">
        <button
          type="button"
          className={`record-button ${isRecording ? "is-recording" : ""}`}
          disabled={!streamIsLive}
          onClick={() => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          }}
        >
          {isRecording ? "Stop Recording" : "Record"}
        </button>

        <VideoPlayer
          micIsEnabled={micIsEnabled}
          videoIsEnabled={videoIsEnabled}
          videoRef={videoRef}
          toggleCamera={toggleCamera}
          toggleMicrophone={toggleMicrophone}
        />
      </div>

      <div className="device-selectors">
        <Selector
          id={cameraId}
          onChange={(event) => handleCameraChange(event.target.value)}
          devices={cameras}
          type="Camera"
        />

        <Selector
          id={micId}
          onChange={(event) => handleMicChange(event.target.value)}
          devices={mics}
          type="Microphone"
        />
      </div>

      {errorMessage && (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      )}
    </main>
  );
}

export default App;
