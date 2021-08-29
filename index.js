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
    port: 5432,
  };
}
const pool = new Pool(pgConnectionConfigs);

// Auth Middleware
const getHash = (input) => {
  // create new SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });

  // create an unhashed cookie string based on user ID and salt
  const unhashedString = `${input}-${SALT}`;

  // generate a hashed cookie string using SHA object
  shaObj.update(unhashedString);

  return shaObj.getHash('HEX');
};

app.use((request, response, next) => {
  // set the default value
  request.isUserLoggedIn = false;

  // check to see if the cookies you need exists
  if (request.cookies.loggedIn && request.cookies.userId) {
    // get the hased value that should be inside the cookie
    const hash = getHash(request.cookies.userId);

    // test the value of the cookie
    if (request.cookies.loggedIn === hash) {
      request.isUserLoggedIn = true;
    }
  }

  next();
});

// Auth middleware to restrict users only access
const restrictToLoggedIn = (request, response, next) => {
  // is the user logged in? Use the other middleware.
  if (request.loggedIn === false) {
    response.redirect('/login');
  } else {
    // The user is logged in. Get the user from the DB.
    const userQuery = 'SELECT * FROM users WHERE id=$1';
    pool.query(userQuery, [request.cookies.userId])
      .then((userQueryResult) => {
        // can't find the user based on their cookie.
        if (userQueryResult.rows.length === 0) {
          response.redirect('/login');
          return;
        }

        // attach the DB query result to the request object.
        request.user = userQueryResult.rows[0];

        // go to the route callback.
        next();
      }).catch((error) => {
        response.redirect('/login');
      });
  }
};

// CB for routes
// CB to render welcome page
const renderWelcomePage = (request, response) => {
  console.log('welcome request came in');
  response.render('welcome');
};

// CB to render all listing page
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

// CB to render registration page
const renderRegistration = (request, response) => {
  if (request.isUserLoggedIn === true) {
    response.redirect('/listing');
    return;
  }
  console.log('registration request came in');
  response.render('register');
};

// CB to retrieve user's data for registration
const registerUser = (request, response) => {
  if (request.isUserLoggedIn === true) {
    response.redirect('/listing');
    return;
  }
  console.log('retrieving user data');
  // initialise the jsSHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });

  // TODO: further form validation
  if (!request.body.email || !request.body.password) {
    response.redirect('/register');
  }

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

// CB to render login page
const renderLogin = (request, response) => {
  if (request.isUserLoggedIn === true) {
    response.redirect('/listing');
    return;
  }
  console.log('login request came in');
  response.render('login');
};

// CB to verify login details and login to acct if successful verification
const loginAccount = (request, response) => {
  if (request.isUserLoggedIn === true) {
    response.redirect('/listing');
    return;
  }
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
      // eslint-disable-next-line max-len
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
      response.redirect('/listing');
    } else {
      response.status(403).send('not successful');
    }
  });
};

// CB to del cookies and logout
const logout = (request, response) => {
  // Remove cookies from response header to log out
  response.clearCookie('loggedIn');
  response.clearCookie('userId');
  response.clearCookie('loggedInHash');
  response.redirect('/');
};

app.get('/', renderWelcomePage);
app.get('/listing', restrictToLoggedIn, renderEstIndex);
app.get('/register', renderRegistration);
app.post('/register', registerUser);
app.get('/login', renderLogin);
app.post('/login', loginAccount);
// logs the user out
app.get('/logout', logout);
app.listen(3004);
