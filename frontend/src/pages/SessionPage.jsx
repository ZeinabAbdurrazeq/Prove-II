import { useUser } from "@clerk/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useEndSession,
  useJoinSession,
  useSessionById,
} from "../hooks/useSessions";
import { sessionApi } from "../api/sessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/judge0";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, AlertTriangleIcon } from "lucide-react";
import toast from "react-hot-toast";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import useCollaborativeCode from "../hooks/useCollaborativeCode";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    data: sessionData,
    isLoading: loadingSession,
    refetch,
  } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();
  const { isIdle: isJoinIdle, mutate: joinSession } = joinSessionMutation;

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } =
    useStreamClient(session, loadingSession, isHost, isParticipant);

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(
    problemData?.starterCode?.[selectedLanguage] || "",
  );
  // Ensures starter code is only auto-loaded once, so it never overwrites
  // collaborative edits coming from the other participant.
  const starterLoadedRef = useRef(false);
  // Ensures the join request is fired at most once, even though the 5s polling
  // refetch can re-render this effect before the mutation leaves its idle
  // state (which previously allowed a duplicate join).
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    // Guard against duplicate join calls triggered by the 5s polling refetch.
    if (hasJoinedRef.current || !isJoinIdle) return;

    hasJoinedRef.current = true;
    joinSession(id, {
      onSuccess: refetch,
      // Allow a retry if the join failed (e.g. transient network error).
      onError: () => {
        hasJoinedRef.current = false;
      },
    });
  }, [
    session,
    user,
    loadingSession,
    isHost,
    isParticipant,
    id,
    isJoinIdle,
    joinSession,
    refetch,
  ]);

  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  useEffect(() => {
    // Load starter code only once, when the problem data first resolves.
    if (starterLoadedRef.current) return;
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
      starterLoadedRef.current = true;
    }
  }, [problemData, selectedLanguage]);

  // Real-time collaborative editing over the shared Stream channel.
  const { broadcastCode, broadcastLanguage } = useCollaborativeCode(
    channel,
    user?.id,
    // When the other user types, apply their code locally.
    (remoteCode) => setCode(remoteCode),
    // When the other user switches language, mirror it locally.
    (remoteLang) => setSelectedLanguage(remoteLang),
  );

  const handleCodeChange = (value) => {
    const newCode = value ?? "";
    setCode(newCode);
    broadcastCode(newCode);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
    broadcastLanguage(newLang);
    broadcastCode(starterCode);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    // Styled confirmation toast instead of the native confirm() dialog.
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="size-6 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-base-content">End this session?</p>
              <p className="text-sm text-base-content/70">
                All participants will be notified and the session will be closed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-error gap-2"
              onClick={() => {
                toast.dismiss(t.id);
                endSessionMutation.mutate(id, {
                  onSuccess: () => navigate("/dashboard"),
                });
              }}
            >
              <LogOutIcon className="size-4" />
              End Session
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
        // Match the dark daisyUI theme instead of the default white toast.
        style: {
          background: "var(--color-base-100)",
          color: "var(--color-base-content)",
          border: "1px solid var(--color-base-300)",
          maxWidth: "420px",
        },
      },
    );
  };

  const handleLeaveSession = async () => {
    try {
      if (isParticipant) {
        await sessionApi.leaveSession(id);
      }
    } catch (error) {
      console.error("Error leaving session:", error);
    } finally {
      navigate("/dashboard");
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col overflow-x-hidden">
        <Navbar />

        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3 sm:px-4">
          <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-base-content">
                      {session?.problem || "Loading..."}
                    </h1>
                    {problemData?.category && (
                      <p className="text-sm text-base-content/60">
                        {problemData.category}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-base-content/60">
                      Host: {session?.host?.name || "Loading..."} ? {session?.participant ? 2 : 1}/2 participants
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`badge badge-lg ${getDifficultyBadgeClass(
                        session?.difficulty,
                      )}`}
                    >
                      {session?.difficulty
                        ? session.difficulty.slice(0, 1).toUpperCase() +
                          session.difficulty.slice(1)
                        : "Easy"}
                    </span>
                    {isHost && session?.status === "active" && (
                      <button
                        onClick={handleEndSession}
                        disabled={endSessionMutation.isPending}
                        className="btn btn-error btn-sm gap-2"
                      >
                        {endSessionMutation.isPending ? (
                          <Loader2Icon className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOutIcon className="w-4 h-4" />
                        )}
                        End Session
                      </button>
                    )}
                    {session?.status === "completed" && (
                      <span className="badge badge-ghost badge-lg">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {problemData?.description && (
                  <div className="max-h-[26vh] overflow-y-auto rounded-2xl bg-base-200/60 p-4">
                    <h2 className="text-lg font-bold text-base-content">Description</h2>
                    <p className="mt-3 text-sm leading-6 text-base-content/80">
                      {problemData.description.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-[58vh] min-h-[420px] overflow-hidden rounded-3xl border border-base-300 bg-base-200 shadow-sm">
            <div className="h-full overflow-auto p-3">
              {isInitializingCall ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="mx-auto mb-4 size-12 animate-spin text-primary" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="flex h-full items-center justify-center">
                  <div className="card max-w-md bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-error/10">
                        <PhoneOffIcon className="h-12 w-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">
                        Unable to connect to the video call
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <StreamVideo client={streamClient}>
                  <StreamCall call={call}>
                    <VideoCallUI
                      chatClient={chatClient}
                      channel={channel}
                      onLeave={handleLeaveSession}
                    />
                  </StreamCall>
                </StreamVideo>
              )}
            </div>
          </div>

          <div className="h-[60vh] min-h-[440px] overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <CodeEditorPanel
              selectedLanguage={selectedLanguage}
              code={code}
              isRunning={isRunning}
              onLanguageChange={handleLanguageChange}
              onCodeChange={handleCodeChange}
              onRunCode={handleRunCode}
            />
          </div>

          <div className="h-56 overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <OutputPanel output={output} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM DSC PANEL */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200">
                  {/* HEADER SECTION */}
                  <div className="p-6 bg-base-100 border-b border-base-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-base-content">
                          {session?.problem || "Loading..."}
                        </h1>
                        {problemData?.category && (
                          <p className="text-base-content/60 mt-1">
                            {problemData.category}
                          </p>
                        )}
                        <p className="text-base-content/60 mt-2">
                          Host: {session?.host?.name || "Loading..."} •{" "}
                          {session?.participant ? 2 : 1}/2 participants
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`badge badge-lg ${getDifficultyBadgeClass(
                            session?.difficulty,
                          )}`}
                        >
                          {session?.difficulty
                            ? session.difficulty.slice(0, 1).toUpperCase() +
                              session.difficulty.slice(1)
                            : "Easy"}
                        </span>
                        {isHost && session?.status === "active" && (
                          <button
                            onClick={handleEndSession}
                            disabled={endSessionMutation.isPending}
                            className="btn btn-error btn-sm gap-2"
                          >
                            {endSessionMutation.isPending ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogOutIcon className="w-4 h-4" />
                            )}
                            End Session
                          </button>
                        )}
                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* problem desc */}
                    {problemData?.description && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">
                          Description
                        </h2>
                        <div className="space-y-3 text-base leading-relaxed">
                          <p className="text-base-content/90">
                            {problemData.description.text}
                          </p>
                          {problemData.description.notes?.map((note, idx) => (
                            <p key={idx} className="text-base-content/90">
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* examples section */}
                    {problemData?.examples &&
                      problemData.examples.length > 0 && (
                        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                          <h2 className="text-xl font-bold mb-4 text-base-content">
                            Examples
                          </h2>

                          <div className="space-y-4">
                            {problemData.examples.map((example, idx) => (
                              <div key={idx}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="badge badge-sm">
                                    {idx + 1}
                                  </span>
                                  <p className="font-semibold text-base-content">
                                    Example {idx + 1}
                                  </p>
                                </div>
                                <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                  <div className="flex gap-2">
                                    <span className="text-primary font-bold min-w-[70px]">
                                      Input:
                                    </span>
                                    <span>{example.input}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-secondary font-bold min-w-[70px]">
                                      Output:
                                    </span>
                                    <span>{example.output}</span>
                                  </div>
                                  {example.explanation && (
                                    <div className="pt-2 border-t border-base-300 mt-2">
                                      <span className="text-base-content/60 font-sans text-xs">
                                        <span className="font-semibold">
                                          Explanation:
                                        </span>{" "}
                                        {example.explanation}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Constraints */}
                    {problemData?.constraints &&
                      problemData.constraints.length > 0 && (
                        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                          <h2 className="text-xl font-bold mb-4 text-base-content">
                            Constraints
                          </h2>
                          <ul className="space-y-2 text-base-content/90">
                            {problemData.constraints.map((constraint, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-primary">•</span>
                                <code className="text-sm">{constraint}</code>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={handleCodeChange}
                      onRunCode={handleRunCode}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">
                        Unable to connect to the video call
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI
                        chatClient={chatClient}
                        channel={channel}
                        onLeave={handleLeaveSession}
                      />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
