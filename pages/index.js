import Head from "next/head";
import { useRouter } from "next/router";
import { OverhaulApp } from "@/components/OverhaulApp";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>OverHaul</title>
        <link rel="icon" type="image/x-icon" href="/LogoWithBackground.jpeg" />
        <meta
          name="description"
          content="A civic platform for reporting problems, voting on what matters, and tracking shipped fixes."
        />
      </Head>
      <OverhaulApp onOpenPlatform={() => router.push("/problems")} />
    </>
  );
}
