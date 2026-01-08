/**
 * @file src/api/utils/ImgView.jsx
 * @description 마이페이지에서 사진 클릭 시 모달 띄우는 처리
 * 250108 v1.0.0 wook init
 */

import { useEffect } from "react";
import "./ImgView.css";

export default function ImgView({ isOpen, onClose, src, alt = "image" }) {
  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="imgview-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <button
        type="button"
        className="imgview-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        aria-label="Close"
      >
        ✕
      </button>

      <div
        className="imgview-box"
        onClick={(e) => e.stopPropagation()} // 박스 내부 클릭은 닫히지 않게
      >
        <div className="imgview-inner">
          <img className="imgview-img" src={src} alt={alt} />
        </div>
      </div>
    </div>
  );
}
