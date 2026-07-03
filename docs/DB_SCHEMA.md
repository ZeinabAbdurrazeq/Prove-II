# ProveIt Database Schema

This document describes the current MongoDB schema used by the ProveIt platform. It was generated from the Mongoose models in `backend/src/models`.

## Database

- Database type: MongoDB
- ODM: Mongoose
- Main connection: `backend/src/lib/db.js`
- Connection environment variable: `DB_URL`

## Collections Overview

| Collection | Mongoose Model | Purpose |
| --- | --- | --- |
| `users` | `User` | Stores application users, Clerk identity mapping, score, level, and role. |
| `subscriptions` | `Subscription` | Stores plan, billing period, and AI interview limits per user. |
| `sessions` | `Session` | Stores live coding sessions, host/participant state, difficulty, selected problem, and Stream call id. |
| `invitations` | `Invitation` | Stores scheduled session invitations and acceptance/decline state. |
| `notifications` | `Notification` | Stores in-app notifications for invitations and session events. |
| `availabilities` | `Availability` | Stores weekly availability slots for scheduling. |
| `codesubmissions` | `CodeSubmission` | Stores Judge0-backed problem submission attempts and score deltas. |
| `candidateprofiles` | `CandidateProfile` | Stores AI CV analysis and adaptive interview progress per user. |
| `aiinterviewsessions` | `AIInterviewSession` | Stores AI interview attempts, questions, answers, scores, and final reports. |
| `interviewquestions` | `InterviewQuestions` | Stores seeded interview question bank records for RAG/question selection. |
| `blogposts` | `BlogPost` | Stores localized public/admin blog posts. |

## Entity Relationship Summary

```text
User 1--1 Subscription
User 1--1 Availability
User 1--1 CandidateProfile
User 1--N CodeSubmission
User 1--N AIInterviewSession
User 1--N Session as host
User 1--N Session as participant/invitedParticipant
User 1--N Invitation as sender
User 1--N Invitation as recipient
User 1--N Notification as recipient/sender
Invitation 0--1 Session
Session 0--1 Invitation
AIInterviewSession N--N InterviewQuestions through questions.questionId
```

## User

Model file: `backend/src/models/User.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `name` | String | Yes | none | Display name. |
| `email` | String | Yes | none | Unique. |
| `profileImage` | String | No | `""` | Avatar URL. |
| `clerkId` | String | Yes | none | Unique Clerk user id. |
| `role` | String enum | No | `user` | `user`, `admin`. |
| `score` | Number | No | `0` | Minimum 0. |
| `level` | String enum | No | `Entry-Level` | `Entry-Level`, `Junior`, `Intermediate`, `Advanced`. |
| `scoreStats.easySolved` | Number | No | `0` | Minimum 0. |
| `scoreStats.mediumSolved` | Number | No | `0` | Minimum 0. |
| `scoreStats.hardSolved` | Number | No | `0` | Minimum 0. |
| `scoreStats.totalSolved` | Number | No | `0` | Minimum 0. |
| `scoreStats.successRate` | Number | No | `0` | 0 to 100. |
| `scoreStats.lastActivityBonusDate` | String | No | `""` | Daily bonus date key. |
| `scoreStats.lastUpdated` | Date | No | `Date.now` | Stats update time. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes and constraints:

- Unique: `email`
- Unique: `clerkId`

## Subscription

Model file: `backend/src/models/Subscription.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `userId` | ObjectId ref `User` | Yes | none | Unique subscription owner. |
| `plan` | String enum | No | `free` | `free`, `pro`, `premium`. |
| `status` | String enum | No | `active` | `active`, `cancelled`, `expired`. |
| `currentPeriodStart` | Date | No | none | Billing period start. |
| `currentPeriodEnd` | Date | No | none | Billing period end. |
| `aiInterviewsUsedThisMonth` | Number | No | `0` | Monthly usage counter. |
| `aiInterviewsLimit` | Number | No | `3` | `-1` means unlimited in plan logic. |
| `cancelledAt` | Date | No | `null` | Cancellation time. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes and constraints:

- Unique: `userId`

## Session

Model file: `backend/src/models/Session.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `problem` | String | No | `""` | Current selected problem title. |
| `difficulty` | String enum | Yes | none | `easy`, `medium`, `hard`. |
| `host` | ObjectId ref `User` | Yes | none | Session creator/host. |
| `participant` | ObjectId ref `User` | No | `null` | User who joined or accepted invitation. |
| `invitedParticipant` | ObjectId ref `User` | No | `null` | Reserved invited user for private sessions. |
| `invitation` | ObjectId ref `Invitation` | No | `null` | Source invitation. |
| `selectedProblemId` | String | No | `""` | Current selected problem id. |
| `startedNotificationSentAt` | Date | No | `null` | Host-started notification marker. |
| `participantStartedNotificationSentAt` | Date | No | `null` | Participant-started notification marker. |
| `status` | String enum | No | `active` | `active`, `completed`. |
| `callId` | String | Yes | none | Unique Stream video/chat id. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes and constraints:

- Unique: `callId`
- Index: `{ status: 1, createdAt: -1 }`
- Index: `{ host: 1 }`
- Index: `{ participant: 1 }`
- Index: `{ invitedParticipant: 1 }`

## Invitation

Model file: `backend/src/models/Invitation.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `senderId` | ObjectId ref `User` | Yes | none | Inviter. |
| `recipientId` | ObjectId ref `User` | Yes | none | Invitee. |
| `scheduledDate` | String | Yes | none | Format `YYYY-MM-DD`. |
| `scheduledTime` | String | Yes | none | Format `HH:MM`. |
| `duration` | Number | No | `60` | Minutes. |
| `problem` | String | No | `""` | Legacy/optional problem title. |
| `difficulty` | String enum | Yes | none | `easy`, `medium`, `hard`. |
| `message` | String | No | `""` | Optional sender note. |
| `status` | String enum | No | `pending` | `pending`, `accepted`, `declined`. |
| `sessionId` | ObjectId ref `Session` | No | `null` | Created after acceptance. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes:

