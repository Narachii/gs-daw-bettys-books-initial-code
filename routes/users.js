// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10

// Lab3: session
const redirectLogin = (req, res, next) => {
  if (!req.session.userId ) {
    // redirect to the login page
    console.log("user does not have userId in session")
    console.log("Session:", req.session)
    res.redirect('./loggedin') 
  } else {
      console.log("user has userId in session")
      next (); // move to the next middleware function
  }
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
  const plainPassword = req.body.password
  bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
    // Store hashed password in your database.
      let sqlquery = "INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)"
      let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword]
      db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
              next(err)
          }
          else
            result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email
            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
            res.send(result)
      })
  })
})

router.get('/loggedin', function (req, res, next) {
    res.render('loggedin.ejs')
})

router.post('/loggedin', function (req, res, next) {
  let hashedPassword = ""
  let hashedPlainPassword = ""
  let plainPassword = req.body.password
  let sqlquery = "SELECT hashedPassword FROM users where userName =" + '"' + req.body.username + '"'// query database to get all the books
  // execute sql query
  db.query(sqlquery, (err, result) => {
      if (err) {
          next(err)
      }
    hashedPassword = result[0].hashedPassword

    bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
      if (err) {
        // TODO: Handle error
      }
      else if (result == true) {
        // Save user session here, when login is successful
        // Lab3: session
        req.session.userId = req.body.username;
        res.send('You succesfully loged in! <a href='+'../'+'>Home</a>')
      }
      else {
        // TODO: Send message
        res.send('Check your passowrd and try again')
      }
    })
  })
})


router.get('/list', redirectLogin, function(req, res, next) {
      console.log("SessionID:", req.session.userId)
      let sqlquery = "SELECT id, firstName,lastName,userName,email FROM users" // query database to get all the users
      // execute sql query
      db.query(sqlquery, (err, result) => {
          if (err) {
              next(err)
          }
          res.render("user_list.ejs", {users:result})
      })
})

// Lab3: session
router.get('/logout', redirectLogin, (req,res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'../'+'>Home</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router
