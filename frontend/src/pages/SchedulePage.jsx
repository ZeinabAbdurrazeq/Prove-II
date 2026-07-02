import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Loader2Icon,
  SendIcon,
  UserIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { invitationApi } from "../api/invitations";
import { availabilityApi } from "../api/availability";
import { PROBLEMS } from "../data/problems";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";
import {
  DAYS,
  getDayLabels,
  buildTimeRows,
  formatTimeLabel,
  scheduleToSelectedCells,
} from "../lib/availabilityGrid";

const LEVEL_FILTERS = [
  "All",
  "Entry-Level",
  "Junior",
  "Intermediate",
  "Advanced",
];

function nextDateForDay(dayName) {
  const order = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const target = order.indexOf(dayName);
  const today = new Date();
  const todayIdx = today.getDay();
  let diff = target - todayIdx;
  if (diff < 0) diff += 7;
  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function SchedulePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const dayLabels = getDayLabels(language);
  const problems = Object.values(PROBLEMS);
  const timeRows = buildTimeRows();

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [problem, setProblem] = useState(problems[0]?.title || "");
  const [difficulty, setDifficulty] = useState("easy");
  const [message, setMessage] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["allScheduleUsers", { levelFilter, search }],
    queryFn: () =>
      invitationApi.searchUsers(search, {
        level: levelFilter === "All" ? "" : levelFilter,
        sort: "score",
      }),
  });

  const users = useMemo(() => usersData?.users || [], [usersData]);
  const displayedUsers = useMemo(
    () =>
      levelFilter === "All"
        ? users
        : users.filter(
            (user) =>
              String(user.level || "Entry-Level").toLowerCase() ===
              levelFilter.toLowerCase(),
          ),
    [levelFilter, users],
  );

  useEffect(() => {
    if (selectedUser && !displayedUsers.some((user) => user._id === selectedUser._id)) {
      setSelectedUser(displayedUsers[0] || null);
      setSelectedCell(null);
      return;
    }

    if (!selectedUser && displayedUsers.length > 0) {
      setSelectedUser(displayedUsers[0]);
    }
  }, [displayedUsers, selectedUser]);

  const { data: availabilityData, isLoading: loadingAvailability } = useQuery({
    queryKey: ["userAvailability", selectedUser?._id],
    queryFn: () => availabilityApi.getUserAvailability(selectedUser._id),
    enabled: !!selectedUser?._id,
  });

  const availableCells = useMemo(
    () => scheduleToSelectedCells(availabilityData?.weeklySchedule),
    [availabilityData],
  );

  const sendMutation = useMutation({
    mutationFn: invitationApi.sendInvitation,
    onSuccess: () => {
      toast.success(t("schedule.sent"));
      queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
      navigate("/invitations");
    },
    onError: (error) =>
      toast.error(error.response?.data?.msg || t("schedule.sendError")),
  });

  const handleSend = () => {
    if (!selectedUser) return toast.error(t("schedule.selectUser"));
    if (!selectedCell) return toast.error(t("schedule.pickSlot"));
    if (!problem || !difficulty) return toast.error(t("schedule.chooseProblem"));

    const [day, time] = selectedCell.split("|");
    sendMutation.mutate({
      recipientId: selectedUser._id,
      scheduledDate: nextDateForDay(day),
      scheduledTime: time,
      problem,
      difficulty,
      message,
    });
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSelectedCell(null);
  };

  const availabilitySlotsByDay = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        slots: timeRows.filter((time) => availableCells.has(`${day}|${time}`)),
      })),
    [availableCells, timeRows],
  );

  const availabilityStatus = selectedUser
    ? availableCells.size > 0
      ? `Has availability: ${availableCells.size} slots`
      : t("schedule.noAvailability")
    : "";

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3 rtl:flex-row-reverse">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-3">
            <UsersIcon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{t("schedule.title")}</h1>
            <p className="text-sm text-base-content/60">{t("schedule.description")}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Candidates</h2>
                    <p className="text-sm text-base-content/60">
                      Search by name, choose a level, then inspect availability.
                    </p>
                  </div>
                  {loadingUsers ? <Loader2Icon className="size-5 animate-spin text-primary" /> : null}
                </div>

                <div className="mt-4">
                  <input
                    type="search"
                    className="input input-bordered input-sm w-full"
                    placeholder="Search by name"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {LEVEL_FILTERS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setLevelFilter(level)}
                      className={`btn btn-xs ${
                        levelFilter === level ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-base-200/60 px-3 py-2 text-xs font-semibold text-base-content/65">
                  Showing {displayedUsers.length}{" "}
                  {levelFilter === "All" ? "candidates from all levels" : `${levelFilter} candidates`}
                </div>

                <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                  {displayedUsers.map((user) => {
                    const active = selectedUser?._id === user._id;
                    const userLevel = user.level || "Entry-Level";

                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => selectUser(user)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                          active
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-base-300 bg-base-200/40 hover:bg-base-200"
                        }`}
                      >
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="size-11 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex size-11 items-center justify-center rounded-full bg-base-300">
                            <UserIcon className="size-5" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{user.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="badge badge-outline badge-sm bg-transparent">
                              Level: {userLevel}
                            </span>
                            {levelFilter !== "All" ? (
                              <span className="text-xs font-semibold text-success">
                                Matches selected level
                              </span>
                            ) : null}
                            <span className="text-xs font-semibold text-base-content/70">
                              {Number(user.score || 0)} pts
                            </span>
                          </div>
                        </div>
                        {active ? (
                          <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-content">
                            Selected
                          </span>
                        ) : null}
                      </button>
                    );
                  })}

                  {!loadingUsers && displayedUsers.length === 0 ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5 text-sm text-base-content/60">
                      {t("schedule.noUsers")}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {selectedUser ? (
              <div className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body flex-row items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    {selectedUser.profileImage ? (
                      <img
                        src={selectedUser.profileImage}
                        alt={selectedUser.name}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-base-300">
                        <UserIcon className="size-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold">{selectedUser.name}</p>
                      <p className="truncate text-xs text-base-content/60">
                        {selectedUser.level || "Entry-Level"} | {Number(selectedUser.score || 0)} pts
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCell(null)}>
                    {t("common.change")}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body p-6">
                <h2 className="text-lg font-bold">{t("schedule.tips")}</h2>
                <ul className="mt-4 space-y-3 text-sm text-base-content/70">
                  <li>{t("schedule.tip1")}</li>
                  <li>{t("schedule.tip2")}</li>
                  <li>{t("schedule.tip3")}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedUser ? (
              <>
                <div className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2 font-bold rtl:flex-row-reverse">
                        <CalendarIcon className="size-4" />
                        {selectedUser.name} {t("schedule.availabilityOf")}
                      </h2>
                      <span className="badge badge-outline">
                        {availabilityStatus || t("schedule.noAvailability")}
                      </span>
                    </div>

                    <div className="lg:hidden">
                      {loadingAvailability ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2Icon className="size-8 animate-spin text-primary" />
                        </div>
                      ) : availableCells.size === 0 ? (
                        <p className="py-4 text-sm opacity-60">{t("schedule.noAvailability")}</p>
                      ) : (
                        <div className="space-y-3">
                          {availabilitySlotsByDay.map(({ day, slots }) => (
                            <div
                              key={day}
                              className="rounded-2xl border border-base-300 bg-base-200/40 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="font-semibold">{dayLabels[day]}</h3>
                                <span className="badge badge-outline badge-sm">{slots.length}</span>
                              </div>
                              {slots.length === 0 ? (
                                <p className="mt-3 text-sm text-base-content/50">
                                  {t("schedule.noAvailability")}
                                </p>
                              ) : (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {slots.map((time) => {
                                    const key = `${day}|${time}`;
                                    const picked = selectedCell === key;
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedCell(key)}
                                        className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                                          picked
                                            ? "bg-primary text-primary-content shadow-sm"
                                            : "bg-success/80 text-success-content hover:bg-success"
                                        }`}
                                      >
                                        {formatTimeLabel(time, language)}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="hidden lg:block">
                      {loadingAvailability ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2Icon className="size-8 animate-spin text-primary" />
                        </div>
                      ) : availableCells.size === 0 ? (
                        <p className="py-4 text-sm opacity-60">{t("schedule.noAvailability")}</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <div className="select-none" style={{ minWidth: "640px" }}>
                            <div className="grid" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
                              <div />
                              {DAYS.map((day) => (
                                <div key={day} className="py-2 text-center text-sm font-semibold">
                                  {dayLabels[day]}
                                </div>
                              ))}
                            </div>

                            {timeRows.map((time) => (
                              <div
                                key={time}
                                className="grid items-stretch"
                                style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
                              >
                                <div className="py-1 pr-2 text-right text-xs text-base-content/60">
                                  {time.endsWith(":00") ? formatTimeLabel(time, language) : ""}
                                </div>
                                {DAYS.map((day) => {
                                  const key = `${day}|${time}`;
                                  const available = availableCells.has(key);
                                  const picked = selectedCell === key;
                                  return (
                                    <div
                                      key={key}
                                      onClick={() => available && setSelectedCell(key)}
                                      className={`h-6 border border-base-300/60 transition-colors ${
                                        picked
                                          ? "bg-primary"
                                          : available
                                            ? "cursor-pointer bg-success/80 hover:bg-success"
                                            : "bg-base-200"
                                      }`}
                                      title={
                                        available
                                          ? `${dayLabels[day]} ${formatTimeLabel(time, language)}`
                                          : ""
                                      }
                                    />
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedCell ? (
                      <p className="mt-3 text-sm">
                        {t("schedule.selected")} {" "}
                        <span className="font-semibold">
                          {dayLabels[selectedCell.split("|")[0]]} {" "}
                          {formatTimeLabel(selectedCell.split("|")[1], language)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body space-y-4 p-6">
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">{t("schedule.problem")}</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                      >
                        {problems.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title} ({p.difficulty})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">{t("schedule.difficulty")}</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">{t("schedule.message")}</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        rows={3}
                        placeholder={t("schedule.messagePlaceholder")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <button
                      className="btn btn-primary gap-2 rtl:flex-row-reverse"
                      onClick={handleSend}
                      disabled={sendMutation.isPending}
                    >
                      {sendMutation.isPending ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <SendIcon className="size-4" />
                      )}
                      {t("schedule.send")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="card min-h-[520px] border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body items-center justify-center p-10 text-center">
                  <CalendarIcon className="size-12 text-primary/70" />
                  <h2 className="mt-4 text-xl font-bold">Pick a user to continue</h2>
                  <p className="mt-2 max-w-md text-sm text-base-content/60">
                    Select anyone from the user list to inspect their saved availability.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
