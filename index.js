/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import express, { request, response } from 'express';
import methodOverride from 'method-override';
// eslint-disable-next-line import/no-unresolved
import pg from 'pg';
import jsSHA from 'jssha';
import cookieParser from 'cookie-parser';
import bindRoutes from './routes.mjs';
import areas from './areas.mjs';
import * as auth from './auth.mjs';
import getHash from './utility.mjs';

const PORT = process.env.PORT || 3004;

const app = express();
const SALT = 'i like cocomelon';

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());

// Initialise DB connection
const { Pool } = pg;
let pgConnectionConfigs;

// test to see if the env var is set. Then we know we are in Heroku
if (process.env.DATABASE_URL) {
  // pg will take in the entire value and use it to connect
  pgConnectionConfigs = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else if (process.env.PROVIDER === 'AWS') {
  // determine how we connect to the remote Postgres server
  pgConnectionConfigs = {
    user: 'postgres',
    // set DB_PASSWORD as an environment variable for security.
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'makan',
    port: 5432,
  };
} else {
  pgConnectionConfigs = {
    user: 'midzham',
    host: 'localhost',
    database: 'makan',
    port: 5432,
  };
}
const pool = new Pool(pgConnectionConfigs);

// Auth Middleware

app.use(auth.setUserLogIn);

bindRoutes(app, pool);
// app.get('/', renderWelcomePage);
// app.get('/listing', renderEstIndex);
// app.get('/register', renderRegistration);
// app.post('/register', registerUser);
// app.get('/login', renderLogin);
// app.post('/login', loginAccount);
// app.get('/logout', logout);
// app.get('/listing/:id', renderEstablishment);
// app.delete('/listing/:id', auth.restrictToLoggedIn(pool), deleteEst);
// app.get('/add', auth.restrictToLoggedIn(pool), renderAddEst);
// app.post('/add', addEst);
// app.get('/listing/:id/edit', auth.restrictToLoggedIn(pool), renderEditPage);
// app.put('/listing/:id', editPage);
// app.get('/surprise', auth.restrictToLoggedIn(pool), renderSurprise);
// app.post('/surprise', getSurprise);
// app.post('/listing/:id', addComment);
app.listen(PORT);
