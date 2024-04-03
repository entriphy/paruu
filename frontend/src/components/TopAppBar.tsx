import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import { useParams } from "react-router-dom";

interface Game {
  id: string;
  title: string;
  description: string;
  decomp: number;
  total: number;
  sections: { [sectionId: string]: string };
}

function GameItem({ game }: { game: Game }) {
  let { gameId, section } = useParams();
  const [open, setOpen] = React.useState(gameId === game.id);

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton onClick={() => setOpen(!open)}>
          <ListItemText primary={game.title} secondary={game.description} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {game.sections === null && (
            <ListItemButton disabled sx={{ pl: 4 }}>
              <ListItemText primary="No sections found" />
            </ListItemButton>
          )}
          {game.sections !== null &&
            Object.entries(game.sections).map((v, i, a) => (
              <ListItemButton key={v[0]} sx={{ pl: 4 }} href={`/entries/${game.id}/${v[0]}`} selected={section === v[0]}>
                <ListItemText primary={v[1]} />
              </ListItemButton>
            ))}
        </List>
      </Collapse>
    </>
  );
}

export default function TopAppBar() {
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [open, setOpen] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);
  const [gamesLoaded, setGamesLoaded] = React.useState(false);
  const [gamesError, setGamesError] = React.useState<string>();
  let lock = false;

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    if (newOpen && !lock && !gamesLoaded) {
      lock = true;
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/game`)
        .then(async (res) => {
          const json = await res.json();
          setGames(json);
          setGamesLoaded(true);
        })
        .catch(async (err) => {
          console.error(err);
          setGamesError(err);
          setGamesLoaded(true);
        });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
          <Drawer open={open} onClose={toggleDrawer(false)}>
            <Box
              sx={{ width: 300 }}
              role="presentation"
              onClick={toggleDrawer(false)}
            >
              {!gamesLoaded && (
                <Box sx={{ paddingLeft: 4, paddingTop: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {gamesLoaded && gamesError !== undefined && (
                <Typography>Error: {gamesError.toString()}</Typography>
              )}
              {gamesLoaded && gamesError === undefined && (
                <List>
                  {games.map((game, i) => (
                    <GameItem game={game} key={game.id} />
                  ))}
                </List>
              )}
            </Box>
          </Drawer>
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Paruu
        </Typography>
        {auth && (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}
