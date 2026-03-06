"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  ArrowLeft,
  Code2,
  Zap,
  Users,
  Lightbulb,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SUPPORTED_LANGUAGES, DIFFICULTY_LEVELS } from "@/lib/constants";

const difficultyColors: Record<
  string,
  { gradient: string; glow: string; dot: string; label: string }
> = {
  easy: {
    gradient: "from-emerald-400 to-cyan-400",
    glow: "rgba(52,211,153,0.35)",
    dot: "bg-emerald-400",
    label: "Easy",
  },
  medium: {
    gradient: "from-amber-400 to-orange-400",
    glow: "rgba(251,191,36,0.35)",
    dot: "bg-amber-400",
    label: "Medium",
  },
  hard: {
    gradient: "from-rose-400 to-pink-500",
    glow: "rgba(251,113,133,0.35)",
    dot: "bg-rose-400",
    label: "Hard",
  },
};

export default function CreateRoomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a room.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          language,
          difficulty,
          createdBy: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      router.push(`/interview/${data.room.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const tips = [
    {
      icon: Code2,
      text: "Choose the programming language upfront so candidates can prepare mentally.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/15",
    },
    {
      icon: Zap,
      text: "Set difficulty to match the role — Medium suits most mid-level interviews.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/15",
    },
    {
      icon: Users,
      text: "Share the room link once created — candidates can join in under 10 seconds.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/15",
    },
  ];

  const diff = difficultyColors[difficulty];

  return (
    <DashboardLayout>
      {/* Inject font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');

        .cr-root *  { font-family: 'Instrument Sans', sans-serif; }
        .cr-heading { font-family: 'Bricolage Grotesque', sans-serif !important; }

        @keyframes cr-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cr-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes cr-pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; }
          50%       { box-shadow: 0 0 0 4px transparent; }
        }
        .cr-fade-up { animation: cr-fade-up 0.45s cubic-bezier(.22,.68,0,1.2) both; }

        .cr-shimmer-text {
          background: linear-gradient(110deg, #a78bfa 0%, #818cf8 35%, #60a5fa 55%, #a78bfa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cr-shimmer 3.5s linear infinite;
        }

        .cr-card {
          background: linear-gradient(
            145deg,
            color-mix(in srgb, var(--card) 92%, transparent) 0%,
            color-mix(in srgb, var(--card) 82%, transparent) 100%
          );
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .cr-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            145deg,
            color-mix(in srgb, var(--border) 85%, transparent) 0%,
            color-mix(in srgb, var(--border) 40%, transparent) 50%,
            color-mix(in srgb, var(--primary) 38%, transparent) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .cr-input {
          background: color-mix(in srgb, var(--card) 85%, transparent) !important;
          border: 1px solid color-mix(in srgb, var(--border) 92%, transparent) !important;
          border-radius: 12px !important;
          color: var(--foreground) !important;
          font-size: 14px !important;
          font-family: 'Instrument Sans', sans-serif !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .cr-input:focus {
          border-color: rgba(124,58,237,0.5) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
          outline: none !important;
        }
        .cr-input::placeholder {
          color: color-mix(in srgb, var(--muted-foreground) 80%, transparent) !important;
        }

        .cr-textarea {
          background: color-mix(in srgb, var(--card) 85%, transparent);
          border: 1px solid color-mix(in srgb, var(--border) 92%, transparent);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 14px;
          font-family: 'Instrument Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: none;
        }
        .cr-textarea:focus {
          border-color: rgba(124,58,237,0.5) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
          outline: none !important;
        }
        .cr-textarea::placeholder {
          color: color-mix(in srgb, var(--muted-foreground) 80%, transparent);
        }

        .cr-select-trigger {
          background: color-mix(in srgb, var(--card) 85%, transparent) !important;
          border: 1px solid color-mix(in srgb, var(--border) 92%, transparent) !important;
          border-radius: 12px !important;
          color: var(--foreground) !important;
          font-family: 'Instrument Sans', sans-serif !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .cr-select-trigger:focus, .cr-select-trigger[data-state=open] {
          border-color: rgba(124,58,237,0.5) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
        }

        .cr-submit-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important;
          border: 1px solid rgba(124,58,237,0.4) !important;
          transition: transform 0.18s, box-shadow 0.18s !important;
        }
        .cr-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(124,58,237,0.45) !important;
        }
        .cr-submit-btn:active:not(:disabled) { transform: translateY(0) !important; }

        .cr-tip-card {
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .cr-tip-card:hover {
          border-color: rgba(124,58,237,0.2) !important;
          background: rgba(124,58,237,0.05) !important;
          transform: translateX(3px);
        }

        .cr-back-btn:hover {
          background: color-mix(in srgb, var(--muted) 60%, transparent) !important;
          color: var(--foreground) !important;
        }
        .cr-cancel-btn:hover {
          background: color-mix(in srgb, var(--muted) 55%, transparent) !important;
          border-color: color-mix(in srgb, var(--border) 100%, var(--primary)) !important;
          color: var(--foreground) !important;
        }
      `}</style>

      <div className="cr-root max-w-2xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="cr-fade-up mb-10" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-3 mb-4">
            {/* Icon badge */}
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[14px] shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                boxShadow: "0 0 28px rgba(124,58,237,0.5)",
              }}
            >
              <Code2 className="h-5 w-5 text-white" />
            </div>
            {/* Tag */}
            <span
              className="text-[10.5px] font-bold uppercase tracking-[1.6px] px-3 py-1 rounded-full"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.22)",
                color: "#a78bfa",
              }}
            >
              New Session
            </span>
          </div>

          <h1 className="cr-heading text-[34px] font-extrabold leading-[1.15] tracking-[-0.8px] text-foreground mb-2">
            Create Interview <span className="cr-shimmer-text">Room</span>
          </h1>
          <p className="text-muted-foreground text-[14.5px] leading-relaxed">
            Configure a new technical interview session in seconds.
          </p>
        </div>

        {/* ── Form Card ──────────────────────────────────────────────────── */}
        <div
          className="cr-card cr-fade-up relative rounded-2xl p-8 mb-6"
          style={{
            boxShadow:
              "0 0 0 1px rgba(124,58,237,0.07), 0 32px 80px rgba(0,0,0,0.45)",
            animationDelay: "110ms",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 p-3.5 rounded-xl text-red-400 text-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-[13px] font-semibold text-foreground/85 tracking-[0.2px]"
              >
                Interview Title <span className="text-violet-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Array Data Structures Interview"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="cr-input h-12"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                A descriptive title helps candidates understand the focus area.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-[13px] font-semibold text-foreground/85 tracking-[0.2px]"
              >
                Description{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <textarea
                id="description"
                placeholder="Add context, instructions, or topics to be covered…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="cr-textarea w-full px-4 py-3 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Visible to all participants in the room.
              </p>
            </div>

            {/* Language & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Language */}
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-foreground/85 tracking-[0.2px]">
                  Programming Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="cr-select-trigger h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.id}
                        value={lang.id}
                        className="rounded-lg cursor-pointer text-foreground focus:bg-violet-500/10 focus:text-foreground text-[13.5px]"
                      >
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-foreground/85 tracking-[0.2px]">
                  Difficulty Level
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="cr-select-trigger h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem
                        key={level.id}
                        value={level.id}
                        className="rounded-lg cursor-pointer text-foreground focus:bg-violet-500/10 focus:text-foreground text-[13.5px]"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Difficulty bar */}
                {diff && (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${diff.dot}`}
                      style={{ boxShadow: `0 0 6px ${diff.glow}` }}
                    />
                    <div
                      className={`h-[3px] flex-1 rounded-full bg-gradient-to-r ${diff.gradient}`}
                      style={{
                        boxShadow: `0 0 8px ${diff.glow}`,
                        transition: "all 0.4s ease",
                      }}
                    />
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {diff.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/70" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard" className="sm:w-auto">
                <Button
                  variant="outline"
                  type="button"
                  className="cr-cancel-btn w-full sm:w-auto h-12 px-6 rounded-xl border-border bg-card/60 text-foreground/80 font-medium transition-all duration-200"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!title || isLoading}
                className="cr-submit-btn flex-1 h-12 rounded-xl text-white font-semibold disabled:opacity-40 disabled:pointer-events-none"
                style={{
                  boxShadow:
                    !title || isLoading
                      ? "none"
                      : "0 4px 24px rgba(124,58,237,0.35)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating room…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Create Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Tips ────────────────────────────────────────────────────────── */}
        <div
          className="cr-fade-up space-y-3"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center gap-2 px-1 mb-4">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400/70" />
            <span className="text-[10.5px] font-bold uppercase tracking-[1.6px] text-muted-foreground">
              Quick Tips
            </span>
          </div>
          {tips.map((tip, i) => (
            <div
              key={i}
              className={`cr-tip-card cr-fade-up flex items-start gap-3.5 rounded-2xl border ${tip.border} ${tip.bg} p-4`}
              style={{ animationDelay: `${(i + 4) * 65}ms` }}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${tip.bg}`}
                style={{ border: `1px solid ${tip.border}` }}
              >
                <tip.icon className={`h-3.5 w-3.5 ${tip.color}`} />
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed pt-1">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
