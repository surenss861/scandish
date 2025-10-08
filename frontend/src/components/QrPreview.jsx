import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrPreview({ url = "https://scandish.ca", size = 200 }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        setQrDataUrl(dataUrl);
        setError("");
      } catch (err) {
        console.error('QR Generation failed:', err);
        setError("Failed to generate QR code");
      }
    };

    generateQR();
  }, [url, size]);

  if (error) {
    return (
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">QR code unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-56 h-56 flex items-center justify-center">
      <div className="absolute inset-0 rounded-lg bg-[#702632] opacity-20 animate-pulseQR" />
      <div className="relative z-10 bg-white p-4 rounded-lg shadow-lg">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="w-48 h-48"
            loading="eager"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-48 h-48 bg-gray-100 animate-pulse rounded flex items-center justify-center">
            <span className="text-gray-400 text-sm">Generating...</span>
          </div>
        )}
      </div>
    </div>
  );
}
