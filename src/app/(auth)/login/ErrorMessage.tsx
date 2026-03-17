"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  if (!params.get("error")) return null;
  return <p className="text-red-400 text-sm">Invalid username or password.</p>;
}

export default function ErrorMessage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
