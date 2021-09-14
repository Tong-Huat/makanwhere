import getHash from './utility.mjs';

export const restrictToLoggedIn = (pool) => (request, response, next) => {
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

export const setUserLogIn = (request, response, next) => {
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
};
