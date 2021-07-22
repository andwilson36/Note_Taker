const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db/db.json');
const util = require('util');
const uuid = require('./helpers/uuid');
// PORT number
const PORT = process.env.PORT || 3001;
// express
const app = express();

// middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET for the notes.html
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET to retrieve the notes from the db.json file
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request to retrieve notes received`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// receive a new note to save on the request body
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request to create a new note received`);

    const { title, text } = req.body;

    if(req.body) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        db.push(newNote);
        fs.writeFileSync("./db/db.json", JSON.stringify(db))
        res.json('Note saved to request body');
    } else {
        res.error('Error saving to request body');
    }
});

// promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

/**
 *  function to write to the JSON file
 *  @param {string} destination the file to write to
 *  @param {object} content the content to write to the file
 *  @returns {void} void
 */
const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
    );

/**
*  function to read data and append
*  @param {object} content the content to append to the file
*  @param {string} file the path to the file 
*  @returns {void} void
*/
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

// deletes note when btn is clicked by taking the note out of array then returning new array
app.delete("/api/notes/:id", (req, res) => {
    db.forEach((note, i) => {
      if (note.id === req.params.id) {db.splice(i, 1)}
    })
  
    fs.writeFile("db/db.json", JSON.stringify(db), (err) => {
        err ? console.info(err) : console.log('Note deleted from database')
    })
    res.send(db)
  })

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);