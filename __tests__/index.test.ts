import request from "supertest";

import app from "../src";

describe("Test", () => {
    it("should pass", () => {
        expect(true).toBe(true);
    });
});

describe("GET /", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
    });

})

describe("GET /years", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/years");
        expect(res.status).toBe(200);
    });

    it("should return an array of years", async () => {
        const res = await request(app).get("/years");
        expect(res.body).toEqual([2020, 2021]);
    });

});

describe("GET /years/:year/countries", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/years/2020/countries");
        expect(res.status).toBe(200);
    });

    it("should return an array of objects of countries from 2020", async () => {
        const res = await request(app).get("/years/2020/countries");
        expect(res.body).toEqual(
            [
                {
                  "id": "USA",
                  "name": "United States"
                },
                {
                  "id": "ITA",
                  "name": "Italy"
                }
            ]);
    });

    it("should return an array of objects of countries from 2021", async () => {
        const res = await request(app).get("/years/2021/countries");
        expect(res.body).toEqual(
            [
                {
                  "id": "USA",
                  "name": "United States"
                },
                {
                  "id": "ITA",
                  "name": "Italy"
                }
            ]
        );
    });

});

describe("POST /years/:year/countries", () => {
    it("should successfully create a new country record for the given year with port 200", async () => {
        const newCountry = { id: "FRA", name: "France" };
        const res = await request(app).post("/years/2022/countries").send(newCountry);
        expect(res.status).toBe(200);
        expect (res.body).toEqual({
                country: expect.objectContaining(newCountry),
                players: [],
        });

    });

    it("should return 400 Bad Request when missing required fields", async () => {
        const incompleteData = { id: "FRA"};
        const res = await request(app).post("/years/2022/countries").send(incompleteData);
        expect(res.status).toBe(400);
    });


});

describe("GET /years/:year/countries/:countries/players", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/years/2020/countries/ITA/players");
        expect(res.status).toBe(200);
    });

    it("should return an array of objects of players from Italy in 2020", async () => {
        const res = await request(app).get("/years/2020/countries/ITA/players");
        expect(res.body).toEqual(
            [
                {
                  "id": "1",
                  "name": "Giovanni Bonducci",
                  "number": 31,
                  "position": "cb"
                },
                {
                  "id": "2",
                  "name": "John Lotito",
                  "number": 24,
                  "position": "cm"
                }
            ]
        );
    });

    it("should return an array of objects of players from America in 2021", async () => {
        const res = await request(app).get("/years/2021/countries/USA/players");
        expect(res.body).toEqual(
            [
                {
                  "id": "1",
                  "name": "Hunter Arbeeny",
                  "number": 11,
                  "position": "st, cf"
                },
                {
                  "id": "2",
                  "name": "Chrisitan Pulisic",
                  "number": 10,
                  "position": "lw, st"
                }
            ]
        );
    });

});

describe("POST /years/:year/countries/:countryid/players", () => {
    it("should successfully create a new player record for the given country in that year with port 200", async () => {
        const newPlayer = { id: "3", name: "Gianluigi Buffon", position:"gk", number: 1 };
        const res = await request(app).post("/years/2021/countries/ITA/players").send(newPlayer);
        expect(res.status).toBe(200);
        expect (res.body).toEqual(expect.arrayContaining([expect.objectContaining(newPlayer)]));
    });

    it("should return 400 Bad Request when missing required fields", async () => {
        const incompleteData = { id: "3", position:"gk"};
        const res = await request(app).post("/years/2022/countries").send(incompleteData);
        expect(res.status).toBe(400);
    });


});

