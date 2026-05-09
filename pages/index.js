import Head from "next/head";
import { OverhaulApp } from "@/components/overhaul/OverhaulApp";

export default function Home() {
  return (
    <>
      <Head>
        <title>OverHaul</title>
        <meta
          name="description"
          content="A civic platform for reporting problems, voting on what matters, and tracking shipped fixes."
        />
      </Head>
      <OverhaulApp />
    </>
  );
}
