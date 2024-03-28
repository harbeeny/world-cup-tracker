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
            ]
        );
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

