// Type definitions for instance-locker 1.1
// Project: https://github.com/Idono87/instance-locker
// Definitions by: Sorin Sandru (https://github.com/Idono87)

export as namespace InstanceLocker;

export = Locker;
declare function Locker(sProcessLockName: string, bSynchronized?: boolean | undefined, bGlobalLock?: boolean | undefined, sPath?: string | undefined): LockerBase;

declare interface LockerBase
{
    Lock(): any,
    Unlock(): any,
    GetOwnerPID(): any,
}

declare namespace Locker
{
    export interface LockerSync extends LockerBase
    {
        Lock(): boolean,
        Unlock(): boolean,
        GetOwnerPID(): number,
    }

    export interface LockerAsync extends LockerBase
    {
        Lock(): Promise<boolean>,
        Unlock(): Promise<void>,
        GetOwnerPID(): Promise<number>
    }
}
