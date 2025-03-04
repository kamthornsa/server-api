import express from "express"
import pool from "../db/db.js"

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM publishers")
        res.json(result.rows)
    } catch (err) {
        console.log(err)
        res.status(500).json( {
            error: "Server Error" + err
        })
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        const result = await pool.query("SELECT * FROM publishers WHERE publisher_id = $1", [id])
        if (result.rows.length ===0) {
            return res.json( {
                message: "ไมพบข้อมูล Publisher ID : " + id
            })
        }
        res.json(result.rows)
    } catch (err) {
        console.log(err)
        res.json({
            error: "Server Error : " + err
        })
    }
})

router.post('/', async (req, res) => {
    const { publisher_name } = req.body
    try {
        const result = await pool.query("INSERT INTO publishers (publisher_name) VALUES ($1) RETURNING *",
             [publisher_name])
             res.status(201).json(result.rows[0])
    } catch (err) {
        console.log(err)
        res.status(500).json( {
            error: "Server Error" + err
        } )
    }
})

export default router