import { createRequire } from "module";

const require = createRequire(import.meta.url);

let app;

try {

    if (!process.env.VERCEL) {
        require("dotenv").config();
    }

    app = require("../backend/src/app");

} catch (err) {

    console.error("BOOT ERROR");
    console.error(err);

    const express = require("express");

    app = express();

    app.get("*",(req,res)=>{

        res.status(500).json({

            success:false,

            message:err.message,

            stack:err.stack

        });

    });

}

export default app;
