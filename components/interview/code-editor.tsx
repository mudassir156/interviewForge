"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Copy, RotateCcw, Loader2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { initSocket, on, off, emit } from "@/lib/socket";
import type { ExecutionResult } from "./execution-panel";

interface CodeEditorProps {
  roomId: string;
  userId?: string;
  onExecute?: (result: ExecutionResult) => void;
  onExecuting?: (isExecuting: boolean) => void;
  enableCollaboration?: boolean;
}

const INITIAL_CODE = {
  javascript: `// Write your JavaScript code here
function solution(arr) {
  // TODO: Implement your solution
  return arr;
}

// Test your code
console.log(solution([1, 2, 3, 4, 5]));`,
  python: `# Write your Python code here
def solution(arr):
    # TODO: Implement your solution
    return arr

# Test your code
print(solution([1, 2, 3, 4, 5]))`,
  java: `// Write your Java code here
public class Solution {
    public static int[] solution(int[] arr) {
        // TODO: Implement your solution
        return arr;
    }

    public static void main(String[] args) {
        // Test your code
        System.out.println(java.util.Arrays.toString(solution(new int[]{1, 2, 3, 4, 5})));
    }
}`,
  cpp: `// Write your C++ code here
#include <iostream>
#include <vector>
using namespace std;

vector<int> solution(vector<int> arr) {
    // TODO: Implement your solution
    return arr;
}

int main() {
    // Test your code
    vector<int> result = solution({1, 2, 3, 4, 5});
    return 0;
}`,
  go: `// Write your Go code here
package main

import "fmt"

func solution(arr []int) []int {
    // TODO: Implement your solution
    return arr
}

func main() {
    // Test your code
    fmt.Println(solution([]int{1, 2, 3, 4, 5}))
}`,
  rust: `// Write your Rust code here
fn solution(arr: Vec<i32>) -> Vec<i32> {
    // TODO: Implement your solution
    arr
}

fn main() {
    // Test your code
    println!("{:?}", solution(vec![1, 2, 3, 4, 5]));
}`,
};

export function CodeEditor({
  roomId,
  userId,
  onExecute,
  onExecuting,
  enableCollaboration = true,
}: CodeEditorProps) {
  const [language, setLanguage] =
    useState<keyof typeof INITIAL_CODE>("javascript");
  const [code, setCode] = useState(INITIAL_CODE.javascript);
  const [fontSize, setFontSize] = useState(14);
  const [isExecuting, setIsExecuting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteUpdate = useRef(false);

  // Initialize socket and subscribe to code:update from other participants
  useEffect(() => {
    if (!enableCollaboration) return;

    initSocket();

    const handleCodeUpdate = (data: {
      code: string;
      language: string;
      userId: string;
    }) => {
      // Ignore updates from self
      if (data.userId === userId) return;
      isRemoteUpdate.current = true;
      setCode(data.code);
      setLanguage(data.language as keyof typeof INITIAL_CODE);
    };

    on("code:update", handleCodeUpdate);
    return () => off("code:update", handleCodeUpdate);
  }, [enableCollaboration, userId]);

  // Emit code updates to room (debounced 300ms)
  const emitCodeUpdate = useCallback(
    (newCode: string, newLanguage: string) => {
      if (!enableCollaboration) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        emit("code:update", { roomId, code: newCode, language: newLanguage });
      }, 300);
    },
    [enableCollaboration, roomId],
  );

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!isRemoteUpdate.current) {
      emitCodeUpdate(newCode, language);
    }
    isRemoteUpdate.current = false;
  };

  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as keyof typeof INITIAL_CODE;
    setLanguage(lang);
    const newCode = INITIAL_CODE[lang];
    setCode(newCode);
    emitCodeUpdate(newCode, newLanguage);
  };

  const handleReset = () => {
    const newCode = INITIAL_CODE[language];
    setCode(newCode);
    emitCodeUpdate(newCode, language);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleExecute = async () => {
    if (!userId || isExecuting) return;
    setIsExecuting(true);
    onExecuting?.(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code, language, roomId, userId }),
      });
      const data = await res.json();
      const result: ExecutionResult = {
        output: data.output ?? "",
        error: data.error ?? null,
        success: data.success ?? false,
        executionTime: data.executionTime ?? 0,
      };
      onExecute?.(result);
    } catch (err) {
      onExecute?.({
        output: "",
        error: err instanceof Error ? err.message : "Execution failed",
        success: false,
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
      onExecuting?.(false);
    }
  };

  return (
    <Card
      className="border-border flex h-full flex-col flex-1 min-h-0"
      style={{
        overflow: "hidden",
        padding: 0,
        gap: 0,
        background: "rgba(13,20,36,0.85)",
        border: "1px solid rgba(30,45,69,0.9)",
      }}
    >
      {/* Toolbar */}
      <div
        className="border-b border-border flex items-center justify-between"
        style={{
          background: "rgba(13,20,36,0.95)",
          borderRadius: "0.875rem 0.875rem 0 0",
          flexShrink: 0,
          height: "48px",
          minHeight: "48px",
          padding: "0 0.75rem",
          gap: "0.5rem",
        }}
      >
        {/* Left: Language selector + font */}
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger
              className="w-36 h-8 text-sm"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#f1f5f9",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                zIndex: 9999,
                background: "#0d1424",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem
                  key={lang.id}
                  value={lang.id}
                  style={{ color: "#f1f5f9" }}
                >
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center gap-2">
            <span
              className="text-xs whitespace-nowrap"
              style={{ color: "#94a3b8" }}
            >
              Font {fontSize}px
            </span>
            <input
              type="range"
              min={10}
              max={20}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16 accent-indigo-500"
            />
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#cbd5e1",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#cbd5e1",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-1.5 rounded-md px-4 h-8 text-xs font-semibold transition-colors"
            style={{
              background: isExecuting ? "#4338ca" : "#4f46e5",
              color: "#ffffff",
              border: "none",
              cursor: isExecuting ? "not-allowed" : "pointer",
              boxShadow: "0 0 12px rgba(99,102,241,0.4)",
            }}
            onMouseEnter={(e) => {
              if (!isExecuting) e.currentTarget.style.background = "#6366f1";
            }}
            onMouseLeave={(e) => {
              if (!isExecuting) e.currentTarget.style.background = "#4f46e5";
            }}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" style={{ fill: "white" }} />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div
        className="flex-1 overflow-auto"
        style={{ borderRadius: "0 0 0.875rem 0.875rem" }}
      >
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "Fira Code, Courier New, monospace",
            lineHeight: "1.6",
          }}
          className="w-full h-full p-4 bg-input border-0 text-foreground focus:outline-none resize-none"
        />
      </div>
    </Card>
  );
}
