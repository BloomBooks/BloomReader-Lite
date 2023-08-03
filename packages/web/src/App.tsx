import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { getQueryParam } from "./util/UrlUtil";
import { Log } from "./util/Log";

function App() {
    const [count, setCount] = useState(0);
    const booksUrlRoot = getQueryParam("booksUrlRoot") ?? "../Books";

    const imgSrc = `${booksUrlRoot}/BloomIcon.png`;

    Log.info({ booksUrlRoot, imgSrc });

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
                <img src={imgSrc} className="logo" alt="Bloom logo" />
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;
