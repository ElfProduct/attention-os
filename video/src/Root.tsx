import React from "react";
import { Composition } from "remotion";
import data from "./data.json";
import { Film, Poster } from "./Film";

export const Root: React.FC = () => (
  <>
    <Composition
      id="AttentionOSExplainer"
      component={Film}
      durationInFrames={Math.ceil((data.durationMs / 1000) * data.fps)}
      fps={data.fps}
      width={1440}
      height={810}
    />
    <Composition
      id="AttentionOSPoster"
      component={Poster}
      durationInFrames={1}
      fps={30}
      width={1440}
      height={810}
    />
  </>
);
