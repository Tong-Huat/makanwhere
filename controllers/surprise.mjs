import areas from '../areas.mjs';

const initSurpriseController = (pool) => {
  const index = (request, response) => {
    const areaData = { areas };
    response.render('surprise', areaData);
  };

  const show = (request, response) => {
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
  return { index, show };
};

export default initSurpriseController;
