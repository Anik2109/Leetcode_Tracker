import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from './pages/Login';
import { store } from "./app/store";
import { Provider } from "react-redux";
import AuthLayout from './components/AuthLayout';
import Home from './pages/Home';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
          <AuthLayout authentication>
            <Home />
          </AuthLayout>
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