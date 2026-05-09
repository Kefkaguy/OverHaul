import Head from "next/head";
import { useRouter } from "next/router";
import { OverhaulApp } from "@/components/OverhaulApp";

export default function Problems() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Problems · OverHaul</title>
        <meta
          name="description"
          content="Explore civic problems, upvote what matters, and track builders working on fixes."
        />
      </Head>
      <OverhaulApp
        initialView="detail"
        initialProblemId="p2"
        onGoHome={() => router.push("/")}
      />
    </>
  );
}
