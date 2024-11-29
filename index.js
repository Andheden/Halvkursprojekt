const express = require("express");
const app = express();
const fs = require("fs");
const bcrypt = require("bcryptjs");
const escape = require("escape-html");
const session = require("express-session");
app.listen(1010);
app.use(express.static("html"));
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {}
  }))


app.get("/login", loginPage);
app.get("/signup", signupPage);
app.get("/", homePage);

app.post("/signup", signup);
app.post("/login", login);

app.get("/session", (req, res) => {
    res.send(req.session);
})


function loginPage(req, res) {
    res.sendFile(__dirname + "/public/html/login.html");
}

function signupPage(req, res) {
    res.sendFile(__dirname + "/public/html/signup.html");
}

async function signup(req, res) {

    try {

        let data = req.body;

        if (data.password.length == 0)
            return res.send(render("try a real password yn fn"));
        let users = JSON.parse(fs.readFileSync("users.json").toString());
        let usersExist = users.find(u => u.email == data.email);
        if (usersExist) return res.send(render("user exits..."));

        data.password = await bcrypt.hashSync(data.password, 5);


        users.push(data);

        fs.writeFileSync("users.json", JSON.stringify(users, null, 3));

        res.send(render(JSON.stringify(data)));
    } catch (error) {
        res.send(render(error.message));
    }

}

async function login(req, res) {

    try {
        let email = req.body.email;
        let pw = req.body.password;

        let users = JSON.parse(fs.readFileSync("users.json").toString());

        let usersExist = users.find(u => u.email == email);
        if (!usersExist) return res.send(render("Create an account first FN"));

        let hash = await bcrypt.hash(pw, 5);
        let checkpw = await bcrypt.compare(pw, usersExist.password);
        if (!checkpw) return res.send(render("Wrong password FN"));

        req.session.auth = true;
        req.session.email = email;
        res.send(render("Du är nu inloggad som " + escape(email)));
    } catch (error) {
        res.send(render(error.message));
    }

}




function homePage(req, res) {
    if(req.session.auth == true)
        return res.send(render("Hello " + req.session.email));
    
}






function render(content) {
    let html = fs.readFileSync(__dirname + "/public/html/mainpage.html").toString();
    return html.replace("**hej**", content);
}
