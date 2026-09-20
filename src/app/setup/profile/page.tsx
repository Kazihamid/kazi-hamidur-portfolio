"use client";

import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";
import { ProfessionalIcon } from "@/components/ProfessionalIcon";

const PROFILE_WIDTH = 1200;
const PROFILE_HEIGHT = 1500;
const MAX_UPLOAD_MB = 10;
const DEFAULT_PROFILE_IMAGE = "/images/kazi-hamidur-rahman.png";
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 2.2;
const ZOOM_STEP = 0.05;

function createProfileImage(
  sourceUrl: string,
  zoom: number,
  offsetX: number,
  offsetY: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = PROFILE_WIDTH;
        canvas.height = PROFILE_HEIGHT;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable in this browser.");

        // 100% reproduces the existing automatic centre-crop approach.
        // Moving the zoom below/above 100% lets the user reveal more or crop tighter.
        const coverScale = Math.max(
          PROFILE_WIDTH / image.naturalWidth,
          PROFILE_HEIGHT / image.naturalHeight
        );
        const scale = coverScale * zoom;
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const drawX = (PROFILE_WIDTH - drawWidth) / 2 + offsetX * PROFILE_WIDTH;
        const drawY = (PROFILE_HEIGHT - drawHeight) / 2 + offsetY * PROFILE_HEIGHT;

        context.clearRect(0, 0, PROFILE_WIDTH, PROFILE_HEIGHT);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

        resolve(canvas.toDataURL("image/webp", 0.9));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error("The selected image could not be loaded."));
    image.src = sourceUrl;
  });
}

export default function ProfileEditor() {
  const { data, update } = usePortfolio();
  const p = data.profile;
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingUrlRef = useRef("");
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);
  const [imageMessage, setImageMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);
  const [pendingImage, setPendingImage] = useState("");
  const [pendingImageSize, setPendingImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingImage, setDraggingImage] = useState(false);

  useEffect(() => {
    return () => {
      if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    };
  }, []);

  const set = (k: keyof typeof p, v: string) =>
    update((d) => {
      (d.profile as Record<string, string>)[k as string] = v;
    });

  function clearPendingImage() {
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = "";
    }
    setPendingImage("");
    setPendingImageSize({ width: 0, height: 0 });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDraggingImage(false);
    dragStateRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  }

  function resetProfileImage() {
    setImageError("");
    clearPendingImage();
    set("image", DEFAULT_PROFILE_IMAGE);
    setImageMessage("Profile image reset to the repository default. Click Save Draft to keep this change.");
  }

  function handleImageUpload(file?: File) {
    if (!file) return;

    setImageMessage("");
    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setImageError(`Please select an image smaller than ${MAX_UPLOAD_MB} MB.`);
      return;
    }

    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    pendingUrlRef.current = objectUrl;
    setPendingImage(objectUrl);
    setPendingImageSize({ width: 0, height: 0 });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setImageMessage(
      "Current automatic crop is shown at 100%. Drag the image to reposition it, adjust Zoom if needed, then click Apply Image."
    );
  }

  async function applyImage() {
    if (!pendingImage) return;

    setImageError("");
    setImageMessage("");
    try {
      setProcessingImage(true);
      const resizedImage = await createProfileImage(
        pendingImage,
        zoom,
        offset.x,
        offset.y
      );
      set("image", resizedImage);
      setImageMessage(
        `Image applied at ${Math.round(zoom * 100)}% zoom with your selected position and exported to ${PROFILE_WIDTH} × ${PROFILE_HEIGHT} px (4:5). Click Save Draft to keep it.`
      );
      clearPendingImage();
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Could not process the selected image.");
    } finally {
      setProcessingImage(false);
    }
  }

  function getOffsetLimits(nextZoom = zoom) {
    if (!pendingImageSize.width || !pendingImageSize.height) {
      return { x: 0, y: 0 };
    }

    const sourceAspect = pendingImageSize.width / pendingImageSize.height;
    const targetAspect = PROFILE_WIDTH / PROFILE_HEIGHT;
    const widthRatio = sourceAspect >= targetAspect
      ? (sourceAspect / targetAspect) * nextZoom
      : nextZoom;
    const heightRatio = sourceAspect >= targetAspect
      ? nextZoom
      : (targetAspect / sourceAspect) * nextZoom;

    return {
      x: Math.max(0, (widthRatio - 1) / 2),
      y: Math.max(0, (heightRatio - 1) / 2),
    };
  }

  function clampOffset(nextOffset: { x: number; y: number }, nextZoom = zoom) {
    const limits = getOffsetLimits(nextZoom);
    return {
      x: Math.max(-limits.x, Math.min(limits.x, nextOffset.x)),
      y: Math.max(-limits.y, Math.min(limits.y, nextOffset.y)),
    };
  }

  function updateZoom(value: number) {
    const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(value.toFixed(2))));
    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextZoom));
  }

  function handlePreviewImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    setPendingImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    setOffset((current) => clampOffset(current));
  }

  function beginImageDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (processingImage || !pendingImageSize.width) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
    setDraggingImage(true);
  }

  function moveImageDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    setOffset(
      clampOffset({
        x: drag.startOffsetX + (event.clientX - drag.startX) / rect.width,
        y: drag.startOffsetY + (event.clientY - drag.startY) / rect.height,
      })
    );
  }

  function endImageDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    setDraggingImage(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const cropImageStyle = (() => {
    if (!pendingImageSize.width || !pendingImageSize.height) {
      return {
        left: "50%",
        top: "50%",
        width: `${zoom * 100}%`,
        height: `${zoom * 100}%`,
      };
    }

    const sourceAspect = pendingImageSize.width / pendingImageSize.height;
    const targetAspect = PROFILE_WIDTH / PROFILE_HEIGHT;
    let widthPercent = 100;
    let heightPercent = 100;

    if (sourceAspect >= targetAspect) {
      widthPercent = (sourceAspect / targetAspect) * 100;
    } else {
      heightPercent = (targetAspect / sourceAspect) * 100;
    }

    return {
      left: `${50 + offset.x * 100}%`,
      top: `${50 + offset.y * 100}%`,
      width: `${widthPercent * zoom}%`,
      height: `${heightPercent * zoom}%`,
    };
  })();

  const previewImage = p.image.startsWith("data:") || p.image.startsWith("blob:")
    ? p.image
    : assetPath(p.image);

  return (
    <>
      <div className="setup-header">
        <div>
          <span className="eyebrow">CONTENT</span>
          <h1>Edit Profile</h1>
          <p>Changes stay in preview until you click Save Draft.</p>
        </div>
      </div>

      <section className="editor-grid">
        <div className="admin-card form">
          <label>
            Full Name
            <input value={p.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label>
            Professional Title
            <input value={p.title} onChange={(e) => set("title", e.target.value)} />
          </label>
          <label>
            Location
            <input value={p.location} onChange={(e) => set("location", e.target.value)} />
          </label>
          <label>
            Email
            <input value={p.email} onChange={(e) => set("email", e.target.value)} />
          </label>

          <div className="profile-image-editor">
            <div className="profile-image-editor-heading">
              <div className="profile-image-copy">
                <strong>Profile Image</strong>
                <p>
                  Output: <b>1200 × 1500 px</b>, 4:5 portrait. JPG, PNG, or WebP up to {MAX_UPLOAD_MB} MB.
                </p>
              </div>

              <div className="profile-image-actions">
                <button
                  type="button"
                  className="button setup-upload-button"
                  disabled={processingImage}
                  onClick={() => fileRef.current?.click()}
                >
                  <ProfessionalIcon name="import" className="button-icon" />
                  Upload Image
                </button>
                <button
                  type="button"
                  className="button secondary setup-reset-image-button"
                  disabled={processingImage || (p.image === DEFAULT_PROFILE_IMAGE && !pendingImage)}
                  onClick={resetProfileImage}
                  title="Restore the default repository profile image"
                >
                  <ProfessionalIcon name="improvement" className="button-icon" />
                  Reset Image
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(event) => handleImageUpload(event.target.files?.[0])}
              />
            </div>

            <p className="profile-image-help">
              The existing automatic centre-crop appears at 100%. Drag the image inside the 4:5 frame to reposition it, use Zoom for a wider or tighter fit, then apply the image.
            </p>

            {pendingImage && (
              <div className="profile-image-adjuster">
                <div
                  className={`profile-crop-stage${draggingImage ? " is-dragging" : ""}`}
                  aria-label="Profile image crop preview. Drag to reposition the image."
                  onPointerDown={beginImageDrag}
                  onPointerMove={moveImageDrag}
                  onPointerUp={endImageDrag}
                  onPointerCancel={endImageDrag}
                >
                  <img
                    src={pendingImage}
                    alt="Selected profile crop preview"
                    draggable={false}
                    onLoad={handlePreviewImageLoad}
                    style={cropImageStyle}
                  />
                  <span className="profile-crop-guide">Drag to reposition · 4:5</span>
                </div>

                <div className="profile-zoom-panel">
                  <div className="profile-zoom-heading">
                    <strong>Adjust image fit</strong>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="profile-zoom-controls">
                    <button
                      type="button"
                      className="zoom-button"
                      onClick={() => updateZoom(zoom - ZOOM_STEP)}
                      disabled={zoom <= ZOOM_MIN || processingImage}
                      aria-label="Zoom out"
                      title="Zoom out"
                    >
                      −
                    </button>
                    <input
                      className="zoom-range"
                      type="range"
                      min={ZOOM_MIN}
                      max={ZOOM_MAX}
                      step={ZOOM_STEP}
                      value={zoom}
                      disabled={processingImage}
                      onChange={(event) => updateZoom(Number(event.target.value))}
                      aria-label="Profile image zoom"
                    />
                    <button
                      type="button"
                      className="zoom-button"
                      onClick={() => updateZoom(zoom + ZOOM_STEP)}
                      disabled={zoom >= ZOOM_MAX || processingImage}
                      aria-label="Zoom in"
                      title="Zoom in"
                    >
                      +
                    </button>
                  </div>
                  <div className="profile-zoom-actions">
                    <button
                      type="button"
                      className="button secondary compact"
                      disabled={processingImage || (offset.x === 0 && offset.y === 0)}
                      onClick={() => setOffset({ x: 0, y: 0 })}
                    >
                      Center Image
                    </button>
                    <button
                      type="button"
                      className="button secondary compact"
                      disabled={processingImage || zoom === 1}
                      onClick={() => updateZoom(1)}
                    >
                      Reset to 100%
                    </button>
                    <button
                      type="button"
                      className="button compact"
                      disabled={processingImage}
                      onClick={applyImage}
                    >
                      {processingImage ? "Applying…" : "Apply Image"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {imageMessage && <p className="image-upload-message success">{imageMessage}</p>}
            {imageError && <p className="image-upload-message error">{imageError}</p>}

            <label>
              Image URL / Repository Path
              <input
                value={p.image.startsWith("data:") ? "Uploaded image (embedded in current draft)" : p.image}
                readOnly={p.image.startsWith("data:")}
                onChange={(e) => set("image", e.target.value)}
              />
            </label>
          </div>

          <label>
            Professional Summary
            <textarea rows={6} value={p.summary} onChange={(e) => set("summary", e.target.value)} />
          </label>
        </div>

        <div className="admin-card live-card">
          <span className="eyebrow">LIVE PREVIEW</span>
          <img className="admin-avatar" src={previewImage} alt={p.name} />
          <h2>{p.name}</h2>
          <p>{p.title}</p>
          <p>{p.summary}</p>
        </div>
      </section>
    </>
  );
}
