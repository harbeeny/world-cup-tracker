import express, {
    Express,
    Request,
    Response,
} from "express";

// Create Score Results of a Match API endpoints 
// Write unit tests for these endpoints (jest & supertest) 

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

interface Records {
    [key: number]: Record[];
}

const records: Records = {};
records[2020] = [
    {
        country: {
            id: '1',
            name: 'India'
        },
        players: [
            {
                id: '1',
                name: 'Virat Kohli',
                number: 18,
                position: 'Batsman'
            },
            {
                id: '2',
                name: 'Rohit Sharma',
                number: 45,
                position: 'Batsman'
            }
        ]
    },
    {
        country: {
            id: '2',
            name: 'Australia'
        },
        players: [
            {
                id: '1',
                name: 'David Warner',
                number: 31,
                position: 'Batsman'
            },
            {
                id: '2',
                name: 'Steve Smith',
                number: 49,
                position: 'Batsman'
            }
        ]
    }
];
records[2021] = [
    {
        country: {
            id: '1',
            name: 'India'
        },
        players: [
            {
                id: '1',
                name: 'Virat Kohli',
                number: 18,
                position: 'Batsman'
            },
            {
                id: '2',
                name: 'Rohit Sharma',
                number: 45,
                position: 'Batsman'
            }
        ]
    },
    {
        country: {
            id: '2',
            name: 'Australia'
        },
        players: [
            {
                id: '1',
                name: 'David Warner',
                number: 31,
                position: 'Batsman'
            },
            {
                id: '2',
                name: 'Steve Smith',
                number: 49,
                position: 'Batsman'
            }
        ]
    }
];

const app: Express = express();
app.use(express.json());

app.get('/', (request: Request, response: Response) => {
    response.send(records);
});

app.get('/years', (request: Request, response: Response) => {
    response.send(Object.keys(records));
});

app.get('/years/:year/countries', (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    const data = records[year] ?? [];
    response.send(data.map((record) => record.country));
});

app.post('/years/:year/countries', (request: Request, response: Response) => {
    const year = parseInt(request.params.year);
    const { id, name } = request.body;
    if (!id || !name) {
        return response.status(400).send('Please provide all required fields!');
    }

    const country: Country = {
        id,
        name
    };

    const record = records[year]
    if (record) {
        record.push({ country, players: [] });
    } else {
        records[year] = [{ country, players: [] }];
    }
    response.send(record);
});

app.get('/years/:year/countries/:countriesId/players', (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryId = req.params.countriesId;
    const record = records[year];
    if (!record) {
        return res.status(404).send('Record not found');
    }
    const countryRecord = record.find((record) => record.country.id === countryId);
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
    
    const countryRecord = record.find((record) => record.country.id === countryId);
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
    res.send(countryRecord.players);
})

app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000/");
});

export default app;
