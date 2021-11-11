const generateRandomChar = () => {
  const randomNumber = Math.floor(Math.random() * (57 - 48 + 1)) + 48;
  const randomCapitalLetter = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
  const randomLowercaseLetter = Math.floor(Math.random() * (122 - 97 + 1)) + 97;
  const charType = Math.floor(Math.random() * 3) + 1;

  let charCode;
  if (charType === 1) charCode = randomNumber;
  if (charType === 2) charCode = randomCapitalLetter;
  if (charType === 3) charCode = randomLowercaseLetter;

  return String.fromCharCode(charCode);
};

const generateRandomString = (length) => {
  let str = "";
  if (typeof length !== "number") return str;
  while (str.length < length) {
    str += generateRandomChar();
  }
  return str;
};

const getUserByEmail = (email, users) => {
  if (!email || !users) return;
  const vals = Object.values(users);
  let user;
  vals.forEach((value) => {
    if (value.email === email) user = users[value.id];
  });
  return user;
};

const getURLsByUserId = (id, urlDatabase) => {
  const usersURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      usersURLs[shortURL] = { ...urlDatabase[shortURL] };
    }
  }
  return usersURLs;
};

const getTodaysDate = () => {
  const today = new Date();
  return today.toLocaleDateString();
};

// Status code messages from https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const statusMessages = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict"
};

const sendErrorMessage = (res, statusCode, message) => {
  const status = statusMessages[statusCode];
  res.status(statusCode).render("error_message", { message, status, statusCode });
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  getURLsByUserId,
  sendErrorMessage,
  getTodaysDate
};