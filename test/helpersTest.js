const { assert } = require('chai');
const { getUserByEmail, getURLsByUserId } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "uniquepassword12124"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "aDifferentuniquepass998_"
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "https://ca.nba.com/?gr=www",
    userID: "userRandomID"
  },
  "sag34X": {
    longURL: "https://github.com/",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "https://www.udemy.com/",
    userID: "user2RandomID"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      password: "uniquepassword12124"
    };
    assert.deepEqual(user, expectedUser);
  });

  it('should return undefined with an invalid email', function () {
    const user = getUserByEmail("user100@example.com", testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined if first parameter is falsy', function () {
    const user = getUserByEmail(null, testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined if second parameter is falsy', function () {
    const user = getUserByEmail("user@example.com", null);
    assert.isUndefined(user);
  });

});

describe('getURLsByUserId', function () {
  it('should return a list of URLs belonging to the user when the input is a valid user id', function () {
    const URLs = getURLsByUserId("userRandomID", urlDatabase);
    const expectedURLs = {
      b2xVn2: { longURL: 'https://ca.nba.com/?gr=www', userID: 'userRandomID' },
      sag34X: { longURL: 'https://github.com/', userID: 'userRandomID' }
    }

    assert.deepEqual(URLs, expectedURLs);
  });

  it('should return an empty object if there are no URLs associated with the user id', function () {
    const URLs = getURLsByUserId("user123", urlDatabase);
    assert.deepEqual(URLs, {});
  });

  it('should return an empty object if the url database argument is an empty object', function () {
    const URLs = getURLsByUserId("userRandomID", {});
    assert.deepEqual(URLs, {});
  });

  it('should return an empty object if first parameter is falsy', function () {
    const URLs = getURLsByUserId(null, urlDatabase);
    assert.deepEqual(URLs, {});
  });

  it('should return an empty object if second parameter is falsy', function () {
    const URLs = getURLsByUserId("userRandomID", null);
    assert.deepEqual(URLs, {});
  });

});