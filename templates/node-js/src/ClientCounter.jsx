"use client";

import "./ClientCounter.css";

import { useState } from "react";

export default function ClientCounter() {
  const [count, setCount] = useState(0);

  return (
    <button
      className="client-counter"
      onClick={() => setCount((prev) => prev + 1)}
    >
      Client count: {count}
    </button>
  );
}
