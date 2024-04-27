require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny")); // present for logger
app.use(express.static("dist")); // use the dist folder to run the frontend

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
morgan.token("req-body-json", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms - :req-body-json", { stream: accessLogStream })
);

app.get("/api/persons", (request, response) => {
  Person.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  const formattedDateTime = new Date();
  Person.find({}).then((notes) => {
    response.json(`there are ${notes.length} persons in the list at ${formattedDateTime}`);
  });
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  const entry = new Person({
    name: body.name,
    number: body.number,
  });
  entry
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: "query" })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
