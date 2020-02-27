// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const client = require('./client');
// Initiate database connection
client.connect();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.static('public')); // server files from /public folder
app.use(express.json()); // enable reading incoming json data
// API Routes

app.use(express.urlencoded({ extended: true }));

//Auth Routes

const createAuthRoutes = require('./lib/auth/create-auth-routes');

const authRoutes = required('./lib/auth/'({
    selectUser(email) {
        return client.query(`
        SELECT id, email, hash
        FROM users
        WHERE email = $1
        `,
        [email]
        ).then(results => result[0]);
    },
    insertUser(user, hash) {
        return client.query(`
            INSERT into users (email,hash)
            VALUES ($1, $2)
            RETURNING id, email;
            `,
            [user.email, hash]
        ).then(result => result.rows[0]);
    }
});

//prior to ensure authRouts, but after middleware.
app.use('/api/auth', authRoutes);

//for all routes and on every request ensure there is a token.
const ensureAuth = require('./lib/auth/ensure-auth');

app.use('/api', ensureAuth);

// *** TODOS ***
//this get request returns a list of todos. It does that by using the SQL query callsed "select * from " *=all and rom 
app.get('/api/todos', async (req, res) => {

    try {
        const result = await client.query(`
            SELECT * FROM todos where users_id=$1
        `, [req.usersId]);
        
        //respond to the client with that data
        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }

});
//creates a new task post throws something new. 
app.post('/api/todos', async (req, res) => {
    try {
        
        const result = await client.query(`
            insert into todos (task, complete)
            values ($1, $2, $3) 
            returning *;  
        `,
//When using this post request the complete value is automatically set to false. See below. Whereas complete is set automatically to false as it is not attempting to grab information from the user. 
        [req.body.task, false, req.userId]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});
//put is = update. :id represent a dynamic id number like "4" UPDATE the todo table an SET the complete row. 
app.put('/api/todos/:id', async (req, res) => {
    const id = req.params.id;
    const todo = req.body;
console.log('update', todo);
    try {
        const result = await client.query(`
        UPDATE todos
        SET complete=$1
        WHERE id = ${req.params.id}
        RETURNING *;
            
        `, [req.body.complete]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    // get the id that was passed in the route:

    try {
        const result = await client.query(`
        DELETE from todos WHERE id=${req.params.id}
        `, [/* pass data */]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});