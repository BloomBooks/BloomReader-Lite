import { ThemeProvider } from "@mui/material/styles";
import "./App.css";
import { initializeWindowObject } from "./api/Api";
import { installMockApi } from "./api/MockBackend";
import { lightTheme as bloomLightTheme } from "./bloomMaterialUiTheme";
import { Home } from "./components/Home";
import { getQueryParam } from "./util/UrlUtil";

function App() {
    const booksUrlRoot = getQueryParam("booksUrlRoot") ?? "../Books";
    const isDevMode = getQueryParam("dev") ?? "0";

    initializeWindowObject();
    if (isDevMode === "1") {
        installMockApi();
    }

    console.info({ booksUrlRoot });

    return (
        <ThemeProvider theme={bloomLightTheme}>
            <Home booksUrlRoot={booksUrlRoot} />
        </ThemeProvider>
    );
}

export default App;
