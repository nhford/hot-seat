import type { coachRow } from "@/types/coaches";

interface Props {
  history: coachRow;
}

function YearList({ years, label }: { years: number[]; label: string }) {
  if (years.length === 0) return null;
  return (
    <div className="w-full lg:pt-1 my-0.5">
      <p className="text-xs px-1 pb-1">{label}</p>
      <div className="w-full grid grid-cols-auto-fit gap-0.5 text-center">
        {years.map((year) => (
          <p key={year} className="text-xs">
            {year}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function CoachAwards({ history }: Props) {
  const sb_years = history.rounds.reduce((acc: number[], e: number, i: number) => {
    if (e === 5) acc.push(history.years[i]);
    return acc;
  }, []);
  const plyf_years = history.rounds.reduce(
    (acc: number[], e: number, i: number) => {
      if (e > 0) acc.push(history.years[i]);
      return acc;
    },
    [],
  );
  const [coy_cumulative, coy_years, coy_ranks] = history.coy_shares.reduce(
    (acc: [number, number[], number[]], e: number, i: number) => {
      acc[0] += e;
      if (e > 0) {
        acc[1].push(history.years[i]);
        acc[2].push(history.coy_ranks[i]);
      }
      return acc;
    },
    [0, [], []],
  );
  return (
    <div className="w-full text-center">
      <p className="text-sm md:text-base font-bold my-1">Trophy Case</p>
      <div className="flex flex-row gap-2 text-xs md:text-sm">
        {/* Super Bowl */}
        <div className="w-1/4 text-center">
          <p>{`Super Bowls: x${sb_years.length}`}</p>
          {sb_years.length === 0 ? null : (
            <div className="flex flex-row flex-wrap gap-1 justify-center">
              {sb_years.map((year) => (
                <img
                  key={year}
                  src="images/misc/super_bowl.png"
                  className="w-8 lg:w-12"
                  alt="super bowl trophy"
                />
              ))}
            </div>
          )}
          <YearList years={sb_years} label="years won:" />
        </div>
        {/* Postseason */}
        <div className="w-2/5 text-center">
          <p>
            <span className="expand:hidden 2xl:inline">
              {`Postseason Appearances: x${plyf_years.length}`}
            </span>
            <span className="hidden expand:inline 2xl:hidden">
              {`Postseason Apps: x${plyf_years.length}`}
            </span>
          </p>
          {plyf_years.length === 0 ? null : (
            <div className="flex flex-row flex-wrap gap-1 justify-center">
              {plyf_years.map((year) => (
                <img
                  key={year}
                  src="images/misc/playoffs_blank.png"
                  className="w-8 lg:w-12"
                  alt="playoff trophy"
                />
              ))}
            </div>
          )}
        </div>
        {/* Coach of Year Share */}
        <div className="w-[35%] items-center justify-center">
          <p>
            <span className="expand:hidden 2xl:inline">Coach of Year Share</span>
            <span className="hidden expand:inline 2xl:hidden">COY Share</span>
          </p>
          <div className="flex flex-row justify-center items-center">
            <div className="">
              <img
                key="coach of year award"
                src="images/misc/coy.png"
                className="w-4 lg:w-6"
                alt="coach of year trophy"
              />
            </div>
            <div className="text-center">
              <p className="text-base md:text-lg p-1">{coy_cumulative.toFixed(3)}</p>
            </div>
          </div>

          <div className="w-full flex flex-row text-center items-center lg:pt-1 my-0.5 mx-2">
            <div className="w-full">
              {coy_years.length === 0 ? null : (
                <>
                  <p className="text-xs px-1 pb-1">
                    {"years receiving votes:"}
                  </p>
                  <div className="w-full grid grid-cols-auto-fit gap-0.5 text-center">
                    {coy_years.map((year, i) => (
                      <p
                        key={year}
                        className={`text-xs ${coy_ranks[i] === 1 ? "font-bold" : ""}`}
                      >
                        {year}
                      </p>
                    ))}
                  </div>
                  {Math.min(...coy_ranks.filter((rank) => rank > 0)) == 1 ? (
                    <p className="text-xs italic px-1 py-1">
                      {"("}
                      <span className="font-bold">{"bold"}</span>
                      {" indicates winner)"}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
