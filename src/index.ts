import LockerBase = require("./LockerBase");
import LockerAsync = require("./LockerAsync");
import LockerSync = require("./LockerSync");

/**
 * Return an instantiated Locker that is async or sync based on the bSynchronized value. If True then a synchronized
 * locker will be returned. If the value is ommited then an async verion is returned.
 *
 * @param sProcessLockName - Name to use for the lock file.
 * @param bSynchronized - Optional. Create a synchronized or asynchronized version of the locker?
 * @param bGlobalLock - Optional. Should the lock be global or user specific. True for Global false for User. Defaults to true.
 * @param sPath - Optional. Define a specific for the lock file in the temporary folder.
 */
export = function(
  sProcessLockName: string,
  bSynchronized?: boolean,
  bGlobalLock?: boolean,
  sPath?: string
): LockerBase {
  if (bSynchronized != null && bSynchronized == true) {
    //Change to synchronized lock when implemented.
    return new LockerSync(sProcessLockName, bGlobalLock, sPath);
  } else {
    return new LockerAsync(sProcessLockName, bGlobalLock, sPath);
  }
};
