import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  // optimizeDeps: {
  //   include: [
  //     "@mediapipe/hands",
  //     "@mediapipe/drawing_utils",
  //     "@mediapipe/camera_utils",
  //     "@mediapipe/control_utils",
  //   ],
  // },
});
