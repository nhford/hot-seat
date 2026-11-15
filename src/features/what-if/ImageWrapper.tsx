import type { seasonRow } from "@/types/coaches";
import CoachImage from "@/ui/CoachImage";

interface Props {
  rowData: seasonRow;
  heat: string;
}

export default function ImageWrapper({ rowData, heat }: Props) {
  const threshold = 0.33;
  const value = Number(heat);
  const hasScore = Number.isFinite(value);

  return (
    <div className="w-full flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
      <div className="shrink-0 text-left order-2 sm:order-1 sm:pb-2">
        <p className="text-[clamp(0.75rem,1.25vw,1.5rem)]">
          Projected Heat <span className="hidden 2xl:inline">Index</span>
        </p>
        <div>
          <p
            className={`font-bold text-4xl md:text-6xl 2xl:text-7xl${
              hasScore ? "" : " text-white"
            }`}
            style={
              hasScore
                ? {
                    color:
                      value <= threshold
                        ? `rgba(30, 144, 255, ${1 - value})` // Dodger blue to white
                        : `rgba(220, 20, 60, ${Math.sqrt(value)})`, // Darker red after threshold
                  }
                : undefined
            }
          >
            {hasScore ? heat : "—"}
          </p>
          <p className="text-[clamp(0.75rem,1.25vw,1.5rem)]">
            Current: {rowData.prob.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1 flex justify-center sm:justify-end order-1 sm:order-2">
        <CoachImage
          rowData={rowData}
          className="w-[clamp(6rem,20vw,16rem)] max-w-full"
        />
      </div>
    </div>
  );
}
