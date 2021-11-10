const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    console.log(user);
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
});