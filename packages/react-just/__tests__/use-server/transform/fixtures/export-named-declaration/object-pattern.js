"use server";

export let {
  a,
  b: { c },
  d: [e],
  f = 1,
  ...g
} = {};
