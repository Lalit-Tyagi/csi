const express = require("express")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const { con } = require("../config/dbconfig")
const multer = require("multer")
const { coloudinaryConfig, uploader } = require("../config/cloudinaryconfig")

let router = express.Router()
var upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: "mainImage", maxCount: 1 },
  { name: "images" },
])

const isLoggedIn = (req, res, next) => {
  if (!req.session.loginid) {
    return res.redirect("/manage/login")
  }
  next()
}

const isCEO = (req, res, next) => {
  if (req.session.loginid != process.env.CEO_ID) {
    return res.redirect("/manage/logout")
  }
  next()
}

router.get("/login", (req, res) => {
  res.render("manager/login")
})

router.post("/login", (req, res) => {
  let { loginId, password } = req.body
  let sql = `SELECT  * FROM manager where login_id ="${loginId}"`

  con.query(sql, async (err, result) => {
    if (err) console.log(err)
    if (result.length < 1) {
      res.redirect("/manage/login")
    } else {
      let valid = await bcrypt.compare(password, result[0].password)
      if (valid) {
        req.session.loginid = loginId
        res.redirect("/manage")
      } else {
        res.redirect("/manage/login")
      }
    }
  })
})

router.get("/logout", (req, res) => {
  req.session.loginid = null
  req.session.destroy()
  res.redirect("/manage/login")
})

router.get("/", isLoggedIn, (req, res) => {
  res.render("manager/home")
})

router.get("/product", isLoggedIn, (req, res) => {
  res.render("manager/products")
})

router.get("/product/new", isLoggedIn, (req, res) => {
  res.render("manager/addProduct")
})

//check is the product eith gver style no already exitst
//used as middleware to check before uploading images to coludinary
const checkProductExist = (req, res, next) => {
  var { pStyleNo } = req.body
  sql = `SELECT * FROM products WHERE style_no = "${pStyleNo}"`
  con.query(sql, async (err, result) => {
    if (err) {
      console.log(err)
      req.flash("error", `Unable to connect to database! Please Try Again!`)
      return res.redirect("/manage/product/new")
    }

    if (result.length && result.length > 0) {
      req.flash(
        "error",
        `Product with this  Style no "${pStyleNo}" already exist.`
      )
      return res.redirect("/manage/product/new")
    }

    next()
  })
}

var covertBufferToImageUri = (mimetype, buffer) => {
  uri = "data:" + mimetype + ";base64," + buffer.toString("base64")
  return uri
}

router.post(
  "/product/new",
  isLoggedIn,
  upload,
  checkProductExist,
  async (req, res) => {
    let { pName, pStyleNo, pCategory, pSubCategory, pDescription } = req.body

    console.log("uplading images")
    if (!req.files.mainImage) {
      req.flash("error", "Main image is mandatory")
      return res.redirect("/manage/product/new")
    }
    if (!req.files.images) {
      req.flash("error", "At least one sub image requierd")
      return res.redirect("/manage/product/new")
    }

    main = req.files.mainImage[0]
    uri = covertBufferToImageUri(main.mimetype, main.buffer)
    await uploader.upload(uri, (err, result) => {
      if (err) {
        console.log(error)
        res.flash("error", "something went wrong while uploding images")
        return res.redirect("manage/product/new")
      }
      let insertProduct
      if (req.files.mainImage) {
        insertProduct = `INSERT INTO products (name,style_no,category,sub_category,description,img_name,img_path) Values ("${pName}","${pStyleNo}","${pCategory.trim()}","${pSubCategory.trim()}","${pDescription}","${
          result.public_id
        }","${result.url}")`
        con.query(insertProduct, (err) => {
          if (err) {
            console.log(err)
          }
        })
      }
      console.log("done iploading main image")
    })

    for (let i = 0; i < req.files.images.length && i < 3; i++) {
      image = req.files.images[i]
      uri = covertBufferToImageUri(image.mimetype, image.buffer)
      await uploader.upload(uri, (error, result) => {
        if (error) {
          console.log(error)
          res.flash("error", "something went wrong while uploding images")
          return res.redirect("/manage/product/new")
        }

        let insertImages = `INSERT INTO images (style_no,img_name,img_path) VALUES("${pStyleNo}","${result.public_id}","${result.url}");`
        con.query(insertImages, (err) => {
          if (err) {
            console.log(err)
          }
        })
        console.log("done uploading image ", i)
      })
    }
    console.log("uploading done")
    req.flash("success", `Product Added Successfully, Style No = ${pStyleNo}`)

    res.redirect("/manage/product/new")
  }
)

