import useSWR, { SWRResponse } from "swr";
import useSWRMutation from "swr/mutation";
import { parse as parseDate } from "date-fns";

let lastUpdate: Date | null = null;
let loadingCount = 0;

const rocBaseUrl = "https://roc-proxy.vercel.app/api";

type KnownRoc = {
  type: "known";
  online: boolean;
  punchLast5: boolean;
  name: string;
  unitId: string;
  version: string;
  lastBootCallHome: Date;
  lastContact: Date;
  competition: string;
  description: string;
  lastCodes: string;
};

export type UnknownRoc = {
  type: "unknown";
  unitId: string;
  name: string;
};

export type RocInfo = KnownRoc | UnknownRoc;

export function useLastUpdated() {
  return useSWR(
    "/lastUpdate",
    async () => {
      return { lastUpdate, loading: loadingCount > 0 };
    },
    { refreshInterval: 1 * 1000, refreshWhenOffline: true }
  );
}

export function useRocs(): RocInfo[] {
  const { data: favouriteUnits } = useFavouriteUnits();
  const { data } = useLatestRocs();
  const notSeen = new Set((favouriteUnits || []).map(({ unitId }) => unitId));
  for (const roc of data?.rocs || []) {
    notSeen.delete(roc.unitId);
  }
  const notSeenRocs = [...notSeen]
    .map(
      (notSeenUnitId) =>
        favouriteUnits?.find(
          (favourite) => favourite.unitId === notSeenUnitId
        ) || null
    )
    .filter(is<UnknownRoc>);

  return [
    ...notSeenRocs.map((roc): UnknownRoc => ({ ...roc, type: "unknown" })),
    ...(data?.rocs || []),
  ];
}

export function useLatestRocs(): SWRResponse<{
  rocs: RocInfo[];
  lastUpdated: Date;
}> {
  const now = new Date();
  return useSWR(
    `${rocBaseUrl}/ver6.9/client.asp?function=onlineunits&command=list&advanced=true`,
    fetcher((doc) => {
      const table = doc.querySelector("table");
      const rows = [...(table?.querySelectorAll("tr") || [])];
      const knownRocs = rows
        .map((row): RocInfo | null => {
          const cells = [...row.querySelectorAll("td")];
          const [
            online,
            punchLast5,
            name,
            unitId,
            version,
            lastBootCallHome,
            lastContact,
            competition,
            description,
            lastCodes,
          ] = cells;

          return name && unitId
            ? {
                type: "known",
                online: !!online.querySelector(
                  "img[src='image/GreenCircle.jpg']"
                ),
                punchLast5: !!punchLast5.querySelector(
                  "img[src='image/GreenCircle.jpg']"
                ),
                name: name.textContent || "",
                unitId: unitId.textContent || "",
                version: version.textContent || "",
                lastBootCallHome: parseDate(
                  lastBootCallHome.textContent || "",
                  "yyyy-MM-dd HH:mm:ss",
                  now
                ),
                lastContact: parseDate(
                  (lastContact.textContent || "")
                    .split(" ")
                    .slice(0, 2)
                    .join(" "),
                  "yyyy-MM-dd HH:mm:ss",
                  now
                ),
                competition: competition.textContent || "",
                description: description.textContent || "",
                lastCodes: lastCodes.textContent || "",
              }
            : null;
        })
        .filter(is<RocInfo>);

      return {
        rocs: knownRocs,
        lastUpdated: now,
      };
    }),
    { refreshInterval: 30 * 1000, refreshWhenOffline: true }
  );
}

export function is<T>(info: T | null | undefined): info is T {
  return info != null;
}

export function useRocInfo(unitId: string) {
  const rocs = useRocs();
  return rocs.find((roc) => roc.unitId === unitId);
}

export function usePunches(unitId: string) {
  return useSWR(
    `${rocBaseUrl}/ver6.9/client.asp?function=punch&command=list&unitId=${unitId}&advanced=false`,
    fetcher((doc) => {
      const table = doc.querySelector("table");
      const rows = [...(table?.querySelectorAll("tr") || [])];
      const now = new Date();
      return {
        punches: rows.slice(1).map((row) => {
          const cells = [...row.querySelectorAll("td")];
          const [control, siNumber, time, type] = cells;
          return {
            control: control.textContent || "",
            siNumber: siNumber.textContent || "",
            time: parseDate(
              time.textContent || "",
              "yyyy-MM-dd HH:mm:ss.SSS",
              now
            ),
            type: type.textContent || "",
          };
        }),
      };
    }),
    { refreshInterval: 30 * 1000, refreshWhenOffline: true }
  );
}

type ResponseParser<T> = (doc: Document) => T;

function fetcher<T>(htmlParser: ResponseParser<T>) {
  return async (url: string) => {
    try {
      loadingCount++;
      const respsone = await fetch(url);
      if (respsone.ok) {
        const html = await respsone.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const result = htmlParser(doc);
        lastUpdate = new Date();
        return result;
      } else {
        throw new Error(`Unexpected HTTP status code: ${respsone.status}`);
      }
    } finally {
      loadingCount--;
    }
  };
}

let favouriteUnits = JSON.parse(
  window.localStorage.getItem("favouriteUnits") || "[]"
) as UnknownRoc[];

export function useFavouriteUnits() {
  return useSWR("/favouriteUnits", async () => {
    return favouriteUnits;
  });
}

export function useToggleFavouriteUnit() {
  const { trigger } = useSWRMutation(
    "/favouriteUnits",
    async (_: string, { arg }: { arg: UnknownRoc }) => {
      favouriteUnits = favouriteUnits.some((unit) => unit.unitId === arg.unitId)
        ? favouriteUnits.filter(({ unitId }) => unitId !== arg.unitId)
        : [...favouriteUnits, arg];
      window.localStorage.setItem(
        "favouriteUnits",
        JSON.stringify(favouriteUnits)
      );
      return favouriteUnits;
    }
  );

  return (unit: UnknownRoc) => trigger(unit);
}

export type DisplayMode = "all" | "favourites";

let displayMode = (window.localStorage.getItem("displayMode") ||
  "all") as DisplayMode;

export function useDisplayMode() {
  return useSWR("/displayMode", async () => {
    return displayMode;
  });
}

export function useSetDisplayMode() {
  const { trigger } = useSWRMutation(
    "/displayMode",
    async (_: string, { arg }: { arg: DisplayMode }) => {
      displayMode = arg;
      window.localStorage.setItem("displayMode", displayMode);
      return displayMode;
    }
  );

  return (mode: DisplayMode) => trigger(mode);
}
