// BlurredBackground.tsx
import { Html } from "@react-three/drei";
import "./BlurredBackground.scss";

export default function BlurredBackground({
  position = [0, 0, -5],
  width = "800px",
  height = "520px",
}: {
  position?: [number, number, number];
  width?: string;
  height?: string;
}) {
  return (
    <Html
      position={position}
      transform
      occlude={false} 
      style={{ pointerEvents: 'none', scale: 2 }}
      renderOrder={-1} 
    >
      <div
        className="blurred-background"
        style={{
          width,
          height,
          borderRadius: '12px',
        }}
      />
    </Html>
  );
}
