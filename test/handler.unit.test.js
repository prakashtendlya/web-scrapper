const handler = require("../app/handler");


test('success is an object', () =>{
    expect(typeof handler.success).toBe('function');
});


test('success response', () =>{
    const body = "success"

    const res = handler.success(body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe("\"success\"");
});


test('bad response', () =>{
    const body = "BAD RESPONSE"
    const res = handler.failure(400,body);

    expect(res.statusCode).toBe(400);
    let data = JSON.parse(res.body)
    expect(data.message).toBe("BAD RESPONSE");
});

