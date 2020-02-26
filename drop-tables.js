const client = require('./client');

run();

async function run() {

    try {
        await client.connect();
    
        await client.query(`
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS todos;
        `);

        console.log('drop tables complete');
    }
    catch (err) {
        console.log(err);
    } 
    finally {
        client.end();
    }
    
}