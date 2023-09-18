import { useLoaderData } from "react-router-dom";
import { usePunches, useRocInfo } from "./roc-api";
import { format, formatRelative } from "date-fns";
import { sv } from "date-fns/locale";

const onlineTimeout = 5 * 60 * 1000;
const futureTolerance = -5 * 1000;

export default function RocInfo() {
  const { unitId } = useLoaderData() as { unitId: string };
  const { data, error } = useRocInfo(unitId);
  const { data: punchData } = usePunches(unitId);
  const roc = data?.roc;
  const now = new Date();

  return (
    <div className="absolute flex flex-col w-full h-screen overflow-auto bg-slate-900">
      <div className="text-amber-500 text-lg font-bold px-4 py-1 font-serif italic">
        ROC ON
      </div>
      <div
        className={`w-full flex-grow flex flex-col overflow-auto py-2 text-slate-400 ${
          error ? "opacity-30" : ""
        }`}
      >
        {roc && (
          <>
            <div className="px-4 pb-2 border-b border-slate-700">
              <div className="flex flex-row justify-between">
                <h1 className="text-4xl font-bold text-slate-200">
                  {roc.name}
                </h1>
                <div className="text-sm text-slate-400 text-right ml-2">
                  <>
                    {roc.online ? (
                      <div className="text-green-500">Online</div>
                    ) : (
                      <div className="text-slate-600">Offline</div>
                    )}
                    {roc.punchLast5 ? (
                      <div className="text-green-500">Nystämplad</div>
                    ) : (
                      <div className="text-slate-600">Ej nyligen stämplad</div>
                    )}
                  </>
                </div>
              </div>
              <div className="flex flex-row justify-between items-end">
                <div>
                  <div className="text-lg">{roc.competition}</div>
                  <div className="text-sm">{roc.description}</div>
                </div>
                <div className="text-sm text-slate-600">{roc.version}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 border-b border-slate-700">
              <div className="text-slate-600">Senaste kontakt</div>
              <div className={`text-right ${timeClass(roc.lastContact, now)}`}>
                {formatRelative(roc.lastContact, new Date(), {
                  locale: sv,
                })}
                <br />
                <span className="text-xs text-slate-400">
                  {format(roc.lastContact, "yyyy-MM-dd HH:mm:ss")}
                </span>
              </div>
              <div className="text-slate-600">Boot</div>
              <div
                className={`text-right ${timeClass(roc.lastBootCallHome, now)}`}
              >
                {formatRelative(roc.lastBootCallHome, new Date(), {
                  locale: sv,
                })}
                <br />
                <span className="text-xs text-slate-400">
                  {format(roc.lastBootCallHome, "yyyy-MM-dd HH:mm:ss")}
                </span>
              </div>
            </div>
            {punchData?.punches && (
              <div className="py-2">
                {punchData.punches.length > 0 ? (
                  <>
                    <h2 className="text-slate-200 px-4 mb-2">Stämplingar</h2>
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="text-slate-600 text-left">
                          <th className="pl-4 font-normal">Tid</th>
                          <th className="font-normal">Kontroll</th>
                          <th className="pr-4 font-normal text-right">SI</th>
                        </tr>
                      </thead>
                      {punchData.punches.map((punch, i) => (
                        <tr key={i} className="align-top even:bg-slate-800">
                          <td className="py-1 pl-4">
                            <span className={timeClass(punch.time, now)}>
                              {formatRelative(punch.time, now, { locale: sv })}
                            </span>
                            <br />
                            <span className="text-slate-600">
                              {format(punch.time, "yyyy-MM-dd HH:mm:ss.SSS")}
                            </span>
                          </td>
                          <td>{punch.control}</td>
                          <td className="pr-4 text-right">
                            {punch.siNumber}
                            <br />
                            <span className="text-slate-600">{punch.type}</span>
                          </td>
                        </tr>
                      ))}
                    </table>
                  </>
                ) : (
                  <h2 className="text-slate-600 px-4 mb-2">
                    Inga registrerade stämplingar
                  </h2>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="text-sm px-4 py-1 text-slate-400">
        {!error && data?.lastUpdated ? (
          <div>
            <span className="text-green-500">✓</span>{" "}
            {format(data?.lastUpdated, "HH:mm:ss")}
          </div>
        ) : (
          <>
            <span className="text-red-500">&times;</span> Kunde inte uppdatera
            informationen
          </>
        )}
      </div>
    </div>
  );
}

function timeClass(time: Date, now: Date) {
  const diff = now.getTime() - time.getTime();
  return diff < futureTolerance
    ? "text-amber-500"
    : diff < onlineTimeout
    ? "text-green-500"
    : "text-slate-400";
}
