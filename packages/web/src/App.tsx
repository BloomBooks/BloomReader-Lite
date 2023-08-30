import { ThemeProvider } from "@mui/material/styles";
import "./App.css";
import { initializeWindowObject } from "./api/Api";
import { lightTheme as bloomLightTheme } from "./bloomMaterialUiTheme";
import { Home } from "./components/Home";
import { getQueryParam } from "./util/UrlUtil";

function App() {
    const booksUrlRoot = getQueryParam("booksUrlRoot") ?? "../Books";

    initializeWindowObject();

    console.info({ booksUrlRoot });

    return (
        <ThemeProvider theme={bloomLightTheme}>
            <Home booksUrlRoot={booksUrlRoot} />
        </ThemeProvider>
    );
}

export default App;
