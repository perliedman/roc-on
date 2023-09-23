import { Link, Outlet } from "react-router-dom";
import {
  DisplayMode,
  useDisplayMode,
  useLastUpdated,
  useSetDisplayMode,
} from "./roc-api";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import Spinner from "./Spinner";

const modeButtons: [DisplayMode, string][] = [
  ["all", "Alla"],
  ["favourites", "Favoriter"],
];

export default function Root() {
  const { data } = useLastUpdated();
  const lastUpdate = data?.lastUpdate;
  const isOnline =
    lastUpdate && lastUpdate.getTime() > Date.now() - 1 * 60 * 1000;
  const { data: displayMode } = useDisplayMode();
  const setDisplayMode = useSetDisplayMode();
  const isLoading = data ? data.loading : true;

  return (
    <div className="absolute w-full overflow-auto bg-slate-950">
      <div className="max-w-lg h-screen mx-auto flex flex-col bg-slate-900 text-slate-400">
        <div className="flex flex-row justify-between items-center px-4 py-1">
          <div className="text-amber-500 text-lg font-bold font-serif italic">
            <Link to="/">ROC ON</Link>
          </div>
          <div className="">
            {modeButtons.map(([mode, label]) => (
              <button
                key={mode}
                className={`border border-slate-600 border-r-0 last:border-r text-sm px-2 py-1 first:rounded-l last:rounded-r ${
                  displayMode === mode ? "bg-slate-400 text-slate-800" : ""
                }`}
                onClick={() => setDisplayMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
          <div>
            {lastUpdate ? (
              isOnline ? (
                <span className="text-green-500">
                  <span className="inline-block w-8 h-8">
                    {isLoading ? <Spinner /> : "✓"}
                  </span>
                  {format(lastUpdate.getTime(), "HH:mm:ss", { locale: sv })}
                </span>
              ) : (
                <span className="text-red-500">&times;</span>
              )
            ) : (
              <Spinner />
            )}
          </div>
        </div>
        <div className="w-full flex-grow flex flex-col overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
