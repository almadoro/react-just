"use client";

import { Navigate } from "@/types";
import { ReactNode, useCallback, useEffect } from "react";
import { createFromRscFetch, render, RSC_MIME_TYPE } from "react-just/client";
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

  createFromRscFetch<React.ReactNode>(
    fetch(window.location.href, { headers: { accept: RSC_MIME_TYPE } }),
  ).then((tree) => {
    // Avoid race conditions between multiple navigation events. Render only the latest one.
    if (currentNavId === navId) render(tree);
  });
}
