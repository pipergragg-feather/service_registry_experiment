import request from "request";


for(let i=0; i< 10; i++){
    request.post({
        url: "http://localhost:3000/register",
        method: "POST",
        json: true,
        body: {a: 5}
      })  
}


