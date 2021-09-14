const initWelcomeController = () => {
  const index = (request, response) => {
    console.log('welcome request came in');
    response.render('welcome');
  };
  return { index };
};

export default initWelcomeController;
