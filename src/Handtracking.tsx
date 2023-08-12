import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands";
import { useEffect, useRef } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default function HandTrackingComponent({ setHands }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

      results.multiHandedness.forEach((hand) => {
        const landmarks = results.multiHandLandmarks[hand.index];
        if (!landmarks) return;

        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: hand.label === "Left" ? "#00FF00" : "#FF0000",
          lineWidth: 1,
        });
        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });

        setHands((old: any) => {
          return {
            left: hand.label === "Left" ? landmarks : old.left,
            right: hand.label === "Right" ? landmarks : old.right,
          };
        });
      });

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
    </div>
  );
}
