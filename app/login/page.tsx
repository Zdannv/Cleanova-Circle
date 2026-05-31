import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf9] dark:bg-stone-950" />}>
      <LoginClient />
    </Suspense>
  );
}
