# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Main Features

This application allows users to create an account and store shortened URLs in their account. Information about each URL can be monitored in the analytics section.

Available analytics:

- date the url was created
- total number of clicks
- total number of unique clicks (by sending visitor cookie)
- a complete log of every click (including date, time and visitor id)

Security measures are also implemented to protect user information. 

Security Measures:

- hashing passwords (bcrypt)
- cookie encryption (cookie-session)

## Final Product

!["Screenshot of URLs page"](https://github.com/navara99/tinyApp/blob/master/docs/urls-index-page.png)

!["Screenshot of analytics page"](https://github.com/navara99/tinyApp/blob/master/docs/urls-page.png)

!["Screenshot of login page"](https://github.com/navara99/tinyApp/blob/master/docs/login-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

DEV Dependencies

- chai
- mocha
- morgan
- nodemon

## Getting Started

1.  Clone the repository

```git clone  git@github.com:navara99/tinyApp.git```

2.  Install all dependencies

````npm install````

3.  Run the development web server 

```npm start```

4.  Visit http://localhost:8080/

## Future Plans

* implement line graph to visualize trends in clicks

* improve appearance to make design more modern (the current focus was only on functionality)

* add more analytics features (ex. add visitor's country/city to log details)
