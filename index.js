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

const renderAddEst = (request, response) => {
  pool.query('SELECT * from Establishments', (error, result) => {
    const data = result.rows;
    const dataObj = { data };
    const areaData = { areas };
    pool.query('SELECT * FROM cuisines', (cuisineError, cuisineResult) => {
      const cuisineData = { cuisines: cuisineResult.rows };
      response.render('addEsta', { dataObj, areaData, cuisineData });
    });
  });
};

const addEst = (request, response) => {
  const { userId } = request.cookies;
  console.log(`userId:${userId}`);
  const {
    name, address, area, contact, email,
  } = request.body;

  let { cuisines } = request.body;
  console.log(request.body);
  const addQuery = `INSERT INTO establishments (name, address, area, cuisine, contact, email, user_id) VALUES ('${name}','${address}','${area}', '${cuisines}', '${contact}','${email}','${userId}') returning id`;
  console.log(addQuery);

  pool.query(addQuery, (addError, addResult) => {
    if (addError) {
      console.log('adderror', addError);
    } else {
      const estId = addResult.rows[0].id;
      if (!Array.isArray(cuisines)) {
        cuisines = [cuisines];
      }
      cuisines.forEach((cuisine) => {
        const cuisineIdQuery = `SELECT id FROM cuisines WHERE cuisine = '${cuisine}'`;

        pool.query(cuisineIdQuery, (cuisineIdQueryError, cuisineIdQueryResult) => {
          if (cuisineIdQueryError) {
            console.log('error:', cuisineIdQueryError);
          } else {
            const cuisineId = cuisineIdQueryResult.rows[0].id;
            console.log('cuisineid:', cuisineId);
            const cuisineData = [estId, cuisineId];

            const estCuisinesEntry = 'INSERT INTO establishments_cuisines (establishment_id, cuisine_id) VALUES ($1, $2)';

            pool.query(estCuisinesEntry, cuisineData, (estCuisinesEntryError, estCuisinesEntryResult) => {
              if (estCuisinesEntryError) {
                console.log('error', estCuisinesEntryError);
              } else {
                console.log('done');
              }
            });
          }
        });
      });
      response.redirect('/listing');
    }
  });
};

const renderSurprise = (request, response) => {
  const areaData = { areas };
  response.render('surprise', areaData);
};

const getSurprise = (request, response) => {
  const { area } = request.body;
  console.log('area:', area);

  const surpriseQuery = `SELECT * FROM establishments WHERE area = '${area}'`;
  pool.query(surpriseQuery, (surpriseQueryErr, surpriseQueryResult) => {
    if (surpriseQueryErr) {
      console.log('error', surpriseQueryErr);
    } else {
      const max = surpriseQueryResult.rows.length;
      console.log(surpriseQueryResult.rows);
      // eslint-disable-next-line prefer-const
      let index = Math.floor(Math.random() * max);
      console.log(index);
      const surprise = [surpriseQueryResult.rows[index]];
      console.log('surprise:', surprise);
      const estb = surprise[0];
      console.log('estb:', estb);
      pool.query(`SELECT * FROM comments INNER JOIN USERS ON users.id = comments.user_id WHERE establishment_id = ${estb.id}`, (error, commentResult) => {
        const content = {
          estb, comments: commentResult.rows,
        };
        response.render('establishment', content);
      });
    }
  });
};

const addComment = (request, response) => {
  const { userId } = request.cookies;
  const estId = request.params.id;
  const { comment } = request.body;
  console.log('addcomment:', comment);
  // write sql
  const addCommentQuery = `INSERT INTO comments (comment, establishment_id, user_id) VALUES ('${comment}', '${estId}', '${userId}')`;
  pool.query(addCommentQuery, (addCommentQueryError, addCommentQueryResult) => {
    if (addCommentQueryError) {
      console.log('add comment error', addCommentQueryError);
    } else {
      response.redirect(`/listing/${estId}`);
    }
  });
};

bindRoutes(app, pool);
// app.get('/', renderWelcomePage);
// app.get('/listing', renderEstIndex);
app.get('/register', renderRegistration);
app.post('/register', registerUser);
app.get('/login', renderLogin);
app.post('/login', loginAccount);
app.get('/logout', logout);
// app.get('/listing/:id', renderEstablishment);
// app.delete('/listing/:id', auth.restrictToLoggedIn(pool), deleteEst);
app.get('/add', auth.restrictToLoggedIn(pool), renderAddEst);
app.post('/add', addEst);
// app.get('/listing/:id/edit', auth.restrictToLoggedIn(pool), renderEditPage);
// app.put('/listing/:id', editPage);
app.get('/surprise', auth.restrictToLoggedIn(pool), renderSurprise);
app.post('/surprise', getSurprise);
app.post('/listing/:id', addComment);
app.listen(PORT);
