const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT 
      movie_name
    FROM 
      movie`;
  const moviesArray = await db.all(getMovieQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
     movie (director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, "${movieName}", "${leadActor}") `;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getAMovieQuery = `
  SELECT 
    *
  FROM 
    movie
  WHERE 
    movie_id = ${movieId};`;
  const movie = await db.get(getAMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//API 4
app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const putMovieQuery = `
        UPDATE 
            movie 
        SET 
            director_id = ${directorId},
            movie_name = "${movieName}",
            lead_actor = "${leadActor}"
        WHERE
          movie_id = ${movieId}`;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
        movie 
    WHERE 
        movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
     *
    FROM 
        director 
    `;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirector = `
    SELECT 
        movie_name
    FROM
         movie
    WHERE 
        director_id = "${directorId}";`;
  const moviesArray = await db.all(getMoviesByDirector);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
