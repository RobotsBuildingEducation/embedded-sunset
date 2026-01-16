import { useEffect } from "react";
import { playSoundEffect } from "../utility/soundEffects";

const BUTTON_SELECTOR =
  'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]';

export const useGlobalButtonSound = () => {
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest(BUTTON_SELECTOR);
      if (!button) {
        return;
      }

      if (button.getAttribute("data-sound-disabled") === "true") {
        return;
      }

      playSoundEffect("select");
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);
};
