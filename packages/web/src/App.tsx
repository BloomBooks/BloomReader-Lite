import "./App.css";
import { initializeWindowObject } from "./api/Api";
import { Home } from "./components/Home";
import { getQueryParam } from "./util/UrlUtil";

function App() {
    const booksUrlRoot = getQueryParam("booksUrlRoot") ?? "../Books";

    initializeWindowObject();

    console.info({ booksUrlRoot });

    return <Home booksUrlRoot={booksUrlRoot} />;
}

export default App;
