// mui components
import Fab from '@mui/material/Fab';
import { green } from '@mui/material/colors';
import CallIcon from '@mui/icons-material/Call';

// contexts
import { useAuthCTX } from '../contexts/AuthContext';
import { useCallCTX } from '../contexts/CallContext';
import { useSocketCTX } from '../contexts/SocketContext';

export default function OnlineUsersList() {
  const { user } = useAuthCTX();
  const { makeCall } = useCallCTX();
  const { onlineUsers } = useSocketCTX();

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        paddingTop: '10px',
      }}
    >
      {onlineUsers.length > 1 &&
        onlineUsers
          .filter((u) => user.id !== u.id)
          .map((u) => (
            <div
              key={u.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '220px',
                padding: '5px 10px',
                fontSize: 'large',
                border: '1px solid green',
                borderRadius: '4px',
              }}
            >
              <div>{u.name}</div>

              <Fab
                sx={{
                  color: 'white',
                  bgcolor: green[500],
                  '&:hover': { bgcolor: green[600] },
                }}
                size={'small'}
                onClick={() => makeCall(u)}
              >
                <CallIcon />
              </Fab>
            </div>
          ))}

      {onlineUsers.length <= 1 && (
        <div style={{ color: 'black', fontSize: 'large' }}>
          Share the link to this page with a friend to start discussing
        </div>
      )}
    </div>
  );
}
