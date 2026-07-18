import { useState } from "react";
import type { seasonRow } from "@/types/coaches";
import { DEFAULT_COACH_IMAGE, coachImagePath } from "@/lib/coaches/images";

interface Props {
  rowData: seasonRow;
  className?: string;
}

export default function CoachImage({ rowData, className }: Props) {
  const [failedId, setFailedId] = useState<string | null>(null);
  const src =
    failedId === rowData.id
      ? DEFAULT_COACH_IMAGE
      : coachImagePath(rowData.id);

  return (
    <div className="relative z-0">
      <img
        src={src}
        alt={rowData.name}
        className={className ?? "w-[clamp(6rem,20vw,16rem)] max-w-full"}
        decoding="async"
        onError={() => setFailedId(rowData.id)}
      />
    </div>
  );
}
