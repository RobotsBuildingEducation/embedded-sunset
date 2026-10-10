const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export const getLocalAppCheckDebugToken = (hostname, configuredToken) => {
  if (!loopbackHosts.has(hostname)) return undefined;
  return configuredToken?.trim() || true;
};
