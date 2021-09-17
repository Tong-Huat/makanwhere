import jsSHA from 'jssha';

const SALT = 'i like cocomelon';

const initAccountController = (pool) => {
  const createAcctForm = (request, response) => {
    if (request.isUserLoggedIn === true) {
      response.redirect('/listing');
      return;
    }
    console.log('registration request came in');
    response.render('register');
  };

  const createAcct = (request, response) => {
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

  const createLogin = (request, response) => {
    if (request.isUserLoggedIn === true) {
      response.redirect('/listing');
      return;
    }
    console.log('login request came in');
    response.render('login');
  };

  const login = (request, response) => {
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

  const logout = (request, response) => {
  // Remove cookies from response header to log out
    response.clearCookie('loggedIn');
    response.clearCookie('userId');
    response.clearCookie('loggedInHash');
    response.redirect('/');
  };
  return {
    createAcctForm, createAcct, createLogin, login, logout,
  };
};

export default initAccountController;
