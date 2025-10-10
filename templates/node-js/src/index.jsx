import "./index.css";

import viteLogo from "./assets/vite.svg";
import ClientCounter from "./ClientCounter";
import { getCount } from "./db";
import ServerCounter from "./ServerCounter";

export default async function App() {
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
          <h1>Hello, React Just!</h1>
          <a href="https://reactjust.dev" target="_blank">
            <img
              className="react-just-logo"
              src="/react-just.svg"
              alt="React Just"
            />
          </a>
          <div className="counters-container">
            <div>
              <p>
                This is a client counter. If you refresh the page, the count
                will reset.
              </p>
              <ClientCounter />
            </div>
            <div>
              <p>
                This is a server counter. If you refresh the page, the count
                will not reset.
              </p>
              <ServerCounter initialCount={await getCount()} />
            </div>
          </div>
          <p style={{ marginBottom: "32px" }}>
            Click on the React Just logo or{" "}
            <a href="https://reactjust.dev" target="_blank">
              here
            </a>{" "}
            to learn more
          </p>
          <div className="vite-section">
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
        </div>
      </body>
    </html>
  );
}
