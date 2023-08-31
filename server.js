const express = require("express");
const bodyParser = require("body-parser");
const passRoutes = require("./src/routes");
const controller = require("./src/controller");
const app = express();
const port = 3000;
const session = require("express-session");
const FileStore = require("session-file-store")(session);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("frontend"));
app.set("view engine", "ejs");

// app.use('/signup', (req, res, next)=>{
//     console.log("Enter signup")
//     next()
// })

app.use(
  session({
    secret: "alion",
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use((req, res, next) => {
  console.log(req.session);
  const ignoreEnds = ["/", "/login", "/signup", "/login?registered"];

  if (req.session.username || ignoreEnds.find((item) => item == req.url)) {
    return next();
  }

  return res.redirect("/login");
  return next();
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error in destroying session:", err);
    }
    res.redirect("/login");
  });
});

app.use("/signup", passRoutes);

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/frontend/signup.html");
});

app.get("/avtrain", function (req, res) {
  res.sendFile(__dirname + "/frontend/avtrains.html");
});

app.get("/srcdes", function (req, res) {
  res.sendFile(__dirname + "/frontend/SrcDes.html");
});
app.get("/addingadmin", function (req, res) {
  res.sendFile(__dirname + "/frontend/adminuser.html");
});

app.get("/", (req, res) => {
  res.redirect(302, "/signup");
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/frontend/login.html");
});

app.post("/login", controller.login);
app.get("/search", controller.search);
app.post("/adminuser", controller.adminuser);

app.get("/bookuser", function (req, res) {
  res.sendFile(__dirname + "/frontend/bookuser.html");
});
app.post("/bookuser", controller.bookuser);

app.get("/addpass", function (req, res) {
  res.sendFile(__dirname + "/frontend/addpass.html");
});

app.post("/addpass", controller.addpass);

app.post("/cancel", controller.cancelticket);

app.post("/showticket", controller.showticket);
app.get("/showticket", controller.showticket);
app.get("/availabletrain", controller.availabletrain);
app.get("/showtrains", controller.search);
app.get("/showavtrains", controller.allavtrain);
app.post("/release", controller.release_train);

app.listen(port, () => {
  console.log("server started");
});
