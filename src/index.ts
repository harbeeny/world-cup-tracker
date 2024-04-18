import express, { Express, NextFunction, Request, Response } from "express";

import client from "./db";

const app: Express = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (request, response) => {
  try {
    const summaryQuery = 
            `SELECT 
                y.year AS year,
                COUNT(DISTINCT r.country_id) AS countries_participated,
                BOOL_OR(r.winner) AS has_winner
            FROM records r
            JOIN years y ON y.id = r.year_id
            GROUP BY y.year;`;
    const { rows } = await client.query(summaryQuery);
    if (rows.length === 0) {
      return response.status(404).send("No records found.");
    }
    response.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching records summary:", error);
    response.status(500).send("Failed to retrieve data");
  }
});

// app.get("/data", async (req: Request, res: Response) => {
//   try {
//     const { rows } = await query("SELECT * FROM your_table");
//     res.status(200).json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });

app.get("/years", async (request: Request, response: Response) => {
  try {
    const result = await client.query(
      "SELECT year FROM years ORDER BY year ASC"
    );
    const yearKeys = result.rows.map((row) => {
      return row.year;
    });
    response.status(200).send(yearKeys);
  } catch (error) {
    const err = error as Error;
    console.error("Error executing query", err.message);
    response.status(500).send("Error fetching years");
  }
});

app.get("/years/:year/winner", async (request: Request, response: Response) => {
  const year = parseInt(request.params.year);
  if (isNaN(year)) {
    return response.status(400).send("Invalid year provided");
  }

  try {
    const result = await client.query(
      `SELECT r.year_id, c.name AS country_name 
       FROM records r
       JOIN countries c ON r.country_id = c.id
       WHERE r.year_id = $1 AND r.winner = TRUE`,
      [year]
    );

    if (result.rows.length === 0) {
      return response
        .status(404)
        .send("Winner not found for the specified year");
    }

    const { year_id, country_name } = result.rows[0];
    response.status(200).send({ year: year_id, winner: country_name });
  } catch (error) {
    const err = error as Error;
    console.error("Error executing query", err.message);
    response.status(500).send("Error fetching winner for the specified year");
  }
});

//   const yearRecord = records[year];

//   if (!yearRecord || !yearRecord.winner) {
//     return response.status(404).send("Winner not found for the specified year");
//   }

//   response.status(200).send({ year: year, winner: yearRecord.winner });
// });

app.post(
  "/years/:year/winner",
  async (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    const { winner } = request.body;

    if (!winner) {
      return response.status(400).send("Winner information is required");
    }

    if (isNaN(year)) {
      return response.status(400).send("Invalid year provided");
    }

    try {
      const checkResult = await client.query(
        `SELECT * FROM records WHERE year_id = $1`,
        [year]
      );

      if (checkResult.rows.length > 0) {
        await client.query(
          `UPDATE records SET winner = TRUE, country_id = $2 WHERE year_id = $1`,
          [year, winner]
        );
      } else {
        await client.query(
          `INSERT INTO records (year_id, country_id, winner)
           VALUES ($1, $2, TRUE)`,
          [year, winner]
        );
      }

      response.status(201).send({ year: year, winner: winner });
    } catch (error) {
      const err = error as Error;
      console.error("Error executing query", err.message);
      response.status(500).send("Error processing winner information");
    }
  }
);

// #TODO: Finish SQL query for end points, Test the data
// #TODO: Start the React Frontend
// #TODO: write unit tests for endpoints

app.get(
  "/years/:year/countries",
  async (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    if (isNaN(year)) {
      return response.status(400).send("Invalid year format.");
    }

    try {
      const result = await client.query(
        `SELECT c.id, c.name FROM countries c
         JOIN records r ON r.country_id = c.id WHERE r.year_id = $1`,
        [year]
      );

      if (result.rows.length === 0) {
        return response.status(404).send("Year record not found.");
      }

      response.send(result.rows);
    } catch (error) {
      console.error(error);
      response.status(500).send("An error occured while retrieving data.");
    }
    //   const data = records[year] ?? [];
    //   if (!data) {
    //     return response.status(404).send("Year record not found.");
    //   }
    //   const countries = data.countries.map(({ country }) => ({
    //     id: country.id,
    //     name: country.name,
    //   }));
    //   response.send(countries);
  }
);

app.post(
  "/years/:year/countries",
  async (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    const { id, name } = request.body;

    if (!id || !name) {
      return response.status(400).send("Please provide all required fields!");
    }

    try {
      await client.query(`BEGIN`);

      const countryQuery = `
        INSERT INTO countries (id, name)
        VALUES ($1, $2)
        ON CONFLICT (id) DO NOTHING;
    `;
      await client.query(countryQuery, [id, name]);

      const recordCheck = await client.query(
        `SELECT 1 FROM records WHERE year_id = $1 AND country_id = $2`,
        [year, id]
      );

      if (recordCheck.rows.length === 0) {
        const insertRecord = `INSERT INTO records (year_id, country_id)
         VALUES ($1, $2)`;
        await client.query(insertRecord, [year, id]);
      }

      await client.query(`COMMIT`);

      const newRecord = { country: { id, name }, players: [] };
      response.status(201).send(newRecord);
    } catch (error) {
      await client.query(`ROLLBACK`);
      console.error(error);
      response.status(500).send("Failed to insert new country record.");
    }
  }
);

app.get(
  "/years/:year/countries/:countriesId/players",
  async (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryId = req.params.countriesId;

    try {
      const queryText = `
              SELECT p.id, p.name, p.number, p.position FROM players p
              WHERE p.year_id = $1 AND p.country_id = $2;
          `;
      const params = [year, countryId];
      const result = await client.query(queryText, params);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .send("No players found for the given year and country");
      }

      res.send(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to retrieve data");
    }
  }
);

app.post(
  "/years/:year/countries/:countryId/players",
  async (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryId = req.params.countryId;
    const { id, name, number, position } = req.body;

    if (!id || !name || !number || !position) {
      return res.status(400).send("Please provide all required player fields!");
    }

    try {
      const yearCountryExist = `SELECT 1 FROM records WHERE year_id = $1 AND country_id = $2;`;
      const check = await client.query(yearCountryExist, [year, countryId]);
      if (check.rows.length === 0) {
        return res
          .status(404)
          .send("Record not found for the given year and country");
      }

      const insertPlayer = `INSERT INTO players (id, name, number, position, country_id, year_id)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
      const player = await client.query(insertPlayer, [
        id,
        name,
        number,
        position,
        countryId,
        year,
      ]);

      return res.status(201).send(player.rows[0]);
    } catch (error) {
      console.error("Failed to insert player:", error);
      res.status(500).send("Failed to insert player data");
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
