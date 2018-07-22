import os = require("os");

export function GetTemporaryDir(bGlobal: boolean): string {
  switch (os.platform()) {
    case "win32":
      return bGlobal == true ? "C:\\\\Windows\\temp" : os.tmpdir();
    case "linux":
    case "openbsd":
    case "freebsd":
    case "sunos":
    case "aix":
    default:
      return os.tmpdir();
    case "darwin":
      return bGlobal == true ? "/tmp" : os.tmpdir();
  }
}