- `{ recipientId: 1, status: 1 }`
- `{ senderId: 1 }`

## Notification

Model file: `backend/src/models/Notification.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `recipientId` | ObjectId ref `User` | Yes | none | Notification owner. |
| `senderId` | ObjectId ref `User` | Yes | none | Notification actor. |
| `type` | String enum | Yes | none | `session-invitation`, `invitation-accepted`, `invitation-declined`, `session-reminder`, `session-started`. |
| `status` | String enum | No | `unread` | `unread`, `read`. |
| `relatedInvitationId` | ObjectId ref `Invitation` | No | `null` | Related invitation. |
| `relatedSessionId` | ObjectId ref `Session` | No | `null` | Related session. |
| `message` | String | No | `""` | Display message. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes:

- `{ recipientId: 1, status: 1 }`

## Availability

Model file: `backend/src/models/Availability.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `userId` | ObjectId ref `User` | Yes | none | Unique owner. |
| `weeklySchedule.monday` | Slot[] | No | `[]` | Time ranges. |
| `weeklySchedule.tuesday` | Slot[] | No | `[]` | Time ranges. |
| `weeklySchedule.wednesday` | Slot[] | No | `[]` | Time ranges. |
| `weeklySchedule.thursday` | Slot[] | No | `[]` | Time ranges. |
| `weeklySchedule.friday` | Slot[] | No | `[]` | Time ranges. |
| `weeklySchedule.saturday` | Slot[] | No | `[]` | Time ranges. |
| `weeklySchedule.sunday` | Slot[] | No | `[]` | Time ranges. |
| `timezone` | String | No | `Africa/Cairo` | Scheduling timezone. |
| `updatedAt` | Date | No | `Date.now` | Explicit update marker plus timestamps. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |

Slot subdocument:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `startTime` | String | Yes | Format `HH:MM`. |
| `endTime` | String | Yes | Format `HH:MM`. |

Indexes and constraints:

- Unique: `userId`

## CodeSubmission

Model file: `backend/src/models/CodeSubmission.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `userId` | ObjectId ref `User` | Yes | none | Submitter. |
| `problemId` | String | Yes | none | Practice problem id. |
| `problemTitle` | String | Yes | none | Practice problem title. |
| `difficulty` | String enum | Yes | none | `easy`, `medium`, `hard`. |
| `language` | String | No | `""` | `javascript`, `python`, or `java` from frontend runner. |
| `accepted` | Boolean | Yes | none | Whether output matched expected output. |
| `firstTry` | Boolean | No | `false` | Accepted with no previous attempts. |
| `solvedPointsAwarded` | Number | No | `0` | Easy 10, medium 20, hard 35. |
| `firstTryBonusAwarded` | Number | No | `0` | 5 when applicable. |
| `dailyBonusAwarded` | Number | No | `0` | 3 when applicable. |
| `wrongPenaltyApplied` | Number | No | `0` | -2 once per problem for wrong attempt. |
| `scoreDelta` | Number | No | `0` | Total score impact of this submission. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes:

- `{ userId: 1, problemId: 1, createdAt: 1 }`
- `{ userId: 1, accepted: 1 }`

## CandidateProfile

Model file: `backend/src/models/CandidateProfile.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `userId` | ObjectId ref `User` | Yes | none | Unique owner. |
| `primaryField` | String | No | `fullstack` | CV-inferred field. |
| `yearsOfExperience` | Number | No | `0` | CV-inferred experience. |
| `keySkills` | String[] | No | `[]` | CV skills. |
| `strongestAreas` | String[] | No | `[]` | CV strengths. |
| `notableTechnologies` | String[] | No | `[]` | CV technologies. |
| `cvSummary` | String | No | `""` | Summary fed to AI interview. |
| `preferredDifficulty` | String enum | No | `medium` | `easy`, `medium`, `hard`. |
| `questionsAskedIds` | ObjectId[] ref `InterviewQuestions` | No | `[]` | Prevents repeats. |
| `totalInterviewsCompleted` | Number | No | `0` | Progress metric. |
| `overallAverageScore` | Number | No | `0` | Progress metric. |
| `topicWeaknesses` | Object | No | `{}` | Adaptive topic tracking. |
| `topicStrengths` | Object | No | `{}` | Adaptive topic tracking. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes and constraints:

