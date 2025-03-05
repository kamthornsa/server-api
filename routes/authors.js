import express from 'express'
import pool from '../db/db.js'
import { verifyToken } from "../middleware/auth.js";

const router = express.Router()

// ดึงข้อมูล Authors ทั้งหมด
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM authors')
         res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: 'Server Error'
        })
    }
})
// เรียกดู by id
router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params
    try { const result = await pool.query(" SELECT * FROM authors WHERE author_id = $1 ", [id])
    if (result.rows.length === 0) {
        return res.status(404).json( {
           message: `ไม่พบข้อมูล Author ID ${id}`
        })
    }
    res.json(result.rows)
    } catch (err) {
        res.status(500).json({
            error: `Error ${err}`
        })
    }
} )

// เพิ่มข้อมูล
router.post( '/', verifyToken,  async(req, res) => {
    const { name, bdate, nation } = req.body
    try {
        const result = await pool.query(
            "INSERT INTO authors (name, birth_date, nationality) VALUES ( $1, $2, $3) RETURNING *",
            [name, bdate, nation]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json( {
            error: `Error ${err}`
        })
    }
})
// ลบข้อมูล
router.delete('/:id', verifyToken, async(req, res) => {
    const { id } = req.params
    try {
        await pool.query( "DELETE FROM authors WHERE author_id = $1", [id] )
        res.json( {
            message: ` Author delete ID ${id}`
        })
    } catch (err) {
        res.status(500).json({
            error: `Error ${err}`
        })
    }
})

router.post('/test/:id', (req, res) => {
    const { id } = req.params
    const { num1, num2 } = req.body

    console.log(id)
    console.log( "Num1 : " + num1 + " Num2 " + num2)


        let sum = num1 + num2
        res.json( {
            id :  id,
            result : "ผลรวมเท่ากับ : " + sum
        })

})

// แก้ไขข้อมูล
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params
    const { name, birth_date, nationality} = req.body

    try {
        const checkAuthor = await pool.query("SELECT * FROM authors WHERE author_id = $1", [id])
        if( checkAuthor.rows.length ===0) {
            return res.status(404).json( {
                error: " ไม่พบข้อมูล Author"
            })
        }

        const result =await pool.query(
            `UPDATE authors
                SET name = $1,
                birth_date=$2,
                nationality=$3
                WHERE author_id = $4
                RETURNING * `, [name, birth_date, nationality, id] )
        res.json({
            message: "แก้ไขข้อมูล Author เรียบร้อย",
            data: result.rows[0]
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: "Server error" + err
        })
    }
})
export default router