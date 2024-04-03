import React from "react";
import ReactDOM from "react-dom/client";
import { Entries, Games, Sections } from "./App";
import "./index.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { red, blue, yellow } from "@mui/material/colors";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <Games /> },
  { path: "/games", element: <Games /> },
  { path: "/sections/:gameId", element: <Sections /> },
  { path: "/entries/:gameId/:section", element: <Entries /> },
]);

function Main() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: {
            main: prefersDarkMode ? yellow[400] : yellow[700],
          },
          secondary: {
            main: blue[400],
          },
          error: {
            main: red.A400,
          },
        },
      }),
    [prefersDarkMode],
  );

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(
  document.getElementById("root") as ReactDOM.Container,
).render(<Main />);
