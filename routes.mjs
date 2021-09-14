import initListingController from './controllers/listing.mjs';
import initWelcomeController from './controllers/welcome.mjs';

export default function bindRoutes(app, pool) {
  // initialize the controller functions here
  // pass in the db for all callbacks
  // define your route matchers here using app
  // const controller = initController(db, pool);
  // app.get('/banana', controller.index);
  const welcomeController = initWelcomeController();
  const listingController = initListingController(pool);

  console.log('controller:', initWelcomeController);
  app.get('/', welcomeController.index);
  app.get('/listing', listingController.index);
  app.get('/listing/:id', listingController.show);
}
