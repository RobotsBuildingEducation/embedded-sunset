import React from "react";
import { useColorMode } from "@chakra-ui/react";
import { translation } from "../../utility/translation.jsx";

const ARTWORK = [
  "human-guidance",
  "community-scholarships",
  "technology-imagination",
];

export default function WhyLearnSection({ copy, userLanguage }) {
  const { colorMode } = useColorMode();
  const artworkSuffix = colorMode === "dark" ? "-dark" : "";
  const localized = translation[userLanguage === "es" ? "es" : "en"];
  return (
    <section className="lp-why-section" aria-labelledby="landing-why-title">
      <div className="lp-container lp-section">
        <div className="lp-why-heading">
          <p className="lp-eyebrow">{copy.whyLabel}</p>
          <h2 id="landing-why-title">{copy.whyTitle}</h2>
        </div>
        <div className="lp-why-principles">
          {[1, 2, 3].map((number, index) => {
            const title = localized[
              `landing.whyLearn.section${number}.title`
            ].replace(/^\d+\.\s*/, "");
            const content =
              localized[`landing.whyLearn.section${number}.content`];
            const paragraphs = content.match(/^(.+?[.?])\s+([\s\S]+)$/);
            return (
              <article className="lp-why-principle" key={number}>
                <img
                  className="lp-why-illustration"
                  src={`/images/ethos/${ARTWORK[index]}${artworkSuffix}.svg`}
                  alt=""
                  width="320"
                  height="280"
                  loading="lazy"
                  decoding="async"
                />
                <h3>{title}</h3>
                <div className="lp-why-description">
                  <p className="lp-why-lead">
                    {paragraphs ? paragraphs[1] : content}
                  </p>
                  {paragraphs && <p>{paragraphs[2]}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
