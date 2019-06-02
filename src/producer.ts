import request from "request";

setInterval(async () => {
  await request.post({
    url: "http://localhost:3000/notify",
    method: "POST",
    json: true,
    body: {a: 2}
  });
}, 400);
