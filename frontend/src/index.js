import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { REACT_APP_UI_BASE_PREFIX } from "./properties";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements
} from "react-router-dom";

import Welcome from "./components/Welcome";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route
        path={`${REACT_APP_UI_BASE_PREFIX}/welcome`}
        element={<Welcome />}
      />
      <Route
        path={`${REACT_APP_UI_BASE_PREFIX}/query`}
        element={<App />}
      />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

