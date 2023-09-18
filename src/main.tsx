import React from "react";
import ReactDOM from "react-dom/client";
import RocList from "./RocList.tsx";
import "./index.css";
import {
  createBrowserRouter,
  LoaderFunctionArgs,
  RouterProvider,
} from "react-router-dom";
import RocInfo from "./RocInfo.tsx";
import Root from "./Root.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <RocList />,
      },
      {
        path: "roc/:unitId",
        loader: async ({ params }: LoaderFunctionArgs) =>
          params.unitId ? { unitId: params.unitId } : null,
        element: <RocInfo />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
