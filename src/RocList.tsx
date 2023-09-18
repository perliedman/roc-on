import { formatRelative } from "date-fns";
import sv from "date-fns/locale/sv";
import {
  useDisplayMode,
  useFavoriteUnitIds,
  useLatestRocs,
  useToggleFavoriteUnitId,
} from "./roc-api";
import { Link } from "react-router-dom";

function App() {
  const { data } = useLatestRocs();
  const now = new Date();
  const { data: favoriteData } = useFavoriteUnitIds();
  const { data: displayMode } = useDisplayMode();
  const toggleFavorite = useToggleFavoriteUnitId();

  return (
    data &&
    data.rocs
      .filter(
        (roc) =>
          !!roc.unitId &&
          (displayMode === "favorites"
            ? favoriteData?.includes(roc.unitId)
            : true)
      )
      .map((roc) => {
        const isFavorite = favoriteData
          ? favoriteData.includes(roc.unitId)
          : false;

        return (
          <Link
            to={`/roc/${roc.unitId}`}
            className="bg-slate-800 flex flex-col border-b border-slate-700 px-4 py-2"
          >
            <div className="flex flex-row justify-between w-full items-end">
              <div className="text-lg font-bold text-slate-200">
                {roc.name}&nbsp;{" "}
                <button
                  className={isFavorite ? "text-slate-200" : "text-slate-600"}
                  onClick={(e) => {
                    toggleFavorite(roc.unitId);
                    e.preventDefault();
                  }}
                  title={isFavorite ? "Ta bort favorit" : "Lägg till favorit"}
                >
                  {isFavorite ? "★" : "☆"}
                </button>
              </div>
              <div className="text-sm text-slate-400">
                {formatRelative(roc.lastContact, now, { locale: sv })}
              </div>
            </div>
            <div className="flex flex-row justify-between w-full items-end">
              <div className="text-sm text-slate-400">{roc.competition}</div>
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
        );
      })
  );
}

export default App;
