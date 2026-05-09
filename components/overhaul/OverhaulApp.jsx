import { useState } from "react";
import { WebApp } from "./web-app";
import {
  TweakRadio,
  TweakSection,
  TweakToggle,
  TweaksPanel,
  useTweaks,
} from "./tweaks-panel";

const TWEAK_DEFAULTS = {
  dark: true,
  density: "comfortable",
  variant: "data-heavy",
};

export function OverhaulApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = t.dark ? "dark" : "light";
  const [webView, setWebView] = useState("landing");
  const [activeProblemId, setActiveProblemId] = useState("p1");

  const goToProblem = (id) => {
    setActiveProblemId(id);
    setWebView("detail");
  };

  return (
    <div
      id="web-stage"
      className="show"
      data-theme={theme}
      data-density={t.density}
      style={{
        "--navy-1": "#07111c",
        "--navy-2": "#0D1B2A",
        "--navy-3": "#1B263B",
        "--navy-4": "#243349",
        "--steel": "#415A77",
        "--mute": "#778DA9",
        "--bone": "#E0E1DD",
        "--paper": "#F4F4EE",
        "--ink": "#0D1B2A",
        "--signal": "#FFD60A",
        "--signal-ink": "#0D1B2A",
        "--hot": "#FF4D2E",
      }}
    >
      <WebApp
        view={webView}
        setView={setWebView}
        activeProblemId={activeProblemId}
        goToProblem={goToProblem}
        tweaks={t}
        theme={theme}
      />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakToggle
          label="Dark mode"
          value={t.dark}
          onChange={(v) => setTweak("dark", v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact", "comfortable"]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakRadio
          label="Card variant"
          value={t.variant}
          options={["data-heavy", "minimal"]}
          onChange={(v) => setTweak("variant", v)}
        />
      </TweaksPanel>
    </div>
  );
}
