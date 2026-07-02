import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const { language } = useLanguage();
  const t = getTranslator(language);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">{t("dashboard.createNewSession")}</h3>

        <div className="space-y-8">
          {/* DIFFICULTY SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select difficulty</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <select
              className="select w-full"
              value={roomConfig.difficulty}
              onChange={(e) => {
                setRoomConfig({
                  difficulty: e.target.value,
                });
              }}
            >
              <option value="" disabled>
                Choose a difficulty level...
              </option>

              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

          {/* ROOM SUMMARY */}
          {roomConfig.difficulty && (
            <div className="alert alert-success">
              <Code2Icon className="size-5" />
              <div>
                <p className="font-semibold">{t("dashboard.roomSummary")}</p>
                <p>
                  Difficulty:{" "}
                  <span className="font-medium">{roomConfig.difficulty}</span>
                </p>
                <p className="text-sm">Choose the problem after joining the session.</p>
                <p>
                  {t("dashboard.maxParticipants")}:{" "}
                  <span className="font-medium">{t("dashboard.participantsNote")}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            {t("common.cancel")}
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.difficulty}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating ? t("dashboard.creating") : t("dashboard.create")}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;
