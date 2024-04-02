import styles from './videoCallStyles.module.scss';

// mui components
import Fab from '@mui/material/Fab';
import CallIcon from '@mui/icons-material/Call';
import { green, red } from '@mui/material/colors';
import CallEndIcon from '@mui/icons-material/CallEnd';

// contexts
import { useCallCTX } from '../contexts/CallContext';

export default function IncommingCallScreen() {
  const { correspondent, acceptCall, endCall } = useCallCTX();

  return (
    <div className={styles.incommingCallParent}>
      <div className="info">{correspondent?.name} is calling</div>

      <div className={styles.btns} style={{ marginTop: 125 }}>
        <Fab
          className={styles.btn}
          sx={{
            color: 'white',
            bgcolor: green[500],
            '&:hover': { bgcolor: green[600] },
          }}
          onClick={() => acceptCall(correspondent!)}
        >
          <CallIcon />
        </Fab>

        <Fab
          className={styles.btn}
          sx={{
            color: 'white',
            bgcolor: red[500],
            '&:hover': { bgcolor: red[600] },
          }}
          onClick={() => endCall(correspondent!)}
        >
          <CallEndIcon />
        </Fab>
      </div>
    </div>
  );
}
