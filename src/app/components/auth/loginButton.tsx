"use client";

import { useRouter } from "next/navigation";

export function LoginBtn({ text }: { text: string, }) {
  const route = useRouter()
  return (
    <button
      onClick={() => route.push("/login")} className="border rounded-md w-32 py-2 bg-gradient-to-r  from-purple-800 to-blue-600 bg-purple-800 hover:bg-purple-900 cursor-pointer  text-white">
      {text}
    </button>
  );
}
