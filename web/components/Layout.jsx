import { Divider, Drawer, AppBar, Toolbar, colors } from "@mui/material";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
// import clsx from "clsx";
import Avatar from "@mui/material/Avatar";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { makeStyles, useTheme } from "@mui/styles";

import Home from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import CastIcon from "@mui/icons-material/Cast";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// import { io } from "socket.io-client";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
// import { format } from "date-fns";

// contexts
import { AuthContext } from "../contexts/AuthContext";
import { CallContext } from "../contexts/CallContext";
import { SocketContext } from "../contexts/SocketContext";

import IncommingCallScreen from "./calls/IncommingCallScreen";
import VideoCallScreen from "./calls/VideoCallScreen";

const drawerWidth = 200;

const useStyles = makeStyles((theme) => {
  return {
    active: {
      backgroundColor: "#eee",
    },
    appBar: {
      color: "black",
      padding: 0,
      backgroundColor: "white",
      // zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },
    menuButton: {
      marginRight: 10,
    },
    presence_parent: {
      position: "relative",
    },
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
    drawer: {
      width: drawerWidth,
    },
    drawerPaper: {
      width: drawerWidth,
    },
  };
});

const Layout = ({ children }) => {
  const classes = useStyles();
  const router = useRouter();
  const theme = useTheme();

  // Auth Context Stuffs
  const { user } = useContext(AuthContext);
  const { socketConnected } = useContext(SocketContext);
  const {
    onCall,
    incommingCall,
    acceptCall,
    endCall,
    correspondent,
    localStream,
    remoteStream,
    callConnected,
    callStatus,
    videoOn,
    audioOn,
    toggleVideo,
    toggleAudio,
  } = useContext(CallContext);

  // App Drawer state and methods
  const [open, setOpen] = useState(false);
  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  // // App Drawer Nav Items
  const menuItems = [
    {
      text: "Home",
      icon: <Home />,
      path: "/",
    },
    {
      text: "Watch",
      icon: <CastIcon />,
      path: "/user/broadcasts",
    },
    {
      text: "Broadcast",
      icon: <CastIcon />,
      path: "/staff/broadcasts",
    },
  ];

  let viewToShow;

  if (!onCall && incommingCall) {
    viewToShow = (
      <IncommingCallScreen
        acceptCall={acceptCall}
        endCall={endCall}
        correspondent={correspondent}
      />
    );
  }

  if (onCall) {
    viewToShow = (
      <VideoCallScreen
        correspondent={correspondent}
        localStream={localStream}
        remoteStream={remoteStream}
        callConnected={callConnected}
        callStatus={callStatus}
        videoOn={videoOn}
        audioOn={audioOn}
        endCall={endCall}
        toggleVideo={toggleVideo}
        toggleAudio={toggleAudio}
      />
    );
  }

  if (!viewToShow) {
    viewToShow = <div className={classes.content}>{children}</div>;
  }

  return (
    <>
      <CssBaseline />

      <Drawer
        className={classes.drawer}
        classes={{ paper: classes.drawerPaper }}
        anchor="left"
        open={open}
        onClose={closeDrawer}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={closeDrawer}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          {menuItems.map((item) => {
            const isActiveLink = router.pathname == item.path;

            return (
              <ListItem
                button
                className={isActiveLink ? classes.active : ""}
                key={item.text}
                onClick={() => {
                  setOpen(false);
                  router.push(item.path);
                }}
                style={{ paddingLeft: 0 }}
              >
                <Divider
                  style={{
                    width: "5px",
                    height: "30px",
                    marginLeft: 0,
                    marginRight: 5,
                    backgroundColor: isActiveLink ? "crimson" : "transparent",
                  }}
                />
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  style={{ fontWeilghtLight: 700, marginLeft: -20 }}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <AppBar position="fixed" className={classes.appBar} elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={openDrawer}
            edge="start"
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography style={{ flexGrow: 1 }}>WebRTC Call App</Typography>
          <Typography>{user.name}</Typography>
          <div className={classes.presence_parent}>
            <div
              className={`${classes.presence_dot} ${
                socketConnected && classes.presence_online
              }`}
            />
            <Avatar
              src="/images/laughingCStickers39.png"
              style={{ marginLeft: "5px", cursor: "pointer" }}
            />
          </div>
        </Toolbar>
      </AppBar>

      <div className={classes.toolbar} />

      {viewToShow}
    </>
  );
};

export default Layout;
