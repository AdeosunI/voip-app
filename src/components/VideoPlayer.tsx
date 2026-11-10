import { memo, useState, type Ref } from "react";
import cameraIcon from "../assets/icons/camera.svg";
import cameraDisabledIcon from "../assets/icons/camera-off.svg";
import microphoneIcon from "../assets/icons/microphone.svg";
import microphoneDisabledIcon from "../assets/icons/microphone-off.svg";
import "./VideoPlayer.css";

type VideoPlayerProps = {
  micIsEnabled: boolean;
  videoIsEnabled: boolean;
  videoRef: Ref<HTMLVideoElement | null>;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
};

const VideoPlayer = memo(
  ({
    micIsEnabled,
    videoIsEnabled,
    videoRef,
    toggleCamera,
    toggleMicrophone,
  }: VideoPlayerProps) => {
    const [isHoveringOverVideo, setIsHoveringOverVideo] = useState(false);

    const showControlButtons =
      isHoveringOverVideo || (!micIsEnabled && !videoIsEnabled);

    return (
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
    );
  },
);

export default VideoPlayer;
