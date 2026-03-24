import { FadeInDown } from "react-native-reanimated";

/** Standard page content animation with spring */
export const fadeInSpring = (delay = 200) => FadeInDown.delay(delay).duration(600).springify();

/** Faster animation for lists and secondary content */
export const fadeInFast = (delay = 200) => FadeInDown.delay(delay).duration(500);

/** Staggered animation for list items */
export const fadeInStagger = (index: number, baseDelay = 200, staggerMs = 60) =>
  FadeInDown.delay(baseDelay + index * staggerMs).duration(400);
