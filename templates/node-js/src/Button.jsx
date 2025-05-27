"use client";

import "./Button.css";

import { useState } from "react";

export default function Button() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>count is {count}</button>;
}
