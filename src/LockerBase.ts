import os = require("os");
import path = require("path");
import { GetTemporaryDir } from "./utilities";
import Crypto = require("crypto");

/**
 * Abstract definition of the locker class
 */
abstract class LockerBase {
  protected readonly sProcessName: string;
  protected readonly sPath?: string;
  protected readonly bGlobalLock: boolean;
  protected isLockOwner: boolean;

  /**
   * Creates the Locker with a unique process lock name and optional path for greater uniquness.
   * The path will be created inside the OS default temporary directories. It is recommended
   * to specify the path in a unix wise fashion eg. "example/path".
   *
   * @param sProcessLockName - The identifying lock name. Needs to be of length 5 or greater.
   * @param bGlobalLock - Set the lock as a global instance lock or a user instance lock.
   * @param sPath - The optional path.
   */
  constructor(sProcessLockName: string, bGlobalLock?: boolean, sPath?: string) {
    //A minimum of 5 chars.
    if (sProcessLockName.length < 5) {
      throw new Error("The process name has to be larger than 5 charachters.");
    }

    this.bGlobalLock = bGlobalLock == null ? true : bGlobalLock;

    if (sPath != null) {
      this.sPath = sPath;
    }

    this.sProcessName = sProcessLockName;
    this.isLockOwner = false;

    process.on("exit", () => this.OnExit());
  }

  public abstract Lock(): any;
  public abstract Unlock(): any;
  public abstract GetOwnerPID(): any;

  /**
   * Resolves the path to the lock file by combining the
   * temporary directory based on the global flag, the provided path if it's provided,
   *  a user name if the global flag is false and the process name.
   */
  protected ResolvePath(): string {
    return path.resolve(GetTemporaryDir(this.bGlobalLock), this.HashLockName());
    console.log(this.HashLockName());
  }

  /**
   * Returns true or false if the process is running or not. Throws an error if user privilages are wrong.
   *
   * @param pid Process Id
   */
  protected IsProcessRunning(pid: number): boolean {
    try {
      process.kill(pid, 0);
    } catch (err) {
      if (err.code === "ESRCH") return false;

      throw err;
    }

    return true;
  }

  /**
   * Hash lock name from the given path and process name.
   */
  protected HashLockName(): string {
    let hash: Crypto.Hash = Crypto.createHash("sha1");

    let joinPath: string = path.join(
      this.sPath != null ? this.sPath : "",
      this.bGlobalLock || os.platform() == "win32"
        ? ""
        : os.userInfo().username,
      this.sProcessName
    );

    hash.update(joinPath);
    return hash.digest("hex");
  }

  //Try to remove the lockfile if the process exits without unlocking the lock.
  protected OnExit(): void {
    if (this.isLockOwner) {
      this.Unlock();
    }
  }
}

export = LockerBase;
