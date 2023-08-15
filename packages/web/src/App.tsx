import "./App.css";
import { initializeMessageHandler } from "./FrontendApi";
import { Home } from "./components/Home";
import { getQueryParam } from "./util/UrlUtil";

function App() {
    const booksUrlRoot = getQueryParam("booksUrlRoot") ?? "../Books";

    initializeMessageHandler();

    console.info({ booksUrlRoot });

    return <Home booksUrlRoot={booksUrlRoot} />;
}

export default App;
