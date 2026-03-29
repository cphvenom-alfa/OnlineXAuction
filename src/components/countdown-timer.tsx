"use client";
import { useEffect, useState } from "react";

function pad(n: number) { return n.toString().padStart(2, "0"); }

export function CountdownTimer({ endTime, compact }: { endTime: Date | string; compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      if (diff === 0) { setTimeLeft(p => ({ ...p, expired: true })); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s, expired: false });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (timeLeft.expired) return <span className="text-xs font-bold text-red-500">Ended</span>;

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span className="text-red-500">⏱</span>
        {timeLeft.d > 0 ? `${timeLeft.d}d ${timeLeft.h}h` : `${pad(timeLeft.h)}:${pad(timeLeft.m)}:${pad(timeLeft.s)}`}
      </div>
    );
  }

  const isUrgent = timeLeft.d === 0 && timeLeft.h < 1;

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? "text-red-600" : "text-gray-700"}`}>
      {[
        { label: "Days",  value: timeLeft.d  },
        { label: "Hours", value: timeLeft.h  },
        { label: "Mins",  value: timeLeft.m  },
        { label: "Secs",  value: timeLeft.s  },
      ].map(unit => (
        <div key={unit.label} className={`flex flex-col items-center rounded-xl px-3 py-2 min-w-[52px] ${
          isUrgent ? "bg-red-50 border border-red-200" : "bg-gray-100"
        }`}>
          <span className="text-xl font-black">{pad(unit.value)}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

