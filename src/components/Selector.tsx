import { type ComponentProps } from "react";
import "./Selector.css";

type Selector = {
  id: string | null;
  onChange: ComponentProps<"select">["onChange"];
  devices: MediaDeviceInfo[];
  type: "Camera" | "Microphone";
};

export default function Selector({ id, onChange, devices, type }: Selector) {
  return (
    <label className="device-field">
      <span>{type}</span>
      <select value={id ?? ""} onChange={onChange}>
        {devices.map((device, index) => (
          <option key={`${device.deviceId}-${index}`} value={device.deviceId}>
            {device.label || `${type} ${index + 1}`}
          </option>
        ))}
      </select>
    </label>
  );
}
