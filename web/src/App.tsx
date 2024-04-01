import { lazy } from 'react';

// contexts
import { useCallCTX } from './contexts/CallContext';

// components
import AppBar from './components/AppBar';
const IncommingCallScreen = lazy(
  () => import('./components/IncommingCallScreen'),
);
const OnlineUsersList = lazy(() => import('./components/OnlineUsersList'));
const VideoCallScreen = lazy(() => import('./components/VideoCallScreen'));

export default function App() {
  const { isOnIncommingCall, isOnCall } = useCallCTX();

  return (
    <div className="App">
      <AppBar />

      {isOnCall && <VideoCallScreen />}

      {!isOnCall && isOnIncommingCall && <IncommingCallScreen />}

      {!isOnCall && !isOnIncommingCall && <OnlineUsersList />}
    </div>
  );
}
