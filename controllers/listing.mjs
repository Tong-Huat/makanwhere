import areas from '../areas.mjs';

const initListingController = (pool) => {
  const index = (request, response) => {
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

  const show = (request, response) => {
    console.log('est request came in');
    const { id } = request.params;
    // get est data
    pool.query(`SELECT * FROM establishments WHERE id = ${id}`, (estError, estbResult) => {
      const estb = estbResult.rows[0];
      // get all comments
      pool.query(`SELECT * FROM comments INNER JOIN USERS ON users.id = comments.user_id WHERE establishment_id = ${id}`, (commentError, commentResult) => {
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

  return { index, show };
};

export default initListingController;
