"use server";

let count = 0;

export async function getCount() {
  return count;
}

export async function incrementCount() {
  return ++count;
}
