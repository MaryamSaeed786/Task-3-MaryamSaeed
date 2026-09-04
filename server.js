const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Allow the server to receive JSON
app.use(express.json());


// ========================================
// CONNECT TO DATABASE
// ========================================

const db = new sqlite3.Database("./products.db", (err) => {

    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }

});


// ========================================
// CREATE PRODUCTS TABLE
// ========================================

db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL
    )
`, (err) => {

    if (err) {
        console.error("Table creation error:", err.message);
    } else {
        console.log("Products table is ready.");
    }

});


// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Task 3 Database API is running!"
    });

});


// ========================================
// CREATE - ADD PRODUCT
// POST /api/products
// ========================================

app.post("/api/products", (req, res) => {

    const {
        name,
        description,
        price,
        category,
        stock
    } = req.body;


    // Validation
    if (
        !name ||
        !description ||
        price === undefined ||
        !category ||
        stock === undefined
    ) {

        return res.status(400).json({
            success: false,
            error: "All product fields are required."
        });

    }


    if (typeof price !== "number" || price < 0) {

        return res.status(400).json({
            success: false,
            error: "Price must be a positive number."
        });

    }


    if (!Number.isInteger(stock) || stock < 0) {

        return res.status(400).json({
            success: false,
            error: "Stock must be a positive integer."
        });

    }


    const sql = `
        INSERT INTO products
        (name, description, price, category, stock)
        VALUES (?, ?, ?, ?, ?)
    `;


    db.run(
        sql,
        [
            name,
            description,
            price,
            category,
            stock
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: "Failed to add product."
                });

            }


            res.status(201).json({

                success: true,

                message: "Product added successfully.",

                product: {
                    id: this.lastID,
                    name,
                    description,
                    price,
                    category,
                    stock
                }

            });

        }
    );

});


// ========================================
// READ - GET ALL PRODUCTS
// GET /api/products
// ========================================

app.get("/api/products", (req, res) => {

    db.all(
        "SELECT * FROM products",
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: "Failed to retrieve products."
                });

            }


            res.json({

                success: true,

                count: rows.length,

                products: rows

            });

        }
    );

});


// ========================================
// READ - GET ONE PRODUCT
// GET /api/products/:id
// ========================================

app.get("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);


    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            error: "Product ID must be a number."
        });

    }


    db.get(
        "SELECT * FROM products WHERE id = ?",
        [id],
        (err, row) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: "Failed to retrieve product."
                });

            }


            if (!row) {

                return res.status(404).json({
                    success: false,
                    error: "Product not found."
                });

            }


            res.json({

                success: true,

                product: row

            });

        }
    );

});


// ========================================
// UPDATE - UPDATE PRODUCT
// PUT /api/products/:id
// ========================================

app.put("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const {
        name,
        description,
        price,
        category,
        stock
    } = req.body;


    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            error: "Product ID must be a number."
        });

    }


    if (
        !name ||
        !description ||
        price === undefined ||
        !category ||
        stock === undefined
    ) {

        return res.status(400).json({
            success: false,
            error: "All product fields are required."
        });

    }


    if (typeof price !== "number" || price < 0) {

        return res.status(400).json({
            success: false,
            error: "Price must be a positive number."
        });

    }


    if (!Number.isInteger(stock) || stock < 0) {

        return res.status(400).json({
            success: false,
            error: "Stock must be a positive integer."
        });

    }


    const sql = `
        UPDATE products
        SET
            name = ?,
            description = ?,
            price = ?,
            category = ?,
            stock = ?
        WHERE id = ?
    `;


    db.run(
        sql,
        [
            name,
            description,
            price,
            category,
            stock,
            id
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: "Failed to update product."
                });

            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    error: "Product not found."
                });

            }


            res.json({

                success: true,

                message: "Product updated successfully."

            });

        }
    );

});


// ========================================
// DELETE - DELETE PRODUCT
// DELETE /api/products/:id
// ========================================

app.delete("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);


    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            error: "Product ID must be a number."
        });

    }


    db.run(
        "DELETE FROM products WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: "Failed to delete product."
                });

            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    error: "Product not found."
                });

            }


            res.json({

                success: true,

                message: "Product deleted successfully."

            });

        }
    );

});


// ========================================
// UNKNOWN ROUTE
// ========================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error: "API endpoint not found."

    });

});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});