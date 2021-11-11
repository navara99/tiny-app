const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, getURLsByUserId, getTodaysDate, sendErrorMessage } = require("./helpers");
const users = require("./data/usersData");
const urlDatabase = require("./data/urlDatabase");
const bcrypt = require("bcrypt");
const secret = generateRandomString(12);
const methodOverride = require("method-override");
const PORT = 8080;

/*********************************************** General App Setup ***********************************************/

// Setting ejs as view engine
app.set("view engine", "ejs");

// Settings up morgan middlewear for dev
app.use(morgan('tiny'));

// Setting up cookie-session middlewear
app.use(cookieSession({ secret }));

// Setting up bodyParser middlewear
app.use(bodyParser.urlencoded({ extended: true }));

// override with POST having ?_method=DELETE & ?_method=PUT
app.use(methodOverride("_method"));

//  Messages used in handling errors

const mustLogin = "You must login to make this request.";
const noPermissionUpdate = "You do not have permission to update this resource.";
const noPermissionDelete = "You do not have permission to delete this resource.";
const noAccess = "You do not have access to this resource."
const incorrectEmailOrPass = "Email/Password is incorrect.";
const emptyEmailPassword = "Email or Password field is empty.";
const emailNotFound = "Email not found. Please create a new account."
const emailAlreadyUsed = "Email is already being used. Please login.";
const notFound = "The requested resource was not found.";
const notLoggedIn = "Please login or create a new account to use TinyApp."

/****************************************** Authentication related routes ******************************************/

// Render register form

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: undefined
  };
  res.render("register_page", templateVars);
});

// Persist new user to database object

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Handle error when user submits form with empty email or password.
  if (!email || !password) return sendErrorMessage(res, 400, emptyEmailPassword);

  // Handle error when the entered email already exists.
  if (getUserByEmail(email, users)) return sendErrorMessage(res, 409, emailAlreadyUsed);

  // Generate random userId of length 10
  const userId = generateRandomString(10);

  // Hash password and add new user info to 
  const hashedPassword = bcrypt.hashSync(password, 12);
  users[userId] = {
    id: userId,
    email,
    hashedPassword
  };

  req.session.user_id = userId;
  res.redirect("/urls")
});

// Render login form

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: undefined
  };
  res.render("login_page", templateVars);
});

// Authenticate and log user in

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

// Log user out

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/****************************************** Application logic routes ******************************************/

// Redirect user to /urls page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Render urls summary page
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

// Render new url form

app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];

  // If the user is not logged in, redirect to login page
  if (!user) return res.redirect("/login");

  const templateVars = {
    urls: urlDatabase,
    user
  }
  res.render("urls_new", templateVars);
});

// Shorten new url

app.post("/urls", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];

  // A user must be logged in to create a new url
  if (!user) return sendErrorMessage(res, 401, mustLogin);

  const { longURL } = req.body;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL, userID: user_id, logs: [], visitors: [] };

  res.redirect(`/urls`)
});

// Update existing shortened url

app.put("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.session;

  // User must be logged in to have permission to update
  if (!user_id) return sendErrorMessage(res, 401, mustLogin);

  // User can only update urls that belong to the current user
  if (urlDatabase[id].userID !== user_id) return sendErrorMessage(res, 403, noPermissionUpdate)

  const { longURL } = req.body;
  // Reset the old information and then change the old long url to the new long url.
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
})

// Delete existing shortened url

app.delete("/urls/:shortURL", (req, res) => {
  const { user_id } = req.session;
  const { shortURL } = req.params;

  // User must be logged in to have permission to delete
  if (!user_id) return sendErrorMessage(res, 401, mustLogin);

  // Url being deleted must belong to the current user
  if (urlDatabase[shortURL].userID !== user_id) return sendErrorMessage(res, 403, noPermissionDelete);

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Render page to show selected url info

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { user_id } = req.session;
  if (!user_id) return sendErrorMessage(res, 401, mustLogin);

  const selectedURL = urlDatabase[shortURL];

  if (selectedURL.userID !== user_id) return sendErrorMessage(res, 403, noAccess);

  const user = users[user_id];
  const templateVars = {
    shortURL,
    user,
    ...selectedURL,
  };

  res.render("urls_show", templateVars);
});

// Redirect short url to long url

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { visitor_Id } = req.session;
  const selectedURL = urlDatabase[shortURL];
  // Send a 404 status code error if the shortened url doesnt exist in the database
  if (!selectedURL) return sendErrorMessage(res, 404, notFound);

  // if there is a visitor cookie present, use that as visitor id, if there isnt, create a new visitor id.
  const visitorId = visitor_Id ? visitor_Id : generateRandomString(6);

  // Set cookie for visitor , 
  req.session.visitor_Id = visitorId;

  // If this is the first time user is visiting this url, add their id to the visitors array
  const hasUserVisitedURLBefore = selectedURL.visitors.includes(visitorId);
  if (!hasUserVisitedURLBefore) selectedURL.visitors.push(visitorId);

  // Summarize visitor info into an object
  const visit = {
    visitorId,
    date: getTodaysDate()
  };

  // Push visit info object into log array of the url
  selectedURL.logs.push(visit);

  // Get the long url and redirect the visitor to that url
  const longURL = selectedURL.longURL
  res.redirect(longURL);
});

// Start listening on PORT

app.listen(PORT, () => {
  console.log(`✔️ - TinyApp is listening on port ${PORT}.`);
});