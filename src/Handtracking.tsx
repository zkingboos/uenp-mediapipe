import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands";
import { useEffect, useRef, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default function HandTrackingComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [squarePosition, setSquarePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      results.multiHandLandmarks.forEach((landmarks) => {
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 1,
        });
        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });
      });

      const [landmarks] = results.multiHandLandmarks;
      if (landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        // const middleTip = landmarks[12];

        const thumbIndexDistance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        if (thumbIndexDistance < 0.05) {
          setSquarePosition({
            x: indexTip.x * video.videoWidth,
            y: indexTip.y * video.videoWidth,
          });
        }
      }

      ctx.restore();
    });
    navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        canvasRef.current!.width = video.videoWidth;
        canvasRef.current!.height = video.videoHeight;
        video.play();
        updateHandLandMarks();
      };
    });

    let animationId: number = 0;
    async function updateHandLandMarks() {
      await hands.send({ image: video! });
      animationId = requestAnimationFrame(updateHandLandMarks);
    }
    return () => {
      cancelAnimationFrame(animationId);
      hands.close();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
      <canvas ref={canvasRef} />
      <div
        style={{
          position: "absolute",
          left: `${squarePosition.x}px`,
          top: `${squarePosition.y}px`,
          width: "50px",
          height: "50px",
          borderRadius: "10px",
          backgroundColor: "blue",
        }}
      />
    </div>
  );
}
