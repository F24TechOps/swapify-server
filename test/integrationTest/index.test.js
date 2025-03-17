import app from "../../index";
import supertest from "supertest";
const request = supertest(app);

describe.skip("get /api/:type/template", () => {
  it("should return a 200 status for valid type 'email'", async () => {
    const res = await request.get("/api/email/template");
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it("should return a 200 status for valid type 'microsite'", async () => {
    const res = await request.get("/api/microsite/template");
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it("should return a 200 status templates for '/api/templates/template'", async () => {
    const res = await request.get("/api/templates/template")
    expect(res.status).toBe(200);
    expect(res.text).toContain('We hope you enjoyed browsing our website?')
  });

  it("should return a 200 status for '/api/templates/template?name=event'", async () => {
    const res = await request.get("/api/templates/template?name=event");
    expect(res.status).toBe(200);
    expect(res.text).toContain('Start your email outlining your event title, location and date.')
  });

  it("should return a 404 status for an invalid type", async () => {
    const res = await request.get("/api/invalid/template");
    expect(res.status).toBe(404);
    expect(res.text).toBe("invalid isn't an accepted template type");
  });

  it("should return a 404 status for an invalid template", async () => {
    const res = await request.get("/api/templates/template?name=notatemplate");
    expect(res.status).toBe(400);
    expect(res.text).toBe("notatemplate isn't an accepted template type");
  });
});
