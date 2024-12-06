import dbClient from './utils/db';

async function notBusyWaiting() {
  while (!dbClient.isAlive()) {
    console.log("not alive");
    await new Promise(r => setTimeout(r, 2000));
  }
}

(async () => {
    console.log(dbClient.isAlive());
    console.log(dbClient.isAlive());
    await notBusyWaiting();
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
    dbClient.createUser('sks', '1234').then(res => {
      console.log('res: ', res);
    }).catch((err) => {
      console.log('err: ', err);
    });
    console.log(await dbClient.nbUsers());

})();

/**
 * echo 'db.users.find()' | mongo files_manager
 * { "_id" : ObjectId("5f1e7d35c7ba06511e683b21"), "email" : "bob@dylan.com" }
 */
