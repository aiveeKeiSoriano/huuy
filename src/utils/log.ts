export function makeLogger(scope: string) {
  const prefix = `[Huuy:${scope}]`;
  return {
    info:  (msg: string, ...args: unknown[]) => console.log(prefix, msg, ...args),
    error: (msg: string, ...args: unknown[]) => console.error(prefix, msg, ...args),
  };
}
