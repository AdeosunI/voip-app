import "./App.css";
import Selector from "./components/Selector";
import useStream from "./hooks/useStream";
import useRecorder from "./hooks/useRecorder";
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
    videoIsEnabled,
    streamIsLive,
    handleCameraChange,
    handleMicChange,
    toggleCamera,
    toggleMicrophone,
  } = useStream();

  const { isRecording, startRecording, stopRecording } = useRecorder(streamRef);

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
