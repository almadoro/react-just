"use client";

import { LinkProps } from "@/types";
import { ReactElement, useCallback } from "react";
import useNavigate from "../hooks/use-navigate";

export default function Link({
  href,
  replace,
  ...props
}: LinkProps): ReactElement {
  const navigate = useNavigate();

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      props.onClick?.(e);

      if (e.defaultPrevented) return;

      const isExternal = e.currentTarget.origin !== window.location.origin;
      if (isExternal) return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Left button
      if (e.button !== 0) return;

      const target = e.currentTarget.getAttribute("target");
      if (target && target !== "_self") return;

      if (e.currentTarget.getAttribute("download")) return;

      e.preventDefault();

      navigate(href, { replace });
    },
    [href, replace, props.onClick, navigate],
  );

  return <a {...props} href={href} onClick={onClick} />;
}
