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

    it("should return 'Hello World!'", async () => {
        const res = await request(app).get("/");
        expect(res.text).toBe("Hello World!");
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

