"use client";

import { Navigate } from "@/types";
import { ReactNode, startTransition, useCallback, useEffect } from "react";
import { createFromRscFetch, WINDOW_SHARED } from "react-just/client";
import NavigateContext from "../context/navigate";

interface NavigateProviderProps {
  children: ReactNode;
}

export default function NavigateProvider({ children }: NavigateProviderProps) {
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

  const navigate = useCallback<Navigate>((hrefOrDelta, options) => {
    if (typeof hrefOrDelta === "number") {
      window.history.go(hrefOrDelta);
      return;
    }

    if (options?.replace) {
      window.history.replaceState(null, "", hrefOrDelta);
      return;
    }

    window.history.pushState(null, "", hrefOrDelta);
  }, []);

  return <NavigateContext value={navigate}>{children}</NavigateContext>;
}

let currentNavId = 0;

function onNavigation() {
  const navId = ++currentNavId;

  const { root, rscMimeType } = window[WINDOW_SHARED];

  createFromRscFetch<React.ReactNode>(
    fetch(window.location.href, { headers: { accept: rscMimeType } }),
  ).then((tree) => {
    if (currentNavId === navId) startTransition(() => root.render(tree));
  });
}
