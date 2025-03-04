import express from "express"
import pool from "../db/db.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/auth.js";

dotenv.config();
const router = express.Router()

const genToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name},
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN}
    )
}

// สมัครสมาชิก (Register)
router.post("/register", async (req, res) => {
    const { name, email, password} = req.body
    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        if(userExists.rows.length > 0) {
            return res.json({
                msg: "Email นี้มีการใช้งานแล้ว"
            })
        }
        const hashedPass = await bcrypt.hash(password, 10)
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING name, email",
            [name, email, hashedPass]
        )
        res.status(201).json(
            {
                msg: "สมัครสมาชิกสำเร็จ",
                user: newUser.rows[0]
            }
        )
    } catch (err) {
        res.status(500).json({ error : "Server Error : " + err })
    }
})

// เข้าสู่ระบบ (Login)
router.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        if (user.rows.length === 0) {
            return res.status(400).json( { msg : "ไม่พบ Email"} )
        }
        const validPassword = await bcrypt.compare(password, user.rows[0].password)
        if(!validPassword) {
            return res.status(400).json( {msg: "Password ไม่ถูกต้อง"} )
        }

        const token = genToken(user.rows[0])
        res.json({ msg: "เข้าสู่ระบบสำเร็จ", token})
    }
    catch (err) {
        res.status(500).json({ error: "Server Error " + err });
    }
})

// แสดงโปรไฟล์ member (Protected Route)
router.get("/", verifyToken, async (req, res) => {
    const userid = req.user.id
    try {
      const user = await pool.query("SELECT id, name, email, created_at FROM users WHERE id = $1", [userid]);
      res.json(user.rows[0]);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

router.post("/logout", verifyToken, (req, res) => {
    res.json({ message: "ออกจากระบบสำเร็จ โปรดลบ Token ที่ฝั่ง Client" });
});

export default router
