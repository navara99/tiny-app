const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, getURLsByUserId, sendErrorMessage } = require("./helpers");
const users = require("./data/usersData");
const urlDatabase = require("./data/urlDatabase");
const bcrypt = require("bcrypt");
const PORT = 8080;
const secret = generateRandomString(12);

app.set("view engine", "ejs");
app.use(cookieSession({ secret }));
app.use(bodyParser.urlencoded({ extended: true }));

//  Messages used in handling errors

const mustLogin = "You must login to make this request.";
const noPermissionUpdate = "You do not have permission to update this resource.";
const noPermissionDelete = "You do not have permission to delete this resource.";
const noPermissionCreate = "You do not have permission to create a resource."
const noAccess = "You do not have access to this resource."
const incorrectEmailOrPass = "Email/Password is incorrect.";
const emptyEmailPassword = "Email or Password field is empty.";
const emailNotFound = "Email not found. Please create a new account."
const emailAlreadyUsed = "Email is already being used. Please login.";
const notFound = "The requested resource was not found.";
const notLoggedIn = "Please login or create a new account to use TinyApp."

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.session;
  if (!user_id) return sendErrorMessage(res, 401, mustLogin);
  if (urlDatabase[id].userID !== user_id) return sendErrorMessage(res, 403, noPermissionUpdate)

  const { longURL } = req.body;
  urlDatabase[id] = { longURL, userID: user_id };
  res.redirect("/urls");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const { user_id } = req.session;
  const { shortURL } = req.params;
  if (!user_id) return sendErrorMessage(res, 401, mustLogin)
  if (urlDatabase[shortURL].userID !== user_id) return sendErrorMessage(res, 403, noPermissionDelete);

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return sendErrorMessage(res, 400, emptyEmailPassword);
  const user = getUserByEmail(email, users);
  if (!user) return sendErrorMessage(res, 403, emailNotFound);

  const correctPassword = bcrypt.compareSync(password, user.hashedPassword);

  if (!correctPassword) sendErrorMessage(res, 403, incorrectEmailOrPass);

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: undefined
  };
  res.render("login_page", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: undefined
  };
  res.render("register_page", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return sendErrorMessage(res, 400, emptyEmailPassword);
  if (getUserByEmail(email, users)) return sendErrorMessage(res, 409, emailAlreadyUsed);

  const userId = generateRandomString(10);

  const hashedPassword = bcrypt.hashSync(password, 12);

  users[userId] = {
    id: userId,
    email,
    hashedPassword
  };

  req.session.user_id = userId;
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  if (!user) return res.render("login_message", { message: notLoggedIn, user })
  const userURLs = getURLsByUserId(user_id, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user
  }

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  if (!user) return sendErrorMessage(res, 401, mustLogin);
  if (user.id !== user_id) return sendErrorMessage(res, 403, noPermissionCreate)

  const { longURL } = req.body;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL, userID: user_id };

  res.redirect(`/urls`)
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (!urlDatabase[shortURL]) return sendErrorMessage(res, 404, notFound);

  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  if (!user) return res.redirect("/login");
  const templateVars = {
    urls: urlDatabase,
    user
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { user_id } = req.session;

  if (!user_id) return sendErrorMessage(res, 401, mustLogin);
  if (urlDatabase[shortURL].userID !== user_id) return sendErrorMessage(res, 403, noAccess);

  const user = users[user_id];
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user
  };

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}.`);
});