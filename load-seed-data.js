//allows us to use environment variables. 
const client = require('./client');
// import our seed data:
const todos = require('./todos');

run();

async function run() {

    try {
        await client.connect();

        await client.query(`
            INSERT INTO user (email, hash)
            VALUES ($1, $2);
            `,

        ['copypast@copypasta.com', 'somedopepassword']);

        await Promise.all(
            todos.map(todo => {
                return client.query(`
                    INSERT INTO todos (task, complete, user_id)
                    VALUES ($1, $2, $3);
                `,
                [todo.task, todo.complete, todo.user_id]);
            })
        );

        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
    
}
