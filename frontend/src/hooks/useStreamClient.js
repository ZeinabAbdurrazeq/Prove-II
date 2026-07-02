import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const activeCallIdRef = useRef(null);
  const sessionId = session?._id;
  const sessionCallId = session?.callId;
  const sessionStatus = session?.status;

  useEffect(() => {
    let disposed = false;
    let videoCall = null;
    let chatClientInstance = null;

    const cleanupResources = async () => {
      try {
        if (videoCall) await videoCall.leave();
        if (isParticipant && sessionStatus === "active" && sessionId) {
          await sessionApi.leaveSession(sessionId);
        }
      } catch (error) {
        console.error("Error leaving Stream call:", error);
      }

      try {
        if (chatClientInstance) await chatClientInstance.disconnectUser();
      } catch (error) {
        console.error("Error disconnecting Stream chat:", error);
      }

      try {
        await disconnectStreamClient();
      } catch (error) {
        console.error("Error disconnecting shared Stream client:", error);
      }

      activeCallIdRef.current = null;
    };

    const initCall = async () => {
      const callId = sessionCallId;
      const shouldJoinCall = isHost || isParticipant;

      if (!callId) return;
      if (!shouldJoinCall) return;
      if (sessionStatus === "completed") return;
      if (activeCallIdRef.current === callId) return;

      try {
        setIsInitializingCall(true);

        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();
        if (disposed) return;

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        if (disposed) return;

        setStreamClient(client);

        videoCall = client.call("default", callId);
        await videoCall.join({ create: true });
        if (disposed) {
          await videoCall.leave().catch(() => {});
          return;
        }
        setCall(videoCall);
        activeCallIdRef.current = callId;

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        if (disposed) {
          await chatClientInstance.disconnectUser().catch(() => {});
          return;
        }
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", callId);
        await chatChannel.watch();
        if (disposed) {
          await chatClientInstance.disconnectUser().catch(() => {});
          return;
        }
        setChannel(chatChannel);
      } catch (error) {
        if (disposed) return;
        toast.error("Failed to join video call");
        console.error("Error init call", error);
      } finally {
        if (!disposed) {
          setIsInitializingCall(false);
        }
      }
    };

    if (sessionCallId && !loadingSession) initCall();

    // cleanup - performance reasons
    return () => {
      disposed = true;
      void cleanupResources();
    };
  }, [
    sessionCallId,
    sessionId,
    sessionStatus,
    loadingSession,
    isHost,
    isParticipant,
  ]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
