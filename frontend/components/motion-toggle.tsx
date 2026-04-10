"use client";

import { usePageTransition } from "@/components/providers/transition-provider";
import type { MotionPreference } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MotionToggleProps {
  compact?: boolean;
}

const motionOptions: Array<{
  value: MotionPreference;
  label: string;
}> = [
  { value: "system", label: "系统" },
  { value: "full", label: "完整" },
  { value: "reduced", label: "简化" },
];

export function MotionToggle({ compact = false }: MotionToggleProps) {
  const { motionPreference, setMotionPreference, shouldReduceMotion } =
    usePageTransition();

  const helperText =
    motionPreference === "system"
      ? `当前跟随系统：${shouldReduceMotion ? "简化" : "完整"}`
      : shouldReduceMotion
        ? "当前使用简化动效"
        : "当前使用完整动效";

  return (
    <div className={cn("px-4 py-2", compact && "px-0 py-0")}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">动效</p>
          {!compact && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {motionOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMotionPreference(option.value)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              motionPreference === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
