function djb2(input: string) {
  let hash = 5381;

  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }

  return (hash >>> 0).toString(16);
}

export function fingerprintError(error: Error) {
  const stack = typeof error.stack === "string" ? error.stack : "";
  const lines = stack.split("\n").slice(0, 3).join("\n");

  return djb2(`${error.name}\n${lines}`);
}
