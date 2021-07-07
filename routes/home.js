const { Router } = require("express")
const express = require("express")
const { con } = require("../config/dbconfig")
const flash = require("connect-flash")
const bodyParser = require("body-parser")

let router = express.Router()
router.use(flash())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get(["/", "/index.html.var"], (req, res) => {
  res.render("home")
})

router.get("/home", (req, res) => {
  res.render("home")
})

router.get("/contact", (req, res) => {
  res.render("contact")
})

router.post("/contact", async (req, res) => {
  let { userName, userEmail, userMessage } = req.body
  let sql = `INSERT INTO messages(name,email,message,date)VALUES("${userName}","${userEmail}","${userMessage}","${Date.now()}")`
  con.query(sql, (err) => {
    if (err) {
      console.log(err)
      res.send({ success: false })
    } else {
      res.send({ success: true })
    }
  })
})

router.post("/subscribe", (req, res) => {
  let { subEmail } = req.body
  let sql = `SELECT COUNT(*) AS cnt FROM subscribers WHERE email = "${subEmail}"`
  con.query(sql, (err, data) => {
    if (err) {
      console.log(err)
      res.send({ success: false })
    } else {
      if (data[0].cnt > 0) {
        res.send({ success: true })
      } else {
        sql = `INSERT INTO subscribers (email,date) VALUES("${subEmail}","${Date.now()}");`
        con.query(sql, (err) => {
          if (err) {
            console.log(err)
            res.send({ success: false })
          } else {
            res.send({ success: true })
          }
        })
      }
    }
  })
})

router.get("/about", (req, res) => {
  res.render("about")
})
router.get("/collection", (req, res) => {
  res.redirect("/collection/all")
})

router.get("/collection/:category", (req, res) => {
  
  let sql
  if (req.params.category == "all") {
    sql = `SELECT * FROM products ORDER BY popularity desc`
  } else {
    sql = `SELECT * FROM products WHERE category = "${req.params.category}" ORDER BY popularity desc`
  }

  con.query(sql, (err, result) => {
    if (err) console.log(err)
    else {
      res.render("collection", { result })
    }
  })
})

router.get("/collection/:category/:styleno", (req, res) => {
  let query = req.params

  let sql = `SELECT 
    name,
    products.style_no as style_no,
    products.description,
    products.img_path as main_img_path,
    images.img_path as img_path,
    popularity
    FROM products JOIN images ON products.style_no = images.style_no 
    WHERE images.style_no = "${query.styleno}" AND products.category = "${query.category}"`

  con.query(sql, (err, result) => {
    if (err) console.log(err)
    else {
      let sql = `UPDATE products SET popularity = '${
        result[0].popularity + 1
      }' WHERE style_no = '${query.styleno}';`
      con.query(sql, (err) => {
        if (err) console.log(err)
      })
      res.render("product", { result })
    }
  })
})

module.exports = router
