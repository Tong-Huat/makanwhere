/* eslint-disable max-len */
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

  const comment = (request, response) => {
    const { userId } = request.cookies;
    const estId = request.params.id;
    const { comment } = request.body;
    console.log('addcomment:', comment);
    // write sql
    const addCommentQuery = `INSERT INTO comments (comment, establishment_id, user_id) VALUES ('${comment}', '${estId}', '${userId}')`;
    pool.query(addCommentQuery, (addCommentQueryError, addCommentQueryResult) => {
      if (addCommentQueryError) {
        console.log('add comment error', addCommentQueryError);
      } else {
        response.redirect(`/listing/${estId}`);
      }
    });
  };

  const createForm = (request, response) => {
    pool.query('SELECT * from Establishments', (error, result) => {
      const data = result.rows;
      const dataObj = { data };
      const areaData = { areas };
      pool.query('SELECT * FROM cuisines', (cuisineError, cuisineResult) => {
        const cuisineData = { cuisines: cuisineResult.rows };
        response.render('addEsta', { dataObj, areaData, cuisineData });
      });
    });
  };

  const create = (request, response) => {
    const { userId } = request.cookies;
    console.log(`userId:${userId}`);
    const {
      name, address, area, contact, email,
    } = request.body;

    let { cuisines } = request.body;
    console.log(request.body);
    const addQuery = `INSERT INTO establishments (name, address, area, cuisine, contact, email, user_id) VALUES ('${name}','${address}','${area}', '${cuisines}', '${contact}','${email}','${userId}') returning id`;
    console.log(addQuery);

    pool.query(addQuery, (addError, addResult) => {
      if (addError) {
        console.log('adderror', addError);
      } else {
        const estId = addResult.rows[0].id;
        if (!Array.isArray(cuisines)) {
          cuisines = [cuisines];
        }
        cuisines.forEach((cuisine) => {
          const cuisineIdQuery = `SELECT id FROM cuisines WHERE cuisine = '${cuisine}'`;

          pool.query(cuisineIdQuery, (cuisineIdQueryError, cuisineIdQueryResult) => {
            if (cuisineIdQueryError) {
              console.log('error:', cuisineIdQueryError);
            } else {
              const cuisineId = cuisineIdQueryResult.rows[0].id;
              console.log('cuisineid:', cuisineId);
              const cuisineData = [estId, cuisineId];

              const estCuisinesEntry = 'INSERT INTO establishments_cuisines (establishment_id, cuisine_id) VALUES ($1, $2)';

              pool.query(estCuisinesEntry, cuisineData, (estCuisinesEntryError, estCuisinesEntryResult) => {
                if (estCuisinesEntryError) {
                  console.log('error', estCuisinesEntryError);
                } else {
                  console.log('done');
                }
              });
            }
          });
        });
        response.redirect('/listing');
      }
    });
  };

  return {
    index, show, destroy, edit, update, comment, createForm, create,
  };
};

export default initListingController;
