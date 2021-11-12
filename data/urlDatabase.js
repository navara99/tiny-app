const { getTodaysDate } = require("../helpers");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "testuser",
    logs: [], // Keep track of every visit in this array,
    visitors: [], // keep track of every visitor's id,
    date: getTodaysDate()
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "testuser",
    logs: [],
    visitors: [],
    date: getTodaysDate()
  },
  "jkI45a": {
    longURL: "https://www.freecodecamp.org/",
    userID: "testuser2",
    logs: [],
    visitors: [],
    date: getTodaysDate()
  },
  "jfa231": {
    longURL: "https://www.npmjs.com/",
    userID: "testuser",
    logs: [],
    visitors: [],
    date: getTodaysDate()
  },
  "sgga2l": {
    longURL: "https://stackoverflow.com/",
    userID: "testuser",
    logs: [],
    visitors: [],
    date: getTodaysDate()
  }
};

module.exports = urlDatabase;