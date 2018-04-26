import fs = require('fs');
import os = require('os');
import path = require('path');
import { GetTemporaryDir } from './utilities';
import LockerBase = require('./LockerBase');

/** 
 * The Locker class is responsible for keeping track of and maintaining the 
 * lock on a specified instance asynchronously.
*/
class LockerAsync extends LockerBase {
    
    
    
    /**
     * Calls the default implementation om the abstract constructor.
     * 
     * Creates the Locker with a unique process lock name and optional path for greater uniquness. 
     * The path will be created inside the OS default temporary directories. It is recommended
     * to specify the path in a unix wise fashion eg. "example/path".
     * 
     * @param sProcessLockName - The identifying lock name. Needs to be of length 5 or greater.
     * @param bGlobalLock - Set the lock as a global instance lock or a user instance lock.
     * @param sPath - The optional path.
     */
    constructor(sProcessLockName:string, bGlobalLock?: boolean, sPath?: string){
        super(sProcessLockName, bGlobalLock, sPath);
    }


    /**
     * Locks the app instance.
     * 
     * Returns a promise.
     * Resolves to true if the lock was successful, Fales if it failed to get the lock.
     * Rejects with an error.
     */
    public async Lock(): Promise<boolean>
    {
        try
        {
            let fd: number = await this.CreateLockFile();

            if(fd < 0) return false;
            
            await this.WriteLockFile(fd);
            await this.CloseLockFile(fd);
        }
        catch(err)
        {
            throw err;
        }

        return true;
    }


    /**
     * Unlocks and removes the lock file if possible.
     * 
     * Returns a promise.
     * Resolves to nothing.
     * Rejects with an error.
     */
    public async Unlock():Promise<void> 
    {
        await this.RemoveLockFile();   
    }


    /**
     * 
     * Create the lock file. 
     * 
     * Returns a promise that resolves to a file handle. If the file handle is positive 
     * then the creation of the lock was successfull. Else the filehandle is negative and the lock is taken.
     * 
     * Rejects an error.
     * 
     */
    private async CreateLockFile(): Promise<number> {
        return await new Promise<number>( (resolve, reject) : void =>
        {
            //Create the file.
            fs.open(this.ResolvePath(), fs.constants.O_EXCL | fs.constants.O_CREAT | fs.constants.O_WRONLY, null, (err: any, fd: number): void => {
                if(err){

                    if(err.code == "EEXIST"){
                        resolve(this.CheckStaleness());
                        return;
                    }

                    reject(err);
                    return;
                }

                resolve(fd);
            });
        });

    }

    /**
     * Removes the lock file from the specified file path.
     * 
     * Returns a promise that rejects to an error.
     */
    private RemoveLockFile(): Promise<void> {
        return new Promise((resolve, reject): void => {
            //Unlink the lock file.
            fs.unlink(this.ResolvePath(), (err:any):void => {
                if(err == null || err.code == 'ENOENT'){
                    resolve();
                    return;
                }

                reject(err);
            });
        });
    }


    /**
     * Closes the lock file.
     * 
     * Returns a promise. Rejects with an error.
     * 
     */
    private CloseLockFile(fd: number): Promise<void>{
        return new Promise((resolve, reject): void => {
            fs.close(fd, (err: any): void => {
                if(err){
                    reject(err);
                    return
                }

                resolve();
            });
        });
    }


    /**
     * Read the contents of the lock file.
     * 
     * Returns a promise that resolves to the process PID. Otherwise an error is passed if rejected.
     * 
     * @param fd File handle.
     */
    private ReadLockFile(fd:number): Promise<number>
    {
        return new Promise<number>(function(resolve, reject): void {
            fs.read(fd, Buffer.alloc(20), 0, 20, 0, (err:any, bytesRead:number, buff:Buffer): void => 
            {
                if(err){
                    reject(err);
                    return;
                }

                resolve(parseInt(buff.toString()));
            });
        });
    }

    


    /**
     * Writes the current process id to the opened file.
     *
     * Returns a promise. If rejected an error is passed.
     * 
     * 
     * @param fd File Handle.
     */
    private WriteLockFile(fd: number): Promise<void>{
        return new Promise( function(resolve, reject): void{
            fs.write(fd, process.pid, 0, "utf-8", function(err: any, written: number, string:string):void
            {
                if(err){
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }


    /**
     * Returns a positive file handle if the lock was stale. If the file isn't stale then a negative value will be passed.
     * 
     * Throws an error if something happened.
     * 
     * 1. Check staleness.
     * 2. Remove stale lock.
     * 3. Create new lock.
     * 
     */
    private async CheckStaleness():Promise<number>
    {

        try
        {
            let fd:number = await new Promise<number>(
                (resolve, reject) => 
                fs.open(this.ResolvePath(), fs.constants.O_RDONLY, null, (err, fd) => 
                {
                    if(err){
                        reject(err);
                        return;
                    }

                    resolve(fd);
                })
            );

            let pid:number = await this.ReadLockFile(fd);

            await this.CloseLockFile(fd);

            if(this.IsProcessRunning(pid)){
                return -1;
            }
        }
        catch(err)
        {
            if(err.code != "ENOENT") 
            {
                await this.RemoveLockFile()
                throw err;
            }
        }

        return await this.CreateLockFile();
    }
}


export = LockerAsync;