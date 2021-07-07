const express = require("express")
const { con } = require("../config/dbconfig")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")

let router = express.Router()

router.use(express.json())

const isLoggedIn = (req, res, next) => {
  if (req.session.loginid !== process.env.ADMIN_ID) {
    return res.redirect("/admin/login")
  }
  next()
}
router.get("/", isLoggedIn, (req, res) => {
  let sql = "SELECT * FROM manager"

  con.query(sql, (err, result) => {
    if (err) console.log(err)
    else res.render("admin/manager", { result })
  })
})

router.get("/login", (req, res) => {
  res.render("admin/login")
})

router.post("/login", async (req, res) => {
  let { loginId, password } = req.body
  let sql = `SELECT  * FROM admin where admin_id ="${loginId}"`
  con.query(sql, async (err, result) => {
    if (err) console.log(err)
    if (result.length < 1) {
      res.redirect("/admin/login")
    } else {
      let valid = await bcrypt.compare(password, result[0].adminpassword)
      if (valid) {
        req.session.loginid = loginId
        res.redirect("/admin")
      } else {
        res.redirect("/admin/login")
      }
    }
  })
})
router.get("/logout", (req, res) => {
  req.session.loginid = null
  req.session.destroy()
  res.redirect("/admin/login")
})
router.get("/manager", isLoggedIn, (req, res) => {
  res.render("admin/register")
})

router.get("/manager/del/:id", isLoggedIn, (req, res) => {
  let { id } = req.params
  let sql = `DELETE FROM manager WHERE ID=${id}`

  con.query(sql, (err) => {
    if (err) {
      res.send({ success: false })
    } else {
      res.send({ success: true })
    }
  })
})

router.post("/manager", isLoggedIn, async (req, res) => {
  let { name, loginid, password } = req.body
  let hashedpassword = await bcrypt.hash(password, 10)
  sql = `INSERT INTO manager (name,login_id,password) VALUES("${name}","${loginid}","${hashedpassword}")`
  con.query(sql, (err) => {
    if (err) console.log(err)
    else res.redirect("/admin")
  })
})

module.exports = router
