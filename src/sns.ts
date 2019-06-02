import express from "express";
import bodyParser from 'body-parser'

const app = express();
const port = 3000;

class Counter {
  count: { [K: string]: number } = {};

  constructor() {
    this.count = {};
  }

  increment(id: number) {
    const idString = String(id);

    this.count[idString] = this.get(id) || 0;
    this.count[idString] += 1;
    return this.count;
  }

  get(id: number | string) {
    try {
      return this.count[String(id)];
    } catch {
      return 0;
    }
  }

  set(id: number, jobs: number) {
    try {
      this.count[String(id)] = jobs;
    } catch {
      return 0;
    }
  }
}

const display = (registry: Registry) => {
  console.log("\x1Bc");
  console.log("------------------");
  console.log("Service counts");
  console.log("------------------\n");
  console.log("ID | Queue Length | Time/Job (ms) ");
  console.log("------------------");
  for (const key in registry.counter.count) {
      const service = registry.getService(Number(key))
      const counter = registry.counter.get(key)
    console.log(
      `${key}  | ${counter} | ${service.avgTimeTaken}`
    );
  }
};

class Registry {
  services: Service[];
  counter: Counter;

  constructor() {
    this.services = [];
    this.counter = new Counter();
  }

  register(service: Service) {
    this.services.push(service);
  }

  maxId() {
    return this.services.length;
  }
  enqueue(service: Service) {
    display(this);
    this.counter.increment(service.id);
  }

  getJob(service: Service) {
    let jobs = this.counter.get(service.id);
    if (jobs >= 1) {
      jobs = jobs -= 1;
      this.counter.set(service.id, jobs);
    }

    return jobs;
  }
  getService(id: number) {
    return this.services.find((service: Service) => {
      return service.id === id;
    });
  }
}

class Service {
  id: number;
  registry: Registry;
  avgTimeTaken: number;

  constructor(registry: Registry) {
    this.id = registry.maxId() + 1;
    this.registry = registry;
    this.avgTimeTaken = Math.random() * 1000;

    registry.register(this);
    setInterval(() => {
      this.doWork();
    }, this.avgTimeTaken);
  }

  notify(body: any) {
    this.registry.enqueue(this);
  }

  doWork() {
    this.registry.getJob(this);
  }

  toJson() {
    return JSON.stringify({ id: this.id });
  }
}

const registry = new Registry();
new Service(registry);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.post("/notify", async (req, res) => {
  let service: Service;
  for (service of registry.services) {
    await service.notify(req.body);
  }
  return;
});

app.post("/register", bodyParser.json(), async (req, res) => {
  const newService = new Service(registry);
  return newService.toJson();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
