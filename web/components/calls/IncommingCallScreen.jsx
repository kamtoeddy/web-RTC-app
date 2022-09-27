// import { useEffect, useState } from "react";
import styles from "./videoCallStyles.module.scss";

// mui components
import Fab from "@mui/material/Fab";
import { green, red } from "@mui/material/colors";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";

const IncommingCallScreen = (props) => {
  const { correspondent, acceptCall, endCall } = props;

  return (
    <div className={styles.incommingCallParent}>
      <div className="info">{correspondent?.name} is calling</div>

      <div className={styles.btns} style={{ marginTop: 125 }}>
        <Fab
          className={styles.btn}
          sx={{
            color: "white",
            bgcolor: green[500],
            "&:hover": { bgcolor: green[600] },
          }}
          onClick={() => {
            acceptCall(correspondent);
          }}
        >
          <CallIcon />
        </Fab>

        <Fab
          className={styles.btn}
          sx={{
            color: "white",
            bgcolor: red[500],
            "&:hover": { bgcolor: red[600] },
          }}
          onClick={() => {
            endCall(correspondent);
          }}
        >
          <CallEndIcon />
        </Fab>
      </div>
    </div>
  );
};

export default IncommingCallScreen;
