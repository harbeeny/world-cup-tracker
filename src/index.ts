import express, {
    Express,
    Request,
    Response,
} from "express";
import { request } from "http";
import { Pool } from "pg";

// Create Score Results of a Match API endpoints 
// Write unit tests for these endpoints (jest & supertest) 

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
});

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
                    id: 'USA',
                    name: 'United States',
                },
                players: [
                    {
                        id: '1',
                        name: 'Hunter Arbeeny',
                        number: 11,
                        position: 'st, cf',
                    },
                    {
                        id: '2',
                        name: 'Chrisitan Pulisic',
                        number: 10,
                        position: 'lw, st',
                    },
                ],
            },
            {
                country: {
                    id: 'ITA',
                    name: 'Italy',
                },
                players: [
                    {
                        id: '1',
                        name: 'Giovanni Bonducci',
                        number: 31,
                        position: 'cb',
                    },
                    {
                        id: '2',
                        name: 'John Lotito',
                        number: 24,
                        position: 'cm',
                    },
                ],
            },
        ],
        winner: 'USA',
    },
    2022: {
        countries: [
            {
                country: {
                    id: 'USA',
                    name: 'United States',
                },
                players: [
                    {
                        id: '1',
                        name: 'Hunter Arbeeny',
                        number: 11,
                        position: 'st, cf',
                    },
                    {
                        id: '2',
                        name: 'Chrisitan Pulisic',
                        number: 10,
                        position: 'lw, st',
                    },
                ],
            },
            {
                country: {
                    id: 'ITA',
                    name: 'Italy',
                },
                players: [
                    {
                        id: '1',
                        name: 'Giovanni Bonducci',
                        number: 31,
                        position: 'cb',
                    },
                    {
                        id: '2',
                        name: 'John Lotito',
                        number: 24,
                        position: 'cm',
                    },
                ],
            },
        ],
        winner: 'ITA',
    },
};



const app: Express = express();
const port = 3000;
app.use(express.json());

app.get('/', (request: Request, response: Response) => {
    response.send(records);
});

app.get('/data', async (req: Request, res: Response) => {
    try {
        const { rows } = await pool.query('SELECT * FROM your_table');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/years', (request: Request, response: Response) => {
    const yearKeys = Object.keys(records).map(key => Number(key));
    response.send(yearKeys);
});

app.get('/years/:year/winner', (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    const yearRecord = records[year];
    
    if (!yearRecord || !yearRecord.winner) {
        return response.status(404).send("Winner not found for the specified year");
    }

    response.status(200).send({year: year, winner: yearRecord.winner });
})

app.post('/years/:year/winner', (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    const { winner } = request.body;

    if (!winner) {
        return response.status(400).send("Winner information is required");
    }

    if (!records[year]) {
        records[year] = { countries: [], winner: undefined};
    }

    records[year].winner = winner;

    return response.status(201).send({ year: year, winner: records[year].winner });
})

app.get('/years/:year/countries', (request: Request, response: Response) => {
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

app.post('/years/:year/countries', (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    const { id, name } = request.body;

    if (!id || !name) {
        return response.status(400).send('Please provide all required fields!');
    }

    if (!records[year]) {
        records[year] = { countries: [], winner: undefined };
    }

    const newCountry: Country = {
        id,
        name
    };
    const newRecord = {country: newCountry, players: []}
    records[year].countries.push(newRecord);

    // Ensure you're returning the newRecord or structure similar to what the test expects
    return response.status(201).send(newRecord);


    // const record = records[year]
    // if (record) {
    //     record.push({ country, players: [] });
    // } else {
    //     records[year] = [{ country, players: [] }];
    // }
    // response.send(record);
});

app.get('/years/:year/countries/:countriesId/players', (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryId = req.params.countriesId;
    const record = records[year];
    if (!record) {
        return res.status(404).send('Year Record not found');
    }
    const countryRecord = record.countries.find((record) => record.country.id === countryId);
    if (!countryRecord) {
        return res.status(404).send('Country not found');
    }
    res.send(countryRecord.players);
})

app.post('/years/:year/countries/:countryId/players', (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryId = req.params.countryId;
    const record = records[year];
    if (!record) {
        return res.status(404).send('Record not found');
    }
    
    const countryRecord = record.countries.find((record) => record.country.id === countryId);
    if (!countryRecord) {
        return res.status(404).send('Country not found');
    }
    
    const { id, name, number, position } = req.body;
    if (!id || !name || !number || !position) {
        return res.status(400).send('Please provide all required player fields!');
    }

    const player: Player = {
        id,
        name,
        number,
        position
    };
    countryRecord.players.push(player);
    res.status(201).send(countryRecord.players);
});

app.listen(port, () => {
    console.log("Server is running at http://localhost:3000/");
});

export default app;
