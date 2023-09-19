import { formatRelative } from "date-fns";
import sv from "date-fns/locale/sv";
import {
  useDisplayMode,
  useFavouriteUnits,
  useRocs,
  useToggleFavouriteUnit,
} from "./roc-api";
import { Link } from "react-router-dom";

function App() {
  const rocs = useRocs();
  const now = new Date();
  const { data: favouriteData } = useFavouriteUnits();
  const { data: displayMode } = useDisplayMode();
  const toggleFavourite = useToggleFavouriteUnit();

  return rocs
    .filter(
      (roc) =>
        !!roc.unitId &&
        (displayMode === "favourites"
          ? favouriteData?.some((favorit) => favorit.unitId === roc.unitId)
          : true)
    )
    .map((roc) => {
      const isFavourite = favouriteData
        ? favouriteData.some((favorit) => favorit.unitId === roc.unitId)
        : false;
      const isKnown = roc.type === "known";

      return (
        <Link
          key={roc.unitId}
          to={`/roc/${roc.unitId}`}
          className="bg-slate-800 flex flex-col border-b border-slate-700 px-4 py-2"
        >
          <div className="flex flex-row justify-between w-full items-end">
            <div className="text-lg font-bold text-slate-200">
              {roc.name}&nbsp;{" "}
              <button
                className={isFavourite ? "text-slate-200" : "text-slate-600"}
                onClick={(e) => {
                  toggleFavourite({ ...roc, type: "unknown" });
                  e.preventDefault();
                }}
                title={isFavourite ? "Ta bort favorit" : "Lägg till favorit"}
              >
                {isFavourite ? "★" : "☆"}
              </button>
            </div>
            {isKnown ? (
              <div className="text-sm text-slate-400">
                {formatRelative(roc.lastContact, now, { locale: sv })}
              </div>
            ) : (
              <div className="text-amber-500">Status okänd</div>
            )}
          </div>
          <div className="flex flex-row justify-between w-full items-end">
            {isKnown ? (
              <>
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
              </>
            ) : (
              <>
                <div />
                <div className="text-slate-600 text-xs">Ej nyligen online</div>
              </>
            )}
          </div>
        </Link>
      );
    });
}

export default App;
