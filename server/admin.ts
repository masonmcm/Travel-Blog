import * as express from "express";
import * as bcrypt from "bcrypt";
import * as cookieParser from "cookie-parser";
import {DB, Rows, InsertResult} from "./db";

let router = express.Router();

// Helper function to find path of current page
let path = (req: express.Request): string => {
    return `${req.baseUrl}${req.path}`;
};

// Cookie parser will read and write secure cookies that are protected by our cookie secret

router.use(cookieParser(process.env.COOKIE_SECRET));

router.get("/login", (req, res) => {
    res.render("admin/login", {
        layout: "admin", 
        message: req.query.message
    });
});

router.post("/login", async (req, res) => {
    let isValid = await bcrypt.compare(req.body.password, process.env.ADMIN_PASSWORD_HASH);
    if(isValid) {
        res.cookie("authenticated", "true", {
            signed: true // by using the signed option, our cookie is secure
        });
        res.redirect(`${req.baseUrl}`); // Redirect to admin homepare
    } else {
        res.redirect(`${req.baseUrl}/login?message=Password Incorrect`);
    }
});

router.use((req, res, next) => {
    if(req.signedCookies.authenticated) {
        next();
    } else {
        return res.redirect(`${req.baseUrl}/login`);
    }
});

router.get("/", (req, res) => {
    res.render("admin/index", {
        layout: "admin"
    });
});


// For listing all todos

router.get("/todos", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM todos");
    res.render("admin/todos/index", {
        todos: rows, 
        layout: "admin"
    });
});


// We're defining the route above /todos/:id to be sure that
// it gets tested by the router logic first

router.get("/todos/new", (req, res) => {
    res.render("admin/todos/editor", {
        action: `${req.baseUrl}/todos/`, 
        layout: "admin", 
        todo: {
            description: "",
            url: ""
        },
    });
});

router.get("/logout", (req, res) => {
    res.clearCookie("authenticated");
    res.redirect(`${req.baseUrl}/login`)
});

// The route for creating a new todo is just '/todos'
// because the HTTP spec says when you create a new resource, 
// it should be the subordinate to the URL that you posted your data to 

router.post("/todos", async (req, res) => {
    try {
        let sql = `INSERT INTO todos
                    (description, url)
                    VALUES
                    (:description, :url)`;
        let params = {
            description: req.body.description,
            url: req.body.url
        };

        // Creating a new record in the DB is special because
        // We need to know the ID that the DB assigned to our new record. 
        let [result] = await DB.execute<InsertResult>(sql, params);
        res.redirect(`${path(req)}${result.insertId}?message=Saved!`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}?message=Error Saving`);
    }
});


// View the editor of an existing todo

router.get("/todos/:id", async (req, res) => {
        let sql = "Select * FROM todos WHERE id=:id";
        let params = {id: req.params.id };
        try {
            let [rows] = await DB.query<Rows>(sql, params);
            if(rows.length === 1) {
                res.render("admin/todos/editor", {
                    todo: rows[0],
                    action: path(req),
                    layout: "admin",
                    message: req.query.messageß
                });
            } else {
                res.redirect(`${path(req)}/../`);
            }
        } catch (e) {
            console.error(e);
            res.redirect(`${path(req)}/../`);
        }
});

router.post("/todos/:id", async (req, res) => {
    try {
        // You can use MySQL workbench to generate this sql with specific values
        // Replace specific values with placeholders prefixed by : 
        let sql = `UPDATE todos     
                   SET description=:description, 
                       url=:url 
                   WHERE id=:id`;
        let params = {
            id: req.params.id,
            description: req.body.description,
            url: req.body.url
        };

        if (req.body.description === "") {
            res.redirect(path(req) + "/new?message=Invalid_Description");
            return;
        }

        await DB.execute<Rows>(sql, params);
        res.redirect(`${path(req)}?message=Saved!`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}?message=Error Saving`);
    }
});

router.post("/todos/:id/delete", async (req, res) => {
    let sql = "DELETE FROM todos WHERE id=:id";
    let params = {
        id: req.params.id
    };
    try {
        await DB.execute<Rows>(sql, params);
        res.redirect(`${path(req)}/../../`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}/../../`);
    }
});

export default router;