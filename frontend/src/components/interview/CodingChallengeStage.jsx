import { useState, useEffect } from "react";
import { PROBLEMS } from "../../data/problems";
import { executeCode } from "../../lib/judge0";
import ProblemDescription from "../ProblemDescription";
import OutputPanel from "../OutputPanel";
import CodeEditorPanel from "../CodeEditorPanel";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import toast from "react-hot-toast";
import api from "../../api/axios";

function CodingChallengeStage({ sessionId, onFinish, t }) {
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Select 3 random easy problems
    const easyProblems = Object.values(PROBLEMS).filter((p) => p.difficulty === "Easy");
    const shuffled = [...easyProblems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setProblems(selected);
    if (selected.length > 0) {
      setCode(selected[0].starterCode["javascript"]);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const currentProblem = problems[currentIndex];

  const normalizeOutput = (out) => {
    return out
      .trim()
      .split("\n")
      .map((line) => line.trim().replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").replace(/\s*,\s*/g, ","))
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
    
    const result = await executeCode(selectedLanguage, code, {
      problemId: currentProblem.id,
      problemTitle: currentProblem.title,
      difficulty: currentProblem.difficulty,
      expectedOutput,
    });
    
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      const testsPassed = normalizeOutput(result.output) === normalizeOutput(expectedOutput);
      if (testsPassed) {
        toast.success("All tests passed! Great job!");
        setResults((prev) => ({
          ...prev,
          [currentProblem.id]: { passed: true, code },
        }));
      } else {
        toast.error("Code ran, but the sample output did not match.");
        setResults((prev) => ({
          ...prev,
          [currentProblem.id]: { passed: false, code },
        }));
      }
    } else {
      toast.error("Code execution failed!");
    }
  };

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Calculate score (7 points per solved problem)
    let score = 0;
    const codingProblems = problems.map(p => {
      const passed = results[p.id]?.passed || false;
      if (passed) score += 7;
      return {
        id: p.id,
        code: results[p.id]?.code || "",
        passed
      };
    });

    // Save coding score
    try {
      await api.post(`/ai-interview/${sessionId}/coding-score`, {
        codingScore: score,
        codingProblems,
      });
    } catch (err) {
      console.error("Failed to save coding score", err);
    }

    onFinish();
  };

  if (!currentProblem) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex h-screen w-full flex-col bg-base-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-300/50 bg-base-100 p-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Problem Solving Stage</h2>
          <p className="text-sm text-base-content/60">Problem {currentIndex + 1} of {problems.length}</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
            {timeString}
          </div>
          <button onClick={handleFinalSubmit} disabled={submitting} className="btn btn-error btn-sm">
            {submitting ? "Finishing..." : "Finish Interview"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-2 bg-base-200">
        {problems.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setCurrentIndex(idx);
              setCode(results[p.id]?.code || p.starterCode[selectedLanguage]);
              setOutput(null);
            }}
            className={`btn btn-sm ${currentIndex === idx ? 'btn-primary' : 'btn-ghost'}`}
          >
            {idx + 1}. {p.title} {results[p.id]?.passed && "✅"}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblem.id}
              allProblems={problems}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
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

export default CodingChallengeStage;
