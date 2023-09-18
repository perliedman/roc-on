import { Outlet } from "react-router-dom";

export default function Root() {
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
            <span className="text-green-500">✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
