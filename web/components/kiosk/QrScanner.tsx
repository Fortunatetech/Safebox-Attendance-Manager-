"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Props = {
  onResult: (text: string) => void;
  onCancel: () => void;
};

/**
 * Full-screen camera overlay that scans for a QR code using the rear camera.
 * Pure client-side decode via jsQR — no network round-trip needed to detect a code,
 * the scanned text is only sent to the server once, as part of the sign-in/out action.
 */
export function QrScanner({ onResult, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        tick();
      } catch {
        if (!cancelled) setError("Camera access was blocked. Please allow camera permission and try again.");
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || doneRef.current) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(frame.data, frame.width, frame.height);
          if (code && code.data) {
            doneRef.current = true;
            onResult(code.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      doneRef.current = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-graphite-950/95 backdrop-blur-sm">
      <div className="relative flex w-[min(90vw,22rem)] flex-col items-center gap-5 text-center">
        {error ? (
          <>
            <p className="text-base font-medium text-brick-300">{error}</p>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl bg-graphite-700 px-4 py-3 text-sm font-semibold text-ink-100 transition-colors hover:bg-graphite-600"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-400">
              Scan the QR code at the gate
            </p>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-graphite-600 bg-graphite-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-brass-400/70" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl border border-graphite-600 bg-graphite-900/60 px-4 py-3 text-sm font-semibold text-ink-100 transition-colors hover:border-brass-500/60 hover:text-brass-300"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
