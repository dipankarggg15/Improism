import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Improism AI | Under development",
  description: "Improism AI is under development.",
};

export default function AiPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-6 text-center text-black">
      <h1 className="text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
        Under development
      </h1>
    </main>
  );
}
