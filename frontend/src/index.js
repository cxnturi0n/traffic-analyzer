import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { REACT_APP_UI_BASE_PREFIX, REACT_APP_EXPRESS_BASE_PREFIX, REACT_APP_EXPRESS_API_OBSERVATIONS_ENDPOINT, REACT_APP_EXPRESS_API_ROADS_ENDPOINT } from "./properties";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import Welcome from "./components/Welcome";
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={`${REACT_APP_UI_BASE_PREFIX}/`}>
      <Route index element={<Welcome />} />
      <Route path={`query`} element={<App />} />
    </Route>
  )
);



const defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

const client = new ApolloClient({
  uri: `${REACT_APP_EXPRESS_BASE_PREFIX}${REACT_APP_EXPRESS_API_OBSERVATIONS_ENDPOINT}`,

  cache: new InMemoryCache({ addTypename: false }),
  defaultOptions: defaultOptions,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);
