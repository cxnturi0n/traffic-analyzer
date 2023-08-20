import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

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
      <Route index element={<Welcome/>}/>
      <Route path="traffic-analyzer" element={<App />}/>
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

