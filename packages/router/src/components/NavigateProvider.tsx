"use client";

import { Navigate } from "@/types";
import { ReactNode, useCallback, useEffect } from "react";
import { createFromRscFetch, render, RSC_MIME_TYPE } from "react-just/client";
import NavigateContext from "../context/navigate";
import { removeTrailingSlashes } from "../utils";

interface NavigateProviderProps {
  children: ReactNode;
  trailingSlashes: "remove";
}

export default function NavigateProvider({
  children,
  trailingSlashes,
}: NavigateProviderProps) {
  useEffect(() => {
    if (trailingSlashes === "remove")
      window.history.replaceState(
        null,
        "",
        removeTrailingSlashes(new URL(window.location.href)),
      );
  }, [trailingSlashes]);

  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.addEventListener("popstate", onNavigation);

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      onNavigation();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      onNavigation();
    };

    return () => {
      window.removeEventListener("popstate", onNavigation);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const navigate = useCallback<Navigate>(
    (hrefOrDelta, options) => {
      if (typeof hrefOrDelta === "number") {
        window.history.go(hrefOrDelta);
        return;
      }

      let url = new URL(hrefOrDelta, window.location.href);

      if (trailingSlashes === "remove") url = removeTrailingSlashes(url);

      if (options?.replace) {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }
    },
    [trailingSlashes],
  );

  return <NavigateContext value={navigate}>{children}</NavigateContext>;
}

let currentNavId = 0;

function onNavigation() {
  const navId = ++currentNavId;

  // Don't use exactly the same URL as the one we're trying to load to avoid
  // sharing cache between the RSC and the HTML.
  const url = new URL(window.location.href);
  url.searchParams.set("__rsc__", "1");

  createFromRscFetch<{ tree: ReactNode }>(
    fetch(url, { headers: { accept: RSC_MIME_TYPE } }),
  ).then(({ tree }) => {
    // Avoid race conditions between multiple navigation events. Render only the latest one.
    if (currentNavId === navId) render(tree);
  });
}
