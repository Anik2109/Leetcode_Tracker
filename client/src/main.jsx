import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from './pages/Login';
import { store } from "./app/store";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {Protected} from './components/AuthLayout';
import {Secured} from './components/AuthLayout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Contest from './pages/Contest';
import Topic from './pages/Topic';
import Company from './pages/Company';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "/home",
        element: (
          <Protected authentication>
            <Home />
          </Protected>
        ),
      },
      {
        path: "/admin",
        element: (
          <Secured authentication>
            <Admin />
          </Secured>
        ),
      },
      {
        path: "/contest",
        element: (
          <Secured authentication>
            <Contest />
          </Secured>
        ),
      },
      {
        path: "/topics",
        element: (
          <Secured authentication>
            <Topic />
          </Secured>
        ),
      },
      {
        path: "/companies",
        element: (
          <Secured authentication>
            <Company />
          </Secured>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);