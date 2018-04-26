const chai = require('chai');
const Locker = require('../lib/index');

chai.should();


describe("Global Sync Lock Test", function(){
    let Lock_A; 
    let Lock_B;

    before(function(){
        Lock_A = Locker('TestLockSync', true, true, 'path/to/test');
        Lock_B = Locker('TestLockSync', true, true, 'path/to/test');
    });

    step('Should equal true since the process has been locked.', function(){
        Lock_A.Lock().should.equal(true);
    })

    step('Should equal false since another process owns the lock.', function(){
        Lock_B.Lock().should.equal(false);
    });
});


describe("User Lock Sync Test", function(){
    let Lock_A; 
    let Lock_B;

    before(function(){
        Lock_A = Locker('TestLockSync', true, false, 'path/to/test' );
        Lock_B = Locker('TestLockSync', true, false, 'path/to/test' );
    });

    step('Should equal true since the process has been locked.', function(){
        Lock_A.Lock().should.equal(true);
    })

    step('Should equal false since another process owns the lock.', function(){
        Lock_B.Lock().should.equal(false);
    });
});



describe("User/Global Simultanious Lock Sync Test", function(){
    let Lock_A; 
    let Lock_B;

    before(function(){
        Lock_A = Locker('TestGlobalLockSync', true, true, 'global/path/to/test');
        Lock_B = Locker('TestUserLockSync', true, false, 'user/path/to/test');
    });

    step('Should equal true since this is a global lock.', function(){
        Lock_A.Lock().should.equal(true);
    })

    step('Should equal true since this is a user lock.', function(){
        Lock_B.Lock().should.equal(true);
    });
});

describe("Unlocking Sync Test", function(){

    let Lock_A; 
    let Lock_B;

    before(function(){
        Lock_A = Locker('TestLockSync', true, true, 'Unlock/path/to/test');
        Lock_B = Locker('TestLockSync', true, true, 'Unlock/path/to/test');
    });

    step("Lock B should return true when locked and Lock A should return true when unlocked. - Can fail in windows. Read Test file", function(){
        Lock_A.Lock();

        //Test might fail in windows because the file handle for the lock file is still in use even 
        //though the file in the folder has been closed and unlinked. 
        Lock_A.Unlock().should.equal(true);

        Lock_B.Unlock().should.equal(true);
    });
});