const mongoose = require("mongoose");

const password = process.argv[2];
const url = `mongodb+srv://varyperso1:${password}@cluster0.qw37bun.mongodb.net/?retryWrites=true&w=majority&appName=personsApp`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Note = mongoose.model("Person", noteSchema);

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

if (process.argv.length === 3) {
  Note.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
}

const name = process.argv[3];
const number = process.argv[4];

if (process.argv.length == 5) {
  const note = new Note({
    name: name,
    number: number,
  });

  note.save().then((result) => {
    console.log("note saved!");
    mongoose.connection.close();
  });
}
