import { Client } from "pg";

const config = {
  user: "postgres",
  password: "WorldCup",
  host: "localhost",
  port: 5432,
};

const client = new Client(config);
client.connect();

export default client;
