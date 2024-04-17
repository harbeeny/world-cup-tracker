import express, { Express, NextFunction, Request, Response } from "express";

import client from "./db";

// Create Score Results of a Match API endpoints
// Write unit tests for these endpoints (jest & supertest) ;

interface Country {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface Record {
  country: Country;
  players: Player[];
}

interface YearRecord {
  countries: Record[];
  winner?: string;
}

interface Records {
  [key: number]: YearRecord;
}

const records: Records = {
  2018: {
    countries: [
      {
        country: {
          id: "USA",
          name: "United States",
        },
        players: [
          {
            id: "1",
            name: "Hunter Arbeeny",
            number: 11,
            position: "st, cf",
          },
          {
            id: "2",
            name: "Chrisitan Pulisic",
            number: 10,
            position: "lw, st",
          },
        ],
      },
      {
        country: {
          id: "ITA",
          name: "Italy",
        },
        players: [
          {
            id: "1",
            name: "Giovanni Bonducci",
            number: 31,
            position: "cb",
          },
          {
            id: "2",
            name: "John Lotito",
            number: 24,
            position: "cm",
          },
        ],
      },
    ],
    winner: "USA",
  },
  2022: {
    countries: [
      {
        country: {
          id: "USA",
          name: "United States",
        },
        players: [
          {
            id: "1",
            name: "Hunter Arbeeny",
            number: 11,
            position: "st, cf",
          },
          {
            id: "2",
            name: "Chrisitan Pulisic",
            number: 10,
            position: "lw, st",
          },
        ],
      },
      {
        country: {
          id: "ITA",
          name: "Italy",
        },
        players: [
          {
            id: "1",
            name: "Giovanni Bonducci",
            number: 31,
            position: "cb",
          },
          {
            id: "2",
            name: "John Lotito",
            number: 24,
            position: "cm",
          },
        ],
      },
    ],
    winner: "ITA",
  },
};

const app: Express = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request: Request, response: Response) => {
  response.send(records);
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

app.get(
  "/years",
  async (request: Request, response: Response) => {
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
      console.error('Error executing query', err.message);
      response.status(500).send('Error fetching years');
    }
  }
);

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

app.get("/years/:year/countries", (request: Request, response: Response) => {
  const year = parseInt(request.params.year);
  const data = records[year] ?? [];
  if (!data) {
    return response.status(404).send("Year record not found.");
  }
  const countries = data.countries.map(({ country }) => ({
    id: country.id,
    name: country.name,
  }));
  response.send(countries);
});

app.post("/years/:year/countries", (request: Request, response: Response) => {
  const year = parseInt(request.params.year);
  const { id, name } = request.body;

  if (!id || !name) {
    return response.status(400).send("Please provide all required fields!");
  }

  if (!records[year]) {
    records[year] = { countries: [], winner: undefined };
  }

  const newCountry: Country = {
    id,
    name,
  };
  const newRecord = { country: newCountry, players: [] };
  records[year].countries.push(newRecord);

  // Ensure you're returning the newRecord or structure similar to what the test expects
  return response.status(201).send(newRecord);
});

app.get(
  "/years/:year/countries/:countriesId/players",
  (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryId = req.params.countriesId;
    const record = records[year];
    if (!record) {
      return res.status(404).send("Year Record not found");
    }
    const countryRecord = record.countries.find(
      (record) => record.country.id === countryId
    );
    if (!countryRecord) {
      return res.status(404).send("Country not found");
    }
    res.send(countryRecord.players);
  }
);

app.post(
  "/years/:year/countries/:countryId/players",
  (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryId = req.params.countryId;
    const record = records[year];
    if (!record) {
      return res.status(404).send("Record not found");
    }

    const countryRecord = record.countries.find(
      (record) => record.country.id === countryId
    );
    if (!countryRecord) {
      return res.status(404).send("Country not found");
    }

    const { id, name, number, position } = req.body;
    if (!id || !name || !number || !position) {
      return res.status(400).send("Please provide all required player fields!");
    }

    const player: Player = {
      id,
      name,
      number,
      position,
    };
    countryRecord.players.push(player);
    res.status(201).send(countryRecord.players);
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
