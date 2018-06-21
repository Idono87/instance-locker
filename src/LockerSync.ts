import fs = require('fs');
import os = require('os');
import path = require('path');
import { GetTemporaryDir } from './utilities';
import LockerBase = require('./LockerBase');

class LockerSync extends LockerBase {
    
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
    * Synchronously locks a process instance.
    * 
    * Returns true if the lock was successfull otherwise it returns false. 
    * 
    * Errors will be thrown if file handling fails.
    */
    public Lock(): boolean{
        
        let fd: number = this.CreateLockFile();
        
        if(fd < 0) return false; 
        
        //Write the process pid into the lockfile.
        this.WriteLockFile(fd);
        
        this.CloseLockFile(fd);
        
        //Success! Return true.
        this.isLockOwner = true;
        return true;
    }
    
    
    
    /**
    * Synchronously unlocks the process instance.
    * 
    * Returns true if unlocking was a success. Returns false if there's no process to unlock.
    * 
    * If something fails during the unlock process an error is thrown.
    * 
    * Notice that on windows folders might not get deleted because the system hasn't properly released the open filehandle
    * when trying to delete the folder paths. Since the files are created in the temporary folders this shouldn't be a problem
    * since the temp folders usualy get deleted automatically after a restart. Make sure to cath any thrown errors since unlocking
    * the process should still delete the lock file.
    */
    public Unlock(): boolean
    {
        this.RemoveLockFile();
        return true;
    }
    
    
    /**
    * Returns the PID of owner for the current lock.
    * 
    * If no owner exists then it returns -1;
    * 
    * If any file errors occure, with the exception of ENOENT, then they will be thrown to the user.
    */
    public GetOwnerPID():number 
    {
        let fd:number = this.OpenLockFile();
        if(fd > 0)
        {
            let pid:number = this.ReadLockFile(fd);
            this.CloseLockFile(fd);
            if(this.IsProcessRunning(pid))
            {
                return pid;
            }
        }

        return -1;
    }
    
    
    
    /**
    * Creates lock file. Fails if there already is a lock file that isn't stale.
    */
    private CreateLockFile(): number
    {
        try
        {
            return fs.openSync(this.ResolvePath(), fs.constants.O_EXCL | fs.constants.O_CREAT |fs.constants.O_WRONLY);
        }
        catch(err)
        {
            if(err.code = 'EEXIST'){
                return this.CheckStaleness();
            }
            
            throw err;
        }
    }
    
    
    /**
    * Opens the lock file and returns a filehandel. If the file doesn't exist then it returns -1.
    * 
    * If something happens then an error is thrown.
    */
    private OpenLockFile():number
    {
        try 
        {
            return fs.openSync(this.ResolvePath(), fs.constants.O_RDONLY, null);   
        } 
        catch (err) 
        {
            if(err.code === "ENOENT"){
                return -1;
            }
            
            throw err;
        }
    }
    
    
    /**
    * Close the file either with the provided file handle or the stored one.
    * 
    * @param fd 
    */
    private CloseLockFile(fd: number): void
    {
        try
        {
            fs.closeSync(fd);
        }
        catch(err)
        {
            console.error(err);
        }
    }
    
    /**
    * Remove the lock file.
    */
    private RemoveLockFile(): void {
        try {
            fs.unlinkSync(this.ResolvePath());
        } catch (err) {
            if(err.code != "ENOENT")
            {
                console.error(err);
            }
        }
    }
    
    /**
    * Reads and returns the contents of the lockfile as a pid number.
    * 
    * May return somethinf else than a pid.
    * 
    * Throws an exception if something happens.
    * 
    * @param fd File Handle
    */
    private ReadLockFile(fd: number): number
    {
        let buff: Buffer = Buffer.alloc(20);
        fs.readSync(fd, buff, 0, 20, 0);
        return parseInt(buff.toString());   
    }
    
    
    /**
    * 
    * Write the pid to the file.
    * 
    * Error is thrown if the file failed to write.
    * 
    * @param fd File handle
    */
    private WriteLockFile(fd: number): void {
        fs.writeSync(fd, process.pid, 0, 'utf-8');
    }
    
    
    /**
    * Returns a filehandle if the file was stale. Otherwise it returns -1
    * 
    * 1. Check staleness.
    * 2. Remove stale lock.
    * 3. Create new lock.
    * 
    */
    private CheckStaleness(): number
    {
        try
        {
            let fd:number = fs.openSync(this.ResolvePath(), fs.constants.O_RDONLY);
            let pid:number = this.ReadLockFile(fd);
            fs.closeSync(fd);
            
            if(this.IsProcessRunning(pid))
            {
                return -1;
            }
            
            this.RemoveLockFile();
        }
        catch(err)
        {
            if(err.code != 'ENOENT')
            {
                throw err;
            }
        }
        
        return this.CreateLockFile();
        
    }
    
}


export = LockerSync;