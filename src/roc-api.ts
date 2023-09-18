import useSWR from "swr";
import { parse as parseDate } from "date-fns";

// const rocBaseUrl = 'https://roc.olresultat.se'
const rocBaseUrl = "http://localhost:8010/proxy";
type RocInfo = {
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

export function useLatestRocs() {
  const now = new Date();
  return useSWR(
    `${rocBaseUrl}/ver6.9/client.asp?function=onlineunits&command=list&advanced=true`,
    fetcher((doc) => {
      const table = doc.querySelector("table");
      const rows = [...(table?.querySelectorAll("tr") || [])];
      return {
        rocs: rows
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
          .filter(isRocInfo),
        lastUpdated: now,
      };
    }),
    { refreshInterval: 30 * 1000, refreshWhenOffline: true }
  );

  function isRocInfo(info: RocInfo | null): info is RocInfo {
    return info !== null;
  }
}

export function useRocInfo(unitId: string) {
  const rocs = useLatestRocs();
  const roc = rocs.data?.rocs.find((roc) => roc.unitId === unitId);
  return {
    ...rocs,
    data: { roc, lastUpdated: rocs.data?.lastUpdated },
  };
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
    const respsone = await fetch(url);
    if (respsone.ok) {
      const html = await respsone.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return htmlParser(doc);
    } else {
      throw new Error(`Unexpected HTTP status code: ${respsone.status}`);
    }
  };
}
