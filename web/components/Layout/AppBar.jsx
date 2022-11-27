import { useContext } from "react";
import { AppBar as AppBar_, Avatar, Toolbar, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

// contexts
import { AuthContext } from "../../contexts/AuthContext";
import { SocketContext } from "../../contexts/SocketContext";

const useStyles = makeStyles((theme) => {
  return {
    appBar: {
      color: "black",
      padding: 0,
      backgroundColor: "white",
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },
    presence_parent: { position: "relative" },
    presence_dot: {
      position: "absolute",
      right: -2,
      width: 12,
      height: 12,
      borderRadius: "50%",
      backgroundColor: "#d58c13",
      border: "2px solid white",
      zIndex: 2,
    },
    presence_online: { backgroundColor: "#4caf50" },
  };
});

function AppBar() {
  const classes = useStyles();

  const { user } = useContext(AuthContext);
  const { socketConnected } = useContext(SocketContext);

  return (
    <AppBar_ position="fixed" className={classes.appBar} elevation={0}>
      <Toolbar className={classes.toolbar}>
        <Typography>{user.name}</Typography>

        <div className={classes.presence_parent}>
          <div
            className={`${classes.presence_dot} ${
              socketConnected && classes.presence_online
            }`}
          />

          <Avatar
            alt={user.name}
            style={{ marginLeft: "5px", cursor: "pointer" }}
          />
        </div>
      </Toolbar>
    </AppBar_>
  );
}

export default AppBar;
