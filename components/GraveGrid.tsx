"use client";

import { useState } from "react";
import type { Grave } from "@/lib/github";
import { Tombstone } from "./Tombstone";

const PAGE = 24;

export function GraveGrid({ graves, login }: { graves: Grave[]; login: string }) {
  const [shown, setShown] = useState(PAGE);
  const rest = graves.length - shown;
  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-20 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {graves.slice(0, shown).map((g, i) => (
          <Tombstone key={g.name} grave={g} login={login} index={i % PAGE} position={i} />
        ))}
      </div>
      {rest > 0 && (
        <div className="mt-16 flex justify-center">
          <button onClick={() => setShown((s) => s + PAGE)} className="btn-mint rounded-full px-6 py-3.5 font-bold">
            Exhume {Math.min(rest, PAGE)} more <span className="font-medium opacity-60">({rest} still underground)</span>
          </button>
        </div>
      )}
    </>
  );
}
