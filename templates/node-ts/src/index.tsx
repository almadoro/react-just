import "./index.css";

import { AppEntryProps } from "react-just/server";
import viteLogo from "./assets/vite.svg";
import Button from "./Button";

export default function App(props: AppEntryProps) {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/react-just.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React Just is Awesome!</title>
      </head>
      <body>
        <div className="app">
          <h1>Hello, ReactJust!</h1>
          <a href="https://reactjust.dev" target="_blank">
            <img
              className="react-just-logo"
              src="/react-just.svg"
              alt="ReactJust"
            />
          </a>
          <div>
            <Button />
          </div>
          <p style={{ marginBottom: "32px" }}>
            Click on the ReactJust logo or{" "}
            <a href="https://reactjust.dev" target="_blank">
              here
            </a>{" "}
            to learn more
          </p>
          <p>
            Powered by{" "}
            <a href="https://vitejs.dev" target="_blank">
              Vite
            </a>
          </p>
          <a href="https://vitejs.dev" target="_blank">
            <img className="vite-logo" src={viteLogo} alt="Vite" />
          </a>
        </div>
      </body>
    </html>
  );
}
