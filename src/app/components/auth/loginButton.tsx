"use client";

import { signIn} from "next-auth/react";
import { Session } from "next-auth";

export function LoginBtn({ session }: { session?: Session | null }) {
  return (
    <button
      onClick={() => signIn("google")} className="border rounded-md w-52 py-2 bg-purple-800 hover:bg-purple-900 cursor-pointer  text-white">
        Login
    </button>
  );
}
