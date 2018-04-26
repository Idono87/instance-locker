const chai = require('chai');
const Locker = require('../lib/index');
const chaiProm = require('chai-as-promised');

chai.use(chaiProm);

chai.should();

describe('Global Lock Test', function() {

    let Lock_A;
    let Lock_B;

    before(function(){
        Lock_A = Locker('TestLock', false, true, 'Test/Path');
        Lock_B = Locker('TestLock', false, true,'Test/Path');
    });

    step('Should return true if instance A has been locked.', function(done){
        Lock_A.Lock().should.eventually.equal(true).notify(done)
    });

    step('Should return false because instance A has the lock', function(done){
        Lock_B.Lock().should.eventually.equal(false).notify(done);
    });


    //Test might fail in windows because the file handle for the lock file is still in use even 
    //though the file in the folder has been closed and unlinked. 
    step("Should return null when instance A is unlocked. - Might fail in windows because reasons. Check test comments for more info", function(done){
        Lock_A.Unlock().should.eventually.equal(undefined).notify(done)
    });

});


describe('User Lock Test', function() {

    let Lock_A;
    let Lock_B;

    before(function(){
        Lock_A = Locker('TestLock', false, false, 'UserTest/Path');
        Lock_B = Locker('TestLock', false, false, 'UserTest/Path');
    });

    step('Should return true if instance A has been locked.', function(done){
        Lock_A.Lock().should.eventually.equal(true).notify(done)
    });

    step('Should return false because instance A has the lock', function(done){
        Lock_B.Lock().should.eventually.equal(false).notify(done);
    });


    //Test might fail in windows because the file handle for the lock file is still in use even 
    //though the file in the folder has been closed and unlinked. 
    step("Should return null when instance A is unlocked. - Might fail in windows because reasons. Check test comments for more info", function(done){
        Lock_A.Unlock().should.eventually.equal(undefined).notify(done)
    });

});

describe('User & Global Simultanious Lock Test', function(){
    let Lock_A;
    let Lock_B;

    before(function(){
        Lock_A = Locker('TestLock', false, true, 'SimTest/Path');
        Lock_B = Locker('TestLock', false, false, 'UserSimTest/Path');
    });

    step("Should equall true because Lock A is successfull", function(done){
        Lock_A.Lock().should.eventually.equal(true).notify(done)
    });

    step("Should equall true because Lock B is successfull", function(done){
        Lock_B.Lock().should.eventually.equal(true).notify(done)
    });

    after(function(){
        Lock_A.Unlock();
        Lock_B.Unlock();
    });

})

describe("Unlock Test Global", function(){
    let Lock_A;
    let Lock_B;

    before(function(){
        Lock_A = Locker('UnlockTest', false, true, 'UnlockTestPath');
        Lock_B = Locker('UnlockTest', false, true, 'UnlockTestPath');
    });

    step("Lock B should return true", function(done){
        Lock_A.Lock().then(function(){
            return Lock_A.Unlock();
        }).then(function(){
            return Lock_B.Lock();
        }).should.eventually.equal(true).notify(done);
    });

    after(function(){
        Lock_B.Unlock();
    });
});


describe("Unlock Test User", function(){
    let Lock_A;
    let Lock_B;

    before(function(){
        Lock_A = Locker('UnlockTest', false, false, 'UnlockTestPath');
        Lock_B = Locker('UnlockTest', false, false, 'UnlockTestPath');
    });

    step("Lock B should return true", function(done){
        Lock_A.Lock().then(function(err){
            return Lock_A.Unlock();
        }).then(function(){
            return Lock_B.Lock();
        }).should.eventually.equal(true).notify(done);
    });

    after(function(){
        Lock_B.Unlock();
    });
})