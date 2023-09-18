import { format, formatRelative } from "date-fns";
import sv from "date-fns/locale/sv";
import { useLatestRocs } from "./roc-api";
import { Link } from "react-router-dom";

function App() {
  const { data, error } = useLatestRocs();
  const now = new Date();
  return (
    <div className="absolute flex flex-col w-full h-screen overflow-auto bg-slate-900">
      <div className="text-amber-500 text-lg font-bold px-4 py-1 font-serif italic">
        ROC ON
      </div>
      <div className="w-full flex-grow flex flex-col overflow-auto">
        {data &&
          data.rocs
            .filter((roc) => !!roc.unitId)
            .map((roc) => (
              <Link
                to={`/roc/${roc.unitId}`}
                className="bg-slate-800 flex flex-col border-b border-slate-700 px-4 py-2"
              >
                <div className="flex flex-row justify-between w-full items-end">
                  <div className="text-lg font-bold text-slate-200">
                    <span className="text-slate-600">☆</span>&nbsp;{roc.name}
                  </div>
                  <div className="text-sm text-slate-400">
                    {formatRelative(roc.lastContact, now, { locale: sv })}
                  </div>
                </div>
                <div className="flex flex-row justify-between w-full items-end">
                  <div className="text-sm text-slate-400">
                    {roc.competition}
                  </div>
                  <div className="text-xs text-slate-400">
                    {roc.online ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span className="text-slate-600">Offline</span>
                    )}
                    {roc.punchLast5 && (
                      <>
                        &nbsp;/&nbsp;
                        <span className="text-green-500">Stämplad</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
      </div>
      <div className="text-sm px-4 py-1 text-slate-400">
        {!error && data ? (
          <div>
            <span className="text-green-500">✓</span>{" "}
            {format(data?.lastUpdated, "HH:mm:ss")}
          </div>
        ) : (
          <span className="text-red-500">&times;</span>
        )}
      </div>
    </div>
  );
}

export default App;
