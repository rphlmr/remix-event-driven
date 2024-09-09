export function toObjectMap<T extends readonly string[]>(
  array: T
): { [K in T[number]]: K } {
  return Object.fromEntries(array.map((item) => [item, item])) as {
    [K in T[number]]: K;
  };
}
