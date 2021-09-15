import getHash from '../utility.mjs';

const initAccountController = () => {
  const createAcctForm = (request, response) => {
    if (request.isUserLoggedIn === true) {
      response.redirect('/listing');
      return;
    }
    console.log('registration request came in');
    response.render('register');
  };

  const createAcct = (pool) => (request, response) => {
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

  return { createAcctForm, createAcct };
};

export default initAccountController;
