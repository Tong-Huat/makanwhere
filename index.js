import express, { request, response } from 'express';
import methodOverride from 'method-override';
// eslint-disable-next-line import/no-unresolved
import pg from 'pg';
import jsSHA from 'jssha';
import cookieParser from 'cookie-parser';

// const PORT = process.argv[2];

const app = express();
const SALT = 'i like cocomelon';

app.set('view engine', 'ejs');
// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());

// Initialise DB connection
const { Pool } = pg;
let pgConnectionConfigs;
if (process.env.ENV === 'PRODUCTION') {
  // determine how we connect to the remote Postgres server
  pgConnectionConfigs = {
    user: 'postgres',
    // set DB_PASSWORD as an environment variable for security.
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'birding',
    port: 5432,
  };
} else {
  pgConnectionConfigs = {
    user: 'midzham',
    host: 'localhost',
    database: 'makanwhere',
    port: 5432, // Postgres server always runs on this port by default
  };
}
const pool = new Pool(pgConnectionConfigs);

const renderWelcomePage = (request, response) => {
  console.log('welcome request came in');
  response.render('welcome');
};

const renderEstIndex = (request, response) => {
  console.log('index request came in');

  const listAllEstablishment = (error, result) => {
    const data = result.rows;
    if (error) {
      console.log('Error executing query', error.stack);
      response.status(503).send(result.rows);
      return;
    }
    console.log(data);
    const dataObj = { data };
    // console.log(`result: ${dataObj}`);

    // response.send(data);
    response.render('index', dataObj);
  };

  // Query using pg.Pool instead of pg.Client
  pool.query('SELECT * from establishments', listAllEstablishment);
};

const renderRegistration = (request, response) => {
  console.log('registration request came in');
  response.render('register');
};

// CB to retrieve user's data for registration
const registerUser = (request, response) => {
  console.log('retrieving user data');
  // initialise the jsSHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // input the password from the request to the SHA object
  shaObj.update(request.body.password);
  // get the hashed password as output from the SHA object
  const hashedPassword = shaObj.getHash('HEX');

  // store the hashed password in our DB
  const data = request.body;
  const values = [data.username, data.contact, data.email, hashedPassword];

  const insertData = 'INSERT INTO users (username, contact, email, password) VALUES ($1, $2, $3, $4)';

  pool.query(insertData, values, (err, result) => {
    if (err) {
      return response.status(500).send(err); /* return error message if insert unsuccessful */
    }
    response.redirect('/login');
  });
};

const renderLogin = (request, response) => {
  console.log('login request came in');
  response.render('login');
};

// CB to verify login details and login to acct if successful verification
const loginAccount = (request, response) => {
  console.log('trying to login');
  const values = [request.body.username];
  console.log(values);
  pool.query('SELECT * FROM users WHERE username=$1', values, (error, result) => {
    if (error) {
      console.log('Error executing query', error);
      response.status(503).send('request failed');
      return;
    }

    //  we didnt find a user with that email.
    if (result.rows.length === 0) {
      /* the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service. */
      response.status(403).send('sorry!');
      return;
    }

    // create new SHA object
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(request.body.password);
    const hashedPassword = shaObj.getHash('HEX');
    console.log(hashedPassword);
    if (result.rows[0].password === hashedPassword) {
      response.cookie('loggedIn', true);

      const shaObj1 = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      // create an unhashed cookie string based on user ID and salt
      const unhashedCookieString = `${result.rows[0].id}-${SALT}`;
      shaObj1.update(unhashedCookieString);
      const hashedCookieString = shaObj1.getHash('HEX');
      response.cookie('loggedInHash', hashedCookieString);
      response.cookie('userId', result.rows[0].id);
      response.redirect('/listings');
    } else {
      response.status(403).send('not successful');
    }
  });
};

app.get('/', renderWelcomePage);
app.get('/listings', renderEstIndex);
app.get('/register', renderRegistration);
app.post('/register', registerUser);
app.get('/login', renderLogin);
app.post('/login', loginAccount);

app.listen(3004);
