const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "testuser123": {
    id: "testuser123",
    email: "user@example.com",
    password: "88888888"
  },
  "testuserabc": {
    id: "testuserAb",
    email: "user2@example.com",
    password: "22222222"
  },
  "E02a9OV5xz": {
    id: "E02a9OV5xz",
    email: "test@test.com",
    password: "abcdefgh"
  }
}

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
}

const generateRandomString = (length) => {
  let str = "";

  while (str.length < length) {
    str += generateRandomChar();
  }

  return str;
}

const getUserByEmail = (email, users) => {
  const vals = Object.values(users);
  let user;

  vals.forEach((value) => {
    if (value.email === email) user = users[value.id];
  });
  console.log(user);
  return user;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {email , password} = req.body;
  if (!email || !password) return res.status(400).send("Email or Password field is empty.");
  const user = getUserByEmail(email,users);
  if (!user) return res.status(403).send("Email not found. Please create a new account.");
  if (password !== user.password) return res.status(403).send("Password is incorrect.");
  
  res.cookie("user_id", user.id);
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
  if (!email || !password) return res.status(400).send("Email or Password field is empty.");
  if (getUserByEmail(email, users)) return res.status(400).send("Email is already being used. Please login.");
  const userId = generateRandomString(10);
  users[userId] = {
    userId,
    email,
    password
  };
  console.log(users);
  res.cookie("user_id", userId);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const { user_id } = req.cookies;
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  }

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const { user_id } = req.cookies;
  if (!user_id) return res.status(401).send("401: Unauthorized\n");
  const { longURL } = req.body;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls`)
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL]

  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const { user_id } = req.cookies;
  if (!user_id) return res.redirect("/login");
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { user_id } = req.cookies;
  const user = users[user_id];
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    user
  };

  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});