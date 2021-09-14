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
        const content = {
          estb, comments: commentResult.rows,
        };
        console.log('result:', commentResult.rows);
        response.render('establishment', content);
      });
    });
  };

  const destroy = (request, response) => {
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

  const edit = (request, response) => {
    console.log('edit request came in');
    const { id } = request.params;
    pool.query(`SELECT * FROM establishments WHERE id = ${id}`, (estbError, estbResult) => {
      const estb = estbResult.rows[0];
      // get all comments
      pool.query(`SELECT * FROM comments INNER JOIN USERS ON users.id = comments.user_id WHERE establishment_id = ${id}`, (commentError, commentResult) => {
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

  const update = (request, response) => {
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
        response.redirect(`/listing/${id}`);
      }
    });
  };

  return {
    index, show, destroy, edit, update,
  };
};

export default initListingController;