- Unique: `userId`

## AIInterviewSession

Model file: `backend/src/models/AIInterviewSession.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `userId` | ObjectId ref `User` | Yes | none | Candidate. |
| `cvAnalysis` | Object | No | `{}` | Snapshot of candidate profile. |
| `language` | String enum | No | `en` | `en`, `ar`. |
| `interviewerName` | String | No | `Zara` | AI interviewer. |
| `currentStage` | String | No | `intro` | Interview stage. |
| `targetRole` | String | No | `""` | Optional target role. |
| `jobDescription` | String | No | `""` | Optional job description. |
| `questions` | Question[] | No | `[]` | Asked questions and answers. |
| `status` | String enum | No | `in-progress` | `in-progress`, `completed`. |
| `overallScore` | Number | No | `0` | Final score. |
| `overallFeedback` | String | No | `""` | Final feedback. |
| `strengths` | String[] | No | `[]` | Final strengths. |
| `weaknesses` | String[] | No | `[]` | Final weaknesses. |
| `recommendation` | String | No | `""` | Final recommendation. |
| `reportSummary` | String | No | `""` | Final report summary. |
| `stageHistory` | Object[] | No | `[]` | Stage transitions. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Question subdocument:

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `questionId` | ObjectId ref `InterviewQuestions` | No | none | Optional question bank link. |
| `questionText` | String | Yes | none | Spoken question. |
| `topic` | String | No | `""` | Topic tag. |
| `difficulty` | String | No | `""` | `easy`, `medium`, `hard`. |
| `stage` | String | No | `technical` | Interview stage. |
| `userAnswer` | String | No | `""` | Transcribed answer. |
| `aiFeedback` | String | No | `""` | Per-answer feedback. |
| `score` | Number | No | `0` | 0 to 10. |
| `timeSpent` | Number | No | `0` | Seconds. |
| `followUpAsked` | Boolean | No | `false` | Follow-up flag. |
| `followUpAnswer` | String | No | `""` | Follow-up answer. |

Indexes:

- `{ userId: 1, createdAt: -1 }`

## InterviewQuestions

Model file: `backend/src/models/InterviewQuestions.js`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `questionText` | String | Yes | none | Question prompt. |
| `category` | String | Yes | none | Topic category. |
| `fieldRelevance` | String[] | Yes | none | Relevant candidate fields. |
| `difficulty` | String enum | Yes | none | `easy`, `medium`, `hard`. |
| `followUpQuestions` | String[] | No | `[]` | Suggested follow-ups. |
| `expectedKeywords` | String[] | No | `[]` | Evaluation hints. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes:

- `fieldRelevance` indexed through field definition.
- `{ fieldRelevance: 1, difficulty: 1 }`

## BlogPost

Model file: `backend/src/models/BlogPost.js`

Localized text subdocument:

| Field | Type | Default |
| --- | --- | --- |
| `en` | String | `""` |
| `ar` | String | `""` |

Blog section subdocument:

| Field | Type | Notes |
| --- | --- | --- |
| `heading` | LocalizedText | Section heading. |
| `body` | LocalizedText | Section body. |

Blog post document:

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `title` | LocalizedText | No | localized empty strings | Title in EN/AR. |
| `slug` | String | Yes | none | Unique, lowercase. |
| `excerpt` | LocalizedText | No | localized empty strings | Listing excerpt. |
| `category` | LocalizedText | No | localized empty strings | Post category. |
| `readTime` | LocalizedText | No | localized empty strings | Read-time label. |
| `author` | LocalizedText | No | localized empty strings | Author label. |
| `content` | BlogSection[] | No | `[]` | Localized article sections. |
| `published` | Boolean | No | `false` | Public visibility. |
| `publishedAt` | Date | No | `null` | Publication date. |
| `createdAt` | Date | Auto | auto | Mongoose timestamp. |
| `updatedAt` | Date | Auto | auto | Mongoose timestamp. |

Indexes and constraints:

- Unique: `slug`
- Index: `{ published: 1, publishedAt: -1 }`
- Index: `{ slug: 1 }`, unique

## Scoring Rules

Source: `backend/src/services/scoreService.js`

| Rule | Value |
| --- | --- |
| Easy solved points | 10 |
| Medium solved points | 20 |
| Hard solved points | 35 |
| First try bonus | 5 |
| Daily activity bonus | 3 |
| Wrong submission penalty | -2 |

User level thresholds:

| Score Range | Level |
| --- | --- |
| 0 to 99 | Entry-Level |
| 100 to 199 | Junior |
| 200 to 299 | Intermediate |
| 300+ | Advanced |

## Notes

- Practice problems are currently frontend data in `frontend/src/data/problems.js`; solved attempts are persisted in `CodeSubmission`.
- Session video/chat state is created in Stream using `callId`; MongoDB stores the durable session metadata.
- Authentication identity is owned by Clerk; MongoDB stores the application user mapping through `clerkId`.
