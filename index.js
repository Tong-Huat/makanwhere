/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import express, { request, response } from 'express';
import methodOverride from 'method-override';
// eslint-disable-next-line import/no-unresolved
import pg from 'pg';
import jsSHA from 'jssha';
import cookieParser from 'cookie-parser';
// import aws from 'aws-sdk';
// import multerS3 from 'multer-s3';

const PORT = process.env.PORT || 3004;

// const s3 = new aws.S3({
//   accessKeyId: process.env.ACCESSKEYID,
//   secretAccessKey: process.env.SECRETACCESSKEY,
// });

const app = express();
const SALT = 'i like cocomelon';

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());

// const multerUpload = multer({
//   storage: multerS3({
//     s3,
//     bucket: 'makanwhere',
//     acl: 'public-read',
//     metadata: (request, file, callback) => {
//       callback(null, { fieldName: file.fieldname });
//     },
//     key: (request, file, callback) => {
//       callback(null, Date.now().toString());
//     },
//   }),
// });

const areas = [('Raffles Place, Cecil, Marina'),
  ('Anson, Tanjong Pagar'),
  ('Queenstown, Tiong Bahru, Telok Blangah, Harbourfront'),
  ('Pasir Panjang, Hong Leong Garden, Clementi New Town'),
  ('High Street, Beach Road, Middle Road, Golden Mile'),
  ('Little India'),
  ('Orchard, Cairnhill, River Valley'),
  ('Ardmore, Bukit Timah, Holland Road, Tanglin'),
  ('Watten Estate, Novena, Thomson'),
  ('Balestier, Toa Payoh, Serangoon, Macpherson, Braddell'),
  ('Geylang, Eunos, Katong, Joo Chiat, Amber Road'),
  ('Bedok, Upper East Coast, Eastwood, Kew Drive'),
  ('Loyang, Changi, Tampines, Pasir Ris'),
  ('Serangoon Garden, Hougang, Punggol'),
  ('Bishan, Ang Mo Kio'),
  ('Jurong'),
  ('Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang'),
  ('Kranji, Woodgrove'),
  ('Upper Thomson, Springleaf, Yishun, Sembawang'),
  ('Seletar')];

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
  pool.query('SELECT * from Establishments', (error, result) => {
    const data = result.rows;
    const dataObj = { data };
    console.log(data[0]);
    const areaData = { areas };
    console.log(areaData.areas[1]);
    pool.query('SELECT * FROM cuisines', (cuisineError, cuisineResult) => {
      const cuisineData = { cuisines: cuisineResult.rows };
      // console.log(cuisineData);
      response.render('index', { dataObj, areaData, cuisineData });
    });
  });
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

const renderEstablishment = (request, response) => {
  console.log('est request came in');
  const { id } = request.params;
  // get est data
  pool.query(`SELECT * FROM establishments WHERE id = ${id}`, (error, estbResult) => {
    const estb = estbResult.rows[0];
    // get all comments
    pool.query(`SELECT * FROM comments INNER JOIN USERS ON users.id = comments.user_id WHERE establishment_id = ${id}`, (error, commentResult) => {
      // const comments = commentResult.rows.map((commentsObj) => commentsObj.comment);

      // const resultObj = commentResult.rows;
      const content = {
        estb, comments: commentResult.rows,
      };
      console.log('result:', commentResult.rows);
      response.render('establishment', content);
    });
  });
};

// CB to del note
const deleteEst = (request, response) => {
  // Remove element from DB at given index
  const { id } = request.params;
  console.log('id:', id);
  const getNoteDataQuery = `SELECT * FROM establishments WHERE id = ${id}`;
  pool.query(getNoteDataQuery, (getNoteDataQueryErr, getNoteDataQueryResult) => {
    if (getNoteDataQueryErr) {
      console.log('error', getNoteDataQueryErr);
    } else {
      const noteData = getNoteDataQueryResult.rows[0];
      console.log('note Data: ', noteData);

      const deleteNoteQuery = `DELETE FROM establishments WHERE id = ${id}`;
      pool.query(deleteNoteQuery, (deleteNoteError, deleteNoteResult) => {
        if (deleteNoteError) {
          console.log('error', deleteNoteError);
        } else
        {
          response.redirect('/listing');
        }
      });
    }
  });
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

const renderEditPage = (request, response) => {
  console.log('edit request came in');
  const { id } = request.params;
  pool.query(`SELECT * FROM establishments WHERE id = ${id}`, (error, estbResult) => {
    const estb = estbResult.rows[0];
    // get all comments
    pool.query(`SELECT * FROM comments INNER JOIN USERS ON users.id = comments.user_id WHERE establishment_id = ${id}`, (error, commentResult) => {
      pool.query('SELECT * FROM cuisines', (cuisineError, cuisineResult) => {
        const cuisineData = { cuisines: cuisineResult.rows };
        const areaData = { areas };
        const content = {
          estb, cuisineData, areaData, comments: commentResult.rows,
        };
        response.render('editEst', content);
      });
    });
  });
};

const editPage = (request, response) => {
  const { id } = request.params;
  console.log(id);
  const data = request.body;
  console.log(data);
  const editQuery = `UPDATE establishments SET name = '${data.name}',  address = '${data.address}', area = '${data.area}', contact = '${data.contact}', cuisine = '${data.cuisines}' WHERE id = ${id} RETURNING *`;

  pool.query(editQuery, (editQueryError, editQueryResult) => {
    if (editQueryError) {
      console.log('error1', editQueryError);
    } else {
      console.log(editQueryResult.rows);
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

app.get('/', renderWelcomePage);
app.get('/listing', renderEstIndex);
app.get('/register', renderRegistration);
app.post('/register', registerUser);
app.get('/login', renderLogin);
app.post('/login', loginAccount);
app.get('/logout', logout);
app.get('/listing/:id', renderEstablishment);
app.delete('/listing/:id', restrictToLoggedIn, deleteEst);
app.get('/add', restrictToLoggedIn, renderAddEst);
app.post('/add', addEst);
app.get('/listing/:id/edit', restrictToLoggedIn, renderEditPage);
app.put('/listing/:id/edit', editPage);
app.get('/surprise', restrictToLoggedIn, renderSurprise);
app.post('/surprise', getSurprise);
app.post('/listing/:id', addComment);
// app.get('/listing/:id/reservation', restrictToLoggedIn, renderReservationForm);
// app.post reservation to be completed
app.listen(PORT);
