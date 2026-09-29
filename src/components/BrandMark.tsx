"use client";

import { useState } from "react";

export default function BrandMark({ className = "" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`text-lg font-semibold tracking-tight text-slate-900 dark:text-white ${className}`}
      >
        Ravan<span className="text-[#ef6306]">.ai</span>
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-lg dark:bg-white dark:px-2 dark:py-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ravan-logo.png"
        alt="Ravan.ai"
        width={500}
        height={175}
        onError={() => setFailed(true)}
        className={`h-7 w-auto ${className}`}
      />
    </span>
  );
}
