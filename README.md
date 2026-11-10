# VOIP App

A browser-based audio and video recorder. Choose a camera and microphone, preview the live stream, toggle either device, and record the stream to a video file.

## Requirements

- Node.js and npm
- A modern browser with camera and microphone access

## Run locally

1. Clone the repository and open the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed in the terminal (usually `http://localhost:5173`).
5. Allow the browser to access your camera and microphone when prompted.

Use the device selectors to choose your camera and microphone. Select **Record** to begin recording and **Stop Recording** to finish and download it.

## Other commands

```bash
npm run build    # Type-check and create a production build in dist/
npm run preview  # Serve the production build locally
npm run lint     # Run ESLint
```
