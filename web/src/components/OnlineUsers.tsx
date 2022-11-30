// mui components
import Fab from "@mui/material/Fab";
import { green } from "@mui/material/colors";
import CallIcon from "@mui/icons-material/Call";

import { User } from "../contexts/AuthContext";

type Props = {
  onlineUsers: User[];
  myId: string;
  makeCall: (dt: User) => void;
};

const OnlineUsers = ({ onlineUsers, myId, makeCall }: Props) => {
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
      {onlineUsers.length > 1 &&
        onlineUsers
          .filter((onlineUser) => myId !== onlineUser.id)
          .map((user) => (
            <div
              key={user.id}
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

      {onlineUsers.length <= 1 && (
        <div style={{ color: "black", fontSize: "large" }}>
          Share the link to this page with a friend to start discussing
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;
