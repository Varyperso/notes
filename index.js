const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("dist"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
morgan.token("req-body-json", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms - :req-body-json", { stream: accessLogStream })
);

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  person ? response.json(person) : response.status(404).end();
});

app.get("/info", (request, response) => {
  const formattedDateTime = new Date();
  response.send(`<p>phonebook has info for ${persons.length} people</p> ${formattedDateTime}`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  if (persons.findIndex((person) => person.id === id) != -1) {
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
  } else {
    response.status(204).json({ error: "entry not found" });
  }
});

const generateId = () => (persons.length > 0 ? Math.floor(Math.random() * 999999) : 0);

app.post("/api/persons", (request, response) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: Number(body.number),
    id: generateId(),
  };

  !body.name
    ? response.status(400).json({
        error: "name missing",
      })
    : !body.number
    ? response.status(400).json({
        error: "number missing",
      })
    : persons.some((person) => person.name === body.name)
    ? response.status(400).json({
        error: "person name must be unique",
      })
    : persons.push(person),
    response.status(201).json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
