import { streamClient, chatClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import Notification from "../models/Notification.js";
import { sendSessionStartedEmail } from "../lib/email.js";
import { ENV } from "../lib/env.js";

function formatDifficulty(difficulty) {
  const value = String(difficulty || "");
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Session";
}

function getSessionTitle(session) {
  return `${formatDifficulty(session.difficulty)} coding session`;
}

export async function createSession(req, res) {
  try {
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!req.body.difficulty) {
      return res
        .status(400)
        .json({ msg: "Difficulty is required" });
    }

    // Normalize difficulty to lowercase to match the Session schema enum
    const difficulty = String(req.body.difficulty).toLowerCase();

    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const session = await Session.create({
      difficulty,
      host: userId,
      callId,
    });

    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { difficulty, sessionId: session._id.toString() },
      },
    });

    const channel = chatClient.channel("messaging", callId, {
      name: `${difficulty} coding session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error in CreateSession Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getActiveSession(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage")
      .populate("invitedParticipant", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in GetActiveSessions Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getMyRecentSession(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getMyRecentSession Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId")
      .populate("invitedParticipant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ msg: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in getSessionById Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ msg: "session is not found" });

    if (session.status !== "active") {
      return res.status(400).json({ msg: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ msg: "Host cannot join their own session as participant" });
    }

    if (
      session.invitedParticipant &&
      session.invitedParticipant.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ msg: "This private session is reserved for the invited user" });
    }

    if (
      session.participant &&
      session.participant.toString() === userId.toString()
    ) {
      return res.status(200).json({ session, msg: "Already joined session" });
    }

    if (session.participant)
      return res.status(409).json({ msg: "session is full" });

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in joinSession Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function leaveSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ msg: "session is not found" });

    if (session.status !== "active") {
      return res.status(400).json({ msg: "Session is already completed" });
    }

    // Hosts do not occupy the participant slot, so leaving is just a no-op.
    if (session.host.toString() === userId.toString()) {
      return res.status(200).json({ session, msg: "Host left the call" });
    }

    if (!session.participant || session.participant.toString() !== userId.toString()) {
      return res.status(200).json({ session, msg: "User is not in this session" });
    }

    session.participant = null;
    await session.save();

    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.removeMembers([clerkId]);
    } catch (chatError) {
      console.error("Error removing session member from chat:", chatError.message);
    }

    res.status(200).json({ session, msg: "Left session successfully" });
  } catch (error) {
    console.error("Error in leaveSession Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ msg: "session is not found" });

    if (session.host.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ msg: "only the host who can end the session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ msg: "Session is already completed" });
    }

    // Mark the session completed first so a partial Stream cleanup failure
    // does not leave an active, unjoinable zombie session in the DB.
    session.status = "completed";
    await session.save();

    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    res.status(200).json({ session, msg: "Session ended successfully" });
  } catch (error) {
    console.error("Error in endSession Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function updateSessionProblem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { problemId, problemTitle } = req.body;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ msg: "session is not found" });

    const isHost = session.host.toString() === userId.toString();
    const isParticipant =
      session.participant?.toString() === userId.toString() ||
      session.invitedParticipant?.toString() === userId.toString();

    if (!isHost && !isParticipant) {
      return res.status(403).json({ msg: "You are not part of this session" });
    }

    session.selectedProblemId = String(problemId || "").trim();
    session.problem = String(problemTitle || "").trim();
    await session.save();

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in updateSessionProblem Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function notifySessionStarted(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id)
      .populate("host", "name email clerkId")
      .populate("invitedParticipant", "name email clerkId");

    if (!session) return res.status(404).json({ msg: "session is not found" });

    if (session.host._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ msg: "Only the host can start session notifications" });
    }

    if (!session.invitedParticipant) {
      return res.status(200).json({ session, msg: "No invited participant" });
    }

    if (session.startedNotificationSentAt) {
      return res.status(200).json({ session, msg: "Already notified" });
    }

    const clientUrl = ENV.CLIENT_URL || "";
    const sessionUrl = `${clientUrl}/session/${session._id}`;
    const sessionTitle = getSessionTitle(session);

    await Notification.create({
      recipientId: session.invitedParticipant._id,
      senderId: session.host._id,
      type: "session-started",
      relatedInvitationId: session.invitation || null,
      relatedSessionId: session._id,
      message: `${session.host.name} started ${sessionTitle}: ${sessionUrl}`,
    });

    await sendSessionStartedEmail(session.invitedParticipant.email, {
      sessionTitle,
      sessionUrl,
      difficulty: session.difficulty,
      senderName: session.host.name,
    });

    session.startedNotificationSentAt = new Date();
    await session.save();

    res.status(200).json({ session, msg: "Invited participant notified" });
  } catch (error) {
    console.error("Error in notifySessionStarted Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}
