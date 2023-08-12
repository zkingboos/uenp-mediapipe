import { NormalizedLandmarkList } from "@mediapipe/hands";
import { RefObject, useEffect, useRef, useState } from "react";
import HandtrackingComponent from "./Handtracking";

function PongGame() {
  const fingerIndex = 9;
  const playerOneRef = useRef<HTMLDivElement>(null);
  const playerTwoRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const [ball, setBall] = useState({ x: 50, y: 50, dx: 10, dy: 10 });
  const [playerX, setPlayerX] = useState({ y: 0 });
  const [playerY, setPlayerY] = useState({ y: 0 });

  const [hands, setHands] = useState<{
    left: NormalizedLandmarkList;
    right: NormalizedLandmarkList;
  }>({
    left: [],
    right: [],
  });

  useEffect(() => {
    if (!arenaRef.current || !playerOneRef.current || !playerTwoRef.current)
      return;
    const arena = arenaRef.current.getBoundingClientRect();
    const playerOneBounding = playerOneRef.current.getBoundingClientRect();
    const playerTwoBounding = playerTwoRef.current.getBoundingClientRect();

    const left = hands.left[fingerIndex]?.y ?? 0;
    const right = hands.right[fingerIndex]?.y ?? 0;

    const oneMaxPaddleY = arena.height - playerOneBounding.height;
    const twoMaxPaddleY = arena.height - playerTwoBounding.height;
    const onePaddleY = Math.max(
      0,
      Math.min(left * arena.height, oneMaxPaddleY)
    );
    const twoPaddleY = Math.max(
      0,
      Math.min(right * arena.height, twoMaxPaddleY)
    );
    setPlayerX({ y: onePaddleY });
    setPlayerY({ y: twoPaddleY });
  }, [hands]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (
        !arenaRef.current ||
        !ballRef.current ||
        !playerOneRef.current ||
        !playerTwoRef.current
      )
        return;
      const arena = arenaRef.current.getBoundingClientRect();
      const playerOneBounding = playerOneRef.current.getBoundingClientRect();
      const playerTwoBounding = playerTwoRef.current.getBoundingClientRect();
      const ballBounding = ballRef.current.getBoundingClientRect();

      const ballMaxX = arena.width - ballBounding.width - 10;
      const ballMaxY = arena.height - ballBounding.height - 10;

      const newBallX = ball.x + ball.dx;
      const newBallY = ball.y + ball.dy;

      const nextDy =
        newBallY <= 10 || newBallY >= ballMaxY ? -ball.dy : ball.dy;

      if (newBallX <= 10 || newBallX >= ballMaxX) {
        alert("Game Over");
        setBall({
          x: arena.width / 2,
          y: arena.height / 2,
          dx: -ball.dx,
          dy: ball.dy,
        });
        return;
      }

      setBall({ x: newBallX, y: newBallY, dx: ball.dx, dy: nextDy });
      if (
        newBallX <= playerOneBounding.right &&
        newBallX + ballBounding.width >= playerOneBounding.left &&
        newBallY + ballBounding.height >= playerX.y &&
        newBallY <= playerX.y + playerOneBounding.height
      ) {
        const relativeIntersectY =
          newBallY +
          ballBounding.height / 2 -
          (playerX.y + playerOneBounding.height / 2);
        const normalizedRelativeIntersectY =
          relativeIntersectY / (playerOneBounding.height / 2);
        const bounceAngle = normalizedRelativeIntersectY * (Math.PI / 4);

        const newDx =
          -Math.sign(ball.dx) * Math.cos(bounceAngle) * Math.abs(ball.dx);
        const newDy = -Math.sin(bounceAngle) * Math.abs(ball.dy);

        setBall({ ...ball, dx: newDx, dy: newDy });
      }

      if (
        newBallX + ballBounding.width >= playerTwoBounding.left &&
        newBallY + ballBounding.height >= playerY.y &&
        newBallY <= playerY.y + playerTwoBounding.height
      ) {
        const relativeIntersectY =
          newBallY +
          ballBounding.height / 2 -
          (playerY.y + playerTwoBounding.height / 2);
        const normalizedRelativeIntersectY =
          relativeIntersectY / (playerTwoBounding.height / 2);
        const bounceAngle = normalizedRelativeIntersectY * (Math.PI / 4);

        const newDx =
          -Math.sign(ball.dx) * Math.cos(bounceAngle) * Math.abs(ball.dx);
        const newDy = -Math.sin(bounceAngle) * Math.abs(ball.dy);

        setBall({ ...ball, dx: newDx, dy: newDy });
      }
    }, 16);

    return () => {
      clearInterval(gameLoop);
    };
  }, [ball]);

  return (
    <div
      ref={arenaRef}
      className="w-full h-full bg-default bg-cover bg-center bg-no-repeat"
    >
      <div className="absolute top-0 right-0">
        <HandtrackingComponent setHands={setHands} />
      </div>
      <div className="flex justify-between w-full h-full relative">
        <div className="absolute left-2">
          <PlayerBar playerRef={playerOneRef} player={playerX} side="left" />
        </div>
        <div className="absolute right-8">
          <PlayerBar playerRef={playerTwoRef} player={playerY} side="right" />
        </div>
      </div>
      <div
        ref={ballRef}
        className="absolute p-8 bg-white rounded-full shadow"
        style={{
          top: `${ball.y}px`,
          left: `${ball.x}px`,
        }}
      ></div>
    </div>
  );
}

interface PlayerBarProps {
  playerRef: RefObject<HTMLDivElement>;
  player: { y: number };
  side: "left" | "right";
}

function PlayerBar(props: PlayerBarProps) {
  return (
    <div className="relative">
      <div
        ref={props.playerRef}
        className="bg-white h-48 w-6 rounded absolute"
        style={{
          top: `${props.player.y}px`,
        }}
      ></div>
    </div>
  );
}

export default PongGame;
