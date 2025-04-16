import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useNavigate } from 'react-router-dom';

const VideoCall = () => {
  const navigate = useNavigate();
  const roomName = decodeURIComponent(window.location.pathname.split('/').pop());

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <JitsiMeeting
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          enableEmailInStats: false,
          constraints: {
            video: {
              height: {
                ideal: 720,
                max: 720,
                min: 240
              }
            }
          }
        }}
        interfaceConfigOverwrite={{
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
          DEFAULT_BACKGROUND: '#000',
          FILM_STRIP_MAX_HEIGHT: 0
        }}
        style={{ 
          display: 'block',
          height: '100%',
          width: '100%',
          border: 'none',
          margin: 0,
          padding: 0
        }}
        getIFrameRef={(iframe) => {
          iframe.style.height = '100%';
          iframe.style.width = '100%';
        }}
        onReadyToClose={() => {
          navigate(-1); // Redirect to home when meeting ends
        }}
      />
    </div>
  );
};

export default VideoCall;