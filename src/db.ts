import { Pool } from "pg";

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

async function fetchCountries() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM countries');
        console.log(res.rows);
    } finally {
        client.release();
    }
}

fetchCountries().catch((err) => console.log(err.stack));