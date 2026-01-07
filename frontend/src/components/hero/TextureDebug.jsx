import { useEffect, useRef } from "react";
import { usePhoneDemoTexture } from "../../hooks/usePhoneDemoTexture.js";

// Debug component to show canvas texture in 2D
export default function TextureDebug() {
  const canvasRef = useRef(null);
  const texture = usePhoneDemoTexture();

  useEffect(() => {
    if (!canvasRef.current || !texture || !texture.image) return;

    const debugCanvas = canvasRef.current;
    const ctx = debugCanvas.getContext("2d");
    
    // Set debug canvas size
    debugCanvas.width = texture.image.width / 4;
    debugCanvas.height = texture.image.height / 4;
    
    // Draw the texture to debug canvas
    const draw = () => {
      if (texture.image) {
        ctx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
        ctx.drawImage(texture.image, 0, 0, debugCanvas.width, debugCanvas.height);
      }
      requestAnimationFrame(draw);
    };
    
    draw();
  }, [texture]);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 p-2 rounded border border-green-500">
      <p className="text-xs text-green-400 mb-1">Texture Debug</p>
      <canvas
        ref={canvasRef}
        className="border border-green-500"
        style={{ width: "150px", height: "320px", imageRendering: "pixelated" }}
      />
    </div>
  );
}

