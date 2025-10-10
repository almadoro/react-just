"use client";

import { useActionState } from "react";
import { incrementCount } from "./db";
import "./ServerCounter.css";

export default function ServerCounter({ initialCount }) {
  const [count, formAction] = useActionState(incrementCount, initialCount);

  return (
    <form action={formAction}>
      <button className="server-counter" type="submit">
        Server count: {count}
      </button>
    </form>
  );
}
