import initListingController from './controllers/listing.mjs';
import initWelcomeController from './controllers/welcome.mjs';
// import * as auth from './auth.mjs';

export default function bindRoutes(app, pool) {
  const welcomeController = initWelcomeController();
  const listingController = initListingController(pool);

  console.log('controller:', initWelcomeController);
  app.get('/', welcomeController.index);
  app.get('/listing', listingController.index);
  app.get('/listing/:id', listingController.show);
  app.delete('/listing/:id', listingController.destroy);
  app.get('/listing/:id/edit', listingController.edit);
  // app.put('/listing/:id/edit', listingController.update);
}
