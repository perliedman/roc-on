import { Outlet } from "react-router-dom";
import { useLastUpdated } from "./roc-api";
import { formatRelative } from "date-fns";
import { sv } from "date-fns/locale";

export default function Root() {
  const { data } = useLastUpdated();
  const now = new Date();
  const hasDate = !!data;
  const isOnline = hasDate && data.getTime() > Date.now() - 1 * 60 * 1000;

  return (
    <div className="absolute w-full overflow-auto bg-slate-950">
      <div className="max-w-lg h-screen mx-auto flex flex-col bg-slate-900 text-slate-400">
        <div className="text-amber-500 text-lg font-bold px-4 py-1 font-serif italic">
          ROC ON
        </div>
        <div className="w-full flex-grow flex flex-col overflow-auto">
          <Outlet />
        </div>
        <div className="text-sm px-4 py-1">
          <div>
            {isOnline ? (
              <span className="text-green-500">
                ✓ {formatRelative(data?.getTime(), now, { locale: sv })}
              </span>
            ) : (
              <span className="text-red-500">&times;</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
