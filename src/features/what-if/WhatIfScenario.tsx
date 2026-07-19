import SelectInput from "@/ui/Select";
import ImageWrapper from "./ImageWrapper";
import { Records, Plyf_Round, type WhatIfCoach } from "./scenario";

export type WhatIfSnapshot = {
  coach: WhatIfCoach;
  record: number;
  round: number;
  result: number;
};

interface Props {
  coach: WhatIfCoach;
  record: number;
  round: number;
  result: number | null;
  loading?: boolean;
  readOnly?: boolean;
  coachOptions?: string[];
  rowIndex?: number;
  idPrefix?: string;
  onCoachChange?: (index: number) => void;
  onRecordChange?: (record: number) => void;
  onRoundChange?: (round: number) => void;
}

export default function WhatIfScenario({
  coach,
  record,
  round,
  result,
  loading = false,
  readOnly = false,
  coachOptions,
  rowIndex = 0,
  idPrefix = "what-if",
  onCoachChange,
  onRecordChange,
  onRoundChange,
}: Props) {
  const options = coachOptions ?? [coach.display.name];
  const selectedCoach = coachOptions ? rowIndex : 0;

  return (
    <div className="flex flex-col xl:flex-row gap-4">
      <div className="w-full xl:w-1/2 min-w-0">
        <p className="text-sm md:text-base py-1">{`Next Season, `}</p>
        <div className="flex flex-row flex-wrap gap-2 py-1 md:py-2 items-center">
          <SelectInput
            name="Coach"
            value={selectedCoach}
            id={`${idPrefix}-coach`}
            border_color="white"
            text_color="white"
            minWidth="clamp(7rem, 40%, 12rem)"
            options={options}
            helper=""
            disabled={readOnly}
            onChange={(event) =>
              onCoachChange?.(parseInt(event.target.value, 10))
            }
          />
          <p className="text-sm md:text-base py-1">{`goes `}</p>
        </div>
        <div className="flex flex-row flex-wrap gap-2 py-1 md:py-2 items-center">
          <SelectInput
            name="Record"
            value={record}
            id={`${idPrefix}-record`}
            options={Records}
            border_color="white"
            text_color="white"
            minWidth="clamp(4.5rem, 25%, 7rem)"
            helper=""
            disabled={readOnly}
            onChange={(event) =>
              onRecordChange?.(parseInt(event.target.value, 10))
            }
          />
          <p className="text-sm md:text-base py-1">{` and `}</p>
          <SelectInput
            name="Playoff Result"
            value={round}
            id={`${idPrefix}-playoff_result`}
            options={Plyf_Round}
            border_color="white"
            text_color="white"
            minWidth="clamp(6rem, 35%, 10rem)"
            helper=""
            disabled={readOnly}
            onChange={(event) =>
              onRoundChange?.(parseInt(event.target.value, 10))
            }
          />
        </div>
      </div>
      <div className="w-full xl:w-1/2 min-w-0">
        <ImageWrapper
          rowData={coach.display}
          heat={typeof result === "number" ? result.toFixed(2) : "Loading..."}
          loading={loading}
        />
      </div>
    </div>
  );
}
