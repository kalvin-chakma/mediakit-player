"use client";

import { RiPictureInPicture2Fill } from "react-icons/ri";
import { useMedia } from "../hooks/useMedia";

export default function PictureInPicture() {
  const { togglePictureInPicture } = useMedia();

  return (
    <div
      className="p-2 hover:bg-neutral-600 rounded transition-colors text-sm sm:text-base pointer-events-auto cursor-pointer"
      onClick={togglePictureInPicture}
    >
      <RiPictureInPicture2Fill />
    </div>
  );
}
