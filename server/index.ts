import * as express from "express";
import * as exphbs from "express-handlebars"
import { reduceEachLeadingCommentRange } from "typescript";

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

app.get("/", (req, res) => {
    res.render("index", {
        title: "On the Go!"
    })
});

app.get("/itinerary", (req, res) => {
    res.render("itinerary", {
        title: "Itinerary"
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


app.listen(1234, () => console.log("Listening on 1234"))
    .on("error", (e) => console.error(e));