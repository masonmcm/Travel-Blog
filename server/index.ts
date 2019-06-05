import * as dotenv from "dotenv";
dotenv.config();

import { DB, Rows } from "./db";

import * as express from "express";
import * as exphbs from "express-handlebars"

let app = express();

// Serve static files from the dist directory which parcel builds from our 
// npm run build command. 

app.use(express.static("dist/"));

// What's the difference between this and the aforementioned line? 
// app.use("/static", express.static("dist/"));

app.set("view engine", "hbs");
app.set("views", "server/views");
app.engine("hbs", exphbs({
    defaultLayout: "default",
    extname: "hbs",
}));

app.get("/", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM posts ORDER BY publishAt DESC");
    console.log(rows);
    res.render("index", {
        title: "On the Go!",
        posts: rows,
    })
});



app.get("/todos.json", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM todos");
    res.json(rows);
});

app.get("/todos", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM todos");
    res.render("todos-demo", {todos: rows});
});

app.get("/todos/eat", async (req, res) => {
    let sql = "INSERT INTO `todos` (`description`, `url`) VALUES (:description, :url)";
    await DB.execute(
        sql,
        {description: "EAT", url: "http://food.com"}
    );
    res.redirect("/todos");
});

app.get("/todos/:id", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM todos WHERE id = :id", {id: req.params.id});
    res.json(rows);
});

app.get("/itinerary", (req, res) => {
    res.render("itinerary", {
        title: "Itinerary- nice"
    })
});

app.get("/about", (req, res) => {
    res.render("about", {
        title: "About"
    })
});

app.get("/gallery", (req, res) => {
    res.render("gallery", {
        title: "Gallery"
    })
});


export let main = async () => {
    app.listen(process.env.PORT, () => console.log(`Listening on ${process.env.PORT}`))
    .on("error", (e) => console.error(e));
};

main();
