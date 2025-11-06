import * as React from "react";

const LAPTOP_MIN_BREAKPOINT = 768;
const LAPTOP_MAX_BREAKPOINT = 1440;

export function useIsLaptop() {
  const [isLaptop, setIsLaptop] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const checkIsLaptop = () => {
      const width = window.innerWidth;
      setIsLaptop(
        width >= LAPTOP_MIN_BREAKPOINT && width < LAPTOP_MAX_BREAKPOINT
      );
    };

    const mql = window.matchMedia(
      `(min-width: ${LAPTOP_MIN_BREAKPOINT}px) and (max-width: ${
        LAPTOP_MAX_BREAKPOINT - 1
      }px)`
    );
    const onChange = () => {
      checkIsLaptop();
    };

    mql.addEventListener("change", onChange);
    checkIsLaptop();

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isLaptop;
}
