import express, {
    Express,
    Request,
    Response,
} from "express";

// Declare a type countries 

const app: Express = express();

app.get('/', (request: Request, response: Response) => {
    response.send("Hello wrld");
});

app.get('/countries', (request: Request, response: Response) => {
    response.send("Brazilato");
});

app.listen(3000, () => {
    console.log("Server is running");
});
