/** @jsxImportSource @emotion/react **/
import { css } from "@emotion/react";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Toolbar from "@mui/material/Toolbar";
import I18n from "bloom-reader-lite-shared/dist/i18n/i18n";
import { useState } from "react";
import { darkTheme } from "../../bloomMaterialUiTheme";

const drawerWidth = 240;

// const DrawerHeader = styled('div')(({ theme }) => ({
//     display: 'flex',
//     alignItems: 'center',
//     padding: theme.spacing(0, 1),
//     // necessary for content to be below app bar
//     ...theme.mixins.toolbar,
//     justifyContent: 'flex-end',
//   }));

export function BloomReaderAppBar() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };

    // const handleDrawerClose = () => {
    //     setDrawerOpen(false);
    // };

    // TODO: Figure out how to get SwipeableDrawer to close
    // https://mui.com/material-ui/react-drawer/#swipeable
    const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
        console.log("toggleDrawer running.");
        if (
            event &&
            event.type === "keydown" &&
            ((event as React.KeyboardEvent).key === "Tab" ||
                (event as React.KeyboardEvent).key === "Shift")
        ) {
            return;
        }

        setDrawerOpen(!drawerOpen);
    };

    // ENHANCE: Rewrite the "sx" prop (from Material UI documentation) into "css" prop.
    return (
        <>
            <AppBar position="fixed">
                <Toolbar
                    css={css`
                        background-color: ${darkTheme.palette.background
                            .default};
                    `}
                >
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(drawerOpen && { display: "none" }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <img
                        src="./bloom-reader-against-dark.png"
                        css={css`
                            // In bloompubviewer-RN and BloomReader-RN, the width of the logo was about 2/3 of the width of the screen.
                            /* width: 350px; */
                            width: calc((100% - 16px) * 2 / 3);
                            max-width: 350px;
                        `}
                    />
                </Toolbar>
            </AppBar>
            <SwipeableDrawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
                variant="persistent"
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                onOpen={toggleDrawer}
            >
                {/* There's a header section that goes here */}
                <List>
                    {[I18n.t("Open BloomPUB file")].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                {/* TODO: Use bookshelf.png instead */}
                                <ListItemIcon>
                                    <LibraryBooksIcon />
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {[
                        I18n.t("Release Notes"),
                        I18n.t("About Bloom"),
                        I18n.t("About SIL"),
                    ].map((text) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </SwipeableDrawer>
        </>
    );
}
