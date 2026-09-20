"use client";

import * as React from "react";
import { X, Camera, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onCaptureConfirm: (photoBase64: string) => void;
}

export function CameraCaptureModal({
  isOpen,
  title,
  subtitle,
  onClose,
  onCaptureConfirm,
}: CameraCaptureModalProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = React.useState<string | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = React.useState(false);

  // Start webcam
  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    setCapturedPhoto(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Perangkat browser ini tidak mendukung akses kamera webcam.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Webcam access error:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Akses kamera ditolak. Mohon izinkan izin kamera pada browser Anda untuk presensi."
          : "Kamera webcam tidak terdeteksi atau sedang digunakan oleh aplikasi lain."
      );
      setIsCameraActive(false);
    }
  }, []);

  // Stop webcam
  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedPhoto(null);
      setCameraError(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  // Take snapshot
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror horizontally for selfie camera feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedPhoto(base64);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCaptureConfirm(capturedPhoto);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {subtitle || "Ambil foto selfie langsung sebagai bukti kehadiran"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder / Camera Screen */}
        <div className="p-6 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-border shadow-inner">
            {cameraError ? (
              <div className="p-6 text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                <p className="text-xs font-semibold text-white/90 leading-relaxed">
                  {cameraError}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startCamera}
                  className="rounded-xl text-xs gap-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Coba Lagi</span>
                </Button>
              </div>
            ) : capturedPhoto ? (
              /* Photo Preview */
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedPhoto}
                  alt="Hasil Foto Kehadiran"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Foto Terambil</span>
                </div>
              </div>
            ) : (
              /* Live Video Stream */
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>LIVE KAMERA</span>
                </div>
                <div className="absolute inset-x-0 bottom-3 text-center pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-xs">
                    Posisikan wajah Anda tepat di tengah layar
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-700 dark:text-blue-300 text-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-[11px] leading-tight">
              Sistem mencatat verifikasi foto langsung kamera tanpa fitur upload foto untuk mencegah manipulasi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-4 text-xs font-semibold"
            >
              Batal
            </Button>

            {capturedPhoto ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetake}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Foto Ulang</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-xl px-5 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simpan Presensi</span>
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleTakeSnapshot}
                disabled={!isCameraActive}
                className="rounded-xl px-6 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              >
                <Camera className="h-4 w-4" />
                <span>Ambil Foto Kehadiran</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
