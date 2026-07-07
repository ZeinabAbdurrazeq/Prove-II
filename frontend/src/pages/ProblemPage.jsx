import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { problemsApi } from "../api/problems";
import { getDifficultyBadgeClass } from "../lib/utils";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/judge0";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { Loader2Icon } from "lucide-react";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { data: problemsData, isLoading: loadingProblems } = useQuery({
    queryKey: ["problems", "active"],
    queryFn: () => problemsApi.getProblems({ limit: 100 }),
  });

  const {
    data: problemData,
    isLoading: loadingProblem,
    isError: problemError,
  } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => problemsApi.getProblemById(id),
    enabled: Boolean(id),
    retry: false,
  });

  const allProblems = problemsData?.problems || [];
  const currentProblem = problemData?.problem || null;
  const currentProblemId = currentProblem?.id || id;

  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    if (currentProblem?.starterCode?.[selectedLanguage]) {
      setCode(currentProblem.starterCode[selectedLanguage]);
      setOutput(null);
    }
  }, [currentProblem, selectedLanguage]);

  useEffect(() => {
    if (!id && allProblems.length) {
      navigate(`/problem/${allProblems[0].id}`, { replace: true });
    }
  }, [allProblems, id, navigate]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem?.starterCode?.[newLang] || "");
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) =>
    navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const normalizeOutput = (output) => {
    // normalize output for comparison (trim whitespace, handle different spacing)
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          // remove spaces after [ and before ]
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          // normalize spaces around commas to single space after comma
          .replace(/\s*,\s*/g, ","),
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    if (!currentProblem) return;

    setIsRunning(true);
    setOutput(null);

    const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
    const result = await executeCode(selectedLanguage, code, {
      problemId: currentProblemId,
      problemTitle: currentProblem.title,
      difficulty: currentProblem.difficulty,
      expectedOutput,
    });
    setOutput(result);
    setIsRunning(false);

    // check if code executed successfully and matches expected output

    if (result.success) {
      const testsPassed = checkIfTestsPassed(result.output, expectedOutput);

      if (testsPassed) {
        triggerConfetti();
        const scoreUpdate = result.scoreUpdate;
        const pointsAdded = Number(scoreUpdate?.scoreDelta || 0);

        if (scoreUpdate && pointsAdded > 0) {
          toast.success(
            <div>
              <p className="font-semibold">Your new score: {Number(scoreUpdate.score || 0)}</p>
              <p>+{pointsAdded} points added</p>
            </div>,
          );
          queryClient.invalidateQueries({ queryKey: ["myScoreSummary"] });
          queryClient.invalidateQueries({ queryKey: ["mySolvedProblems"] });
          queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
        } else {
          toast.success("All tests passed! Great job!");
        }
      } else {
        toast.error("Code ran, but the sample output did not match.");
      }
    } else {
      toast.error("Code execution failed!");
    }
  };

  if (loadingProblem || loadingProblems) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2Icon className="mx-auto size-12 animate-spin text-primary" />
            <p className="mt-4 font-semibold">Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (problemError || !currentProblem) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-6">
          <div className="rounded-lg border border-base-300 bg-base-200 p-8 text-center">
            <h1 className="text-2xl font-black">Problem not found</h1>
            <p className="mt-2 text-base-content/60">
              This problem may be archived or unavailable.
            </p>
            <button
              className="btn btn-primary mt-5"
              onClick={() => navigate("/problems")}
            >
              Back to problems
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col overflow-x-hidden">
        <Navbar />

        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3 sm:px-4">
          <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-base-content">
                    {currentProblem.title}
                  </h1>
                  <p className="text-sm text-base-content/60">{currentProblem.category}</p>
                </div>
                <span
                  className={`badge ${getDifficultyBadgeClass(currentProblem.difficulty)}`}
                >
                  {currentProblem.difficulty}
                </span>
              </div>
              <div className="text-sm text-base-content/70">
                {currentProblem.description.text}
              </div>
            </div>
          </div>

          <div className="h-[60vh] min-h-[420px] overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={allProblems}
            />
          </div>

          <div className="h-[62vh] min-h-[440px] overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <CodeEditorPanel
              selectedLanguage={selectedLanguage}
              code={code}
              isRunning={isRunning}
              onLanguageChange={handleLanguageChange}
              onCodeChange={setCode}
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
        <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={allProblems}
            />
          </Panel>

          <PanelResizeHandle className={isMobile ? "h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" : "w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize"} />

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Output Panel*/}

              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
