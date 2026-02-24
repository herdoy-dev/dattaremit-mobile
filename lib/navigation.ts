import type { Router } from "expo-router";

/**
 * Type-safe router.replace that eliminates `as never` casts.
 */
export function typedReplace(router: Router, route: string) {
  router.replace(route as never);
}

/**
 * Type-safe router.push that eliminates `as never` casts.
 */
export function typedPush(router: Router, route: string) {
  router.push(route as never);
}