router.get("/product/search", isLoggedIn, (req, res) => {
  let sql = `SELECT * FROM products WHERE style_no LIKE '%${req.query.q}%';`

  con.query(sql, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.send({ result })
    }
  })
})

router.get("/product/:category", isLoggedIn, (req, res) => {
  let sql
  if (req.params.category == "all") {
    sql = "SELECT * FROM products ORDER BY popularity desc"
  } else {
    sql = `SELECT * FROM products WHERE category = "${req.params.category}" ORDER BY popularity desc`
  }

  con.query(sql, (err, result) => {
    if (err) console.log(err)
    else {
      res.send({ result })
    }
  })
})

router.get("/product/:styleno/edit", isLoggedIn, (req, res) => {
  let sql = `SELECT 
    name,
    products.style_no as style_no,
    products.description,
    products.category as category,
    products.sub_category as sub_category,
    products.img_path as main_img_path,
    images.img_path as img_path
    FROM products INNER JOIN images ON products.style_no = images.style_no 
    WHERE images.style_no = "${req.params.styleno}"`

  con.query(sql, (err, result) => {
    if (err) console.log(err)
    else {
      // console.log(result)
      res.render("manager/editProduct", { result })
    }
  })
})

router.post("/product/:styleno/edit", isLoggedIn, (req, res) => {
  let { pName, pCategory, pSubCategory, pDescription } = req.body

  let sql = `UPDATE products SET name = "${pName}",category = '${pCategory.trim()}', sub_category = '${pSubCategory.trim()}',description = '${pDescription.trim()}'
    WHERE style_no = '${req.params.styleno}' `
  con.query(sql, (err) => {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/manage/product")
    }
  })
})

router.get("/product/:styleno/delete", isLoggedIn, (req, res) => {
  let sql = `SELECT 
    products.img_path as main_img_path,
    products.img_name as main_img_name,
    images.img_name as img_name,
    images.img_path as img_path
    FROM products INNER JOIN images ON products.style_no = images.style_no 
    WHERE images.style_no = "${req.params.styleno}"`

  con.query(sql, async (err, result) => {
    if (err) console.log(err)
    else {
      await cloudinary.uploader.destroy(result[0].main_img_name)
      for (let i = 0; i < result.length; i++) {
        await cloudinary.uploader.destroy(result[i].img_name)
      }
    }
  })
  sql = `DELETE FROM products WHERE style_no ="${req.params.styleno}"`
  con.query(sql, (err) => {
    if (err) {
      console.log(err)
    }
  })

  sql = `DELETE FROM images WHERE style_no ="${req.params.styleno}"`
  con.query(sql, (err) => {
    if (err) {
      console.log(err)
    }
  })
  res.redirect("/manage/product")
})

router.get("/messages", isCEO, (req, res) => {
  let sql = "SELECT * FROM messages ORDER BY messages.date desc"
  con.query(sql, (err, result) => {
    if (err) console.log(err)
    else {
      res.render("manager/messages", { result })
    }
  })
})

router.post("/messages/update", isCEO, (req, res) => {
  let { id, state } = req.body

  let sql = `UPDATE messages SET messages.read = ${state} WHERE id = ${id}`

  con.query(sql, (err) => {
    if (err) {
      console.log(err)
      res.send({ success: false })
    }

    res.send({ success: true })
  })
})

router.get("/messages/del/:id", isCEO, (req, res) => {
  let { id } = req.params
  let sql = `DELETE FROM messages WHERE ID=${id}`

  con.query(sql, (err) => {
    if (err) {
      console.log(err)
      res.send({ success: false })
    } else {
      res.send({ success: true })
    }
  })
})

router.get("/subscribers", isCEO, (req, res) => {
  let sql = "SELECT * FROM subscribers ORDER BY date desc"

  con.query(sql, (err, result) => {
    if (err) console.log(err)
    else {
      res.render("manager/subscribers", { result })
    }
  })
})

router.get("/subscribers/del/:id", isCEO, (req, res) => {
  let { id } = req.params
  let sql = `DELETE FROM subscribers WHERE ID=${id}`

  con.query(sql, (err) => {
    if (err) {
      console.log(err)
      res.send({ success: false })
    } else {
      res.send({ success: true })
    }
  })
})

module.exports = router
