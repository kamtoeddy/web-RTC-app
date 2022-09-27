// mui components
import Fab from "@mui/material/Fab";
import { green } from "@mui/material/colors";
import CallIcon from "@mui/icons-material/Call";

const OnlineUsers = (props) => {
  const { onlineUsers, myId, makeCall } = props;

  return (
    <div
      style={{
        display: "flex",
        flexFlow: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
        paddingTop: "10px",
      }}
    >
      {onlineUsers
        .filter((onlineUser) => myId !== onlineUser._id)
        .map((user) => (
          <div
            key={user._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "220px",
              padding: "5px 10px",
              fontSize: "large",
              border: "1px solid green",
              borderRadius: "4px",
            }}
          >
            <div>{user.name}</div>

            <Fab
              sx={{
                color: "white",
                bgcolor: green[500],
                "&:hover": { bgcolor: green[600] },
              }}
              size={"small"}
              onClick={() => makeCall(user)}
            >
              <CallIcon />
            </Fab>
          </div>
        ))}
    </div>
  );
};

export default OnlineUsers;
