const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

// PORT number
const PORT = 3001;

// express
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));