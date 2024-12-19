const express = require("express");
const app = express();
const fs = require("fs");
const bcrypt = require("bcryptjs");
const escape = require("escape-html");
const session = require("express-session");
const {getHtml, render, getIMG, sparabilder, skapaBild, deleteBild} = require("./func");


app.listen(1010);
app.use(express.static("public/css"));
app.use(express.static("public/html"));
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
app.get("/img/create", showCreate)
app.get("/bilder/delete/:id", remove)

app.post("/signup", signup);
app.post("/login", login);
app.post("/img/create", create)

app.get("/session", (req, res) => {
    res.send(req.session);
})


function loginPage(req, res) {
    res.sendFile(__dirname + "/public/html/login.html")
}

function signupPage(req, res) {
    res.sendFile(__dirname + "/public/html/signup.html")
}


function showCreate (req, res) {


    if (req.session.auth) {

        let form = getHtml(__dirname + "/public/html/create")
        let html = render(form)

        return res.send(html)}
    else  {
        return res.send("<h1>Logga in först</h1>" + `<a href="/login.html">Logga in</a>`) }

}

function create (req, res) {

    let {namn, img} = req.body;
    namn = escape(namn);
    let email = req.session.email;

    if (!namn || !img) return res.send("SKRIV IN DATA!")

        let id = "id_" +Date.now();

        let bild = {id, namn, img, email}
        skapaBild(bild)
        res.redirect("/")

}

function remove (req, res) {

    let id = req.params.id;
    let bilder = getIMG();
    let bilder2 = bilder.find(b=>b.email==req.session.email)
    if (bilder2) {
        if (bilder2.email == req.session.email) {
            deleteBild(id);
            return res.redirect("/")
        }
    } return res.redirect("/")
    



}

async function signup(req, res) {

    try {

        let data = req.body;
        data.id ="id_"+Date.now();
        if (data.password.length == 0)
            return res.send(render("try a real password yn fn"));
        let users = JSON.parse(fs.readFileSync("users.json").toString());
        let usersExist = users.find(u => u.email == data.email);
        if (usersExist) return res.send(render("user exits..."));

        data.password = await bcrypt.hash(data.password, 12);


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

        let hash = await bcrypt.hash(pw, 12);
        let checkpw = await bcrypt.compare(pw, usersExist.password);
        if (!checkpw) return res.send(render("Wrong password FN"));

        req.session.auth = true;
        req.session.username = usersExist.username;

        req.session.email = usersExist.email;


        res.redirect("/");
      
    } catch (error) {
        res.send(render(error.message));
    }

}




function homePage(req, res) {

    if (req.session.auth) {

            let bilder = getIMG();

            let html = bilder.map(g=>(
                `
                <div id="${g.id}" class="bilder">

                    <h3>${g.namn}</h3>
                    <img src="${g.img}" alt="">
                    <a href = "/bilder/delete/${g.id}"><button>DELETE</button></a>

                </div>
                `
            )).join();

        return res.send(render(html))}
    else  {
        return res.send("<h1>Logga in först</h1>" + `<a href="login.html">Logga in</a>`) }
    }
    
