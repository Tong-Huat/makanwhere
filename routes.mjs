import initListingController from './controllers/listing.mjs';
import initWelcomeController from './controllers/welcome.mjs';
import initAccountController from './controllers/account.mjs';
import initSurpriseController from './controllers/surprise.mjs';
import * as auth from './auth.mjs';

export default function bindRoutes(app, pool) {
  const welcomeController = initWelcomeController();
  const listingController = initListingController(pool);
  const accountController = initAccountController(pool);
  const surpriseController = initSurpriseController(pool);

  console.log('controller:', initWelcomeController);
  app.get('/', welcomeController.index);
  app.get('/listing', listingController.index);
  app.get('/listing/:id', listingController.show);
  app.delete('/listing/:id', auth.restrictToLoggedIn(pool), listingController.destroy);
  app.get('/listing/:id/edit', auth.restrictToLoggedIn(pool), listingController.edit);
  app.put('/listing/:id', auth.restrictToLoggedIn(pool), listingController.update);
  app.post('/listing/:id', auth.restrictToLoggedIn(pool), listingController.comment);
  app.get('/add', auth.restrictToLoggedIn(pool), listingController.createForm);
  app.post('/add', auth.restrictToLoggedIn(pool), listingController.create);
  app.get('/surprise', auth.restrictToLoggedIn(pool), surpriseController.index);
  app.post('/surprise', surpriseController.show);
  app.get('/login', accountController.createLogin);
  app.post('/login', accountController.login);
  app.get('/logout', accountController.logout);
  app.get('/register', accountController.createAcctForm);
  app.post('/register', accountController.createAcct);
}
