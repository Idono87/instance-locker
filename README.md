# Instance Locker
Lightweight and simple instance locking library. It can limit app instances to run as a single instance either in the global or user scope. 
The locker has synchronized and asynchronous capabilities where the async version is built ontop of promises. 

## Locker
To initiate a locker. Request a new locker object from the instance-locker.

```javascript
    const il = requier('instance-locker');

    const locker = il("LockName");

    locker.Lock().then((success) => 
    {
        if(success) 
        {
            console.log("Locker Taken!");
            locker.Unlock().catch((err) => console.error(err));
        }
        else 
        {
            console.log("Locker Occupied!")
        }
    }).catch((err) => console.error(err));
```

To use the synchronized version of the locker. Pass a true boolean value as the second parameter when requesting the object.
Notice that by design the locker is either an asynchronous locker or synchronized locker.

```javascript
    const il = requier('instance-locker');

    const locker = il("LockName", true);

    try
    {
        let success = locker.Lock();

        if(success) 
        {
            locker.Unlock();
            console.log("Locker Taken!");
        }
        else 
        {
            console.log("Locker Occupied!")
        }

    }
    catch (err)
    {
        (err) => console.error(err)
    }
```

## Instance-Locker Initialization
The locker init function is quite straight forward. It only requiers a lock name to function. But can be configured in slightly different ways.

### Locker(lockname[,synchronized[,global[,path]]])

* lockname **string** - name of the locker. Should be unique to the application.
* synchronized **boolean** - indicates if a async or sync locker should be used. **Default:** false
* global **boolean** - indicates if the lock should be global or user specific. **Default:** true
* path **string** - adds extra uniqueness to the lock name. **Default:** empty.

Returns a new Locker object that's either synchronized or asynchronous. 


### Locker.Lock() - Async version

Returns a promise that resolves to a boolean value indicating success or failure to take the locker. If an error occures the promise rejects with the error.

### Locker.Lock() - Sync version

Returns a boolean value indicating success or failure to take the locker. Will throw an error if something significant occures while trying to grab the locker.

### Locker.Unlock() - Async version

Returns a promise that doesn't return a value when resolved. If an error occures an the promise rejects with an error.

### Locker.Unlock() - Sync version

Throws an error if something significant occures while unlocking and removing the locker.

### Locker.GetOnwerPID() - Async Version

Returns a promise that eventually resolves to the PID of the lock owner otherwise it resolves to -1 if there is no lock. Promise rejects if an error occures during the process.


### Locker.GetOwnerPID() - Sync Version

Returns PID of the owner. If there's no lock -1 will be returned. Errors will be thrown if the method fails.

#### Side note. 

All methods throw file related errors and should be handeled by the user.


## mechanisms at work
The instance locker follows these steps to ensure that only one instance can take the locker.

1. Create the lock file. If it doesn't exist jump to step 4.
2. Check the lock staleness. If stale then jump to step 1. 
3. Notify that the lock is occupied. **End here**
4. Write the lock file.
5. Notify that the lock has been taken successfully.

This should ensure that no race condition occures if multiple instances of the same application are run back to back. Thus forces all but one instance to fail the locking procedure. 


## Side notes

The library is not limited to only instance locking. An example is file locking between applications that use this module.

To contribute to the project visit the github page at https://github.com/Idono87/instance-locker


## Changelog
* 1.1.2 
    - Fixed a bug in the async locker where staleness checks infinitely looped when the lock was available.
* 1.1.1
    - Added Typescript Definition files.
* 1.1.0
    - Added "GetOwnerPid" method to the async and sync lockers.



