//
// Launch options shared by the CLI PDF renderer and the dev-server integration.
//
// Local runs use the Playwright-managed Chromium. CI points at a system browser
// instead, because Playwright's bundled build does not run on NixOS:
//
//   PLAYWRIGHT_CHROMIUM_EXECUTABLE=chromium
//   PLAYWRIGHT_CHROMIUM_ARGS="--no-sandbox"
//
// A bare command is resolved against PATH, since NixOS only guarantees the
// name of the wrapped binary, not its store path.
import { accessSync, constants } from 'node:fs';
import { isAbsolute, join } from 'node:path';

function resolveExecutable(command) {
  if (isAbsolute(command) || command.includes('/')) return command;

  for (const dir of (process.env.PATH ?? '').split(':')) {
    if (!dir) continue;
    const candidate = join(dir, command);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Not here; keep looking.
    }
  }

  return command;
}

export function chromiumLaunchOptions() {
  const executable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const args = (process.env.PLAYWRIGHT_CHROMIUM_ARGS ?? '')
    .split(/\s+/)
    .filter(Boolean);

  return {
    ...(executable ? { executablePath: resolveExecutable(executable) } : {}),
    ...(args.length ? { args } : {}),
  };
}
