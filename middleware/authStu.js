const jwt = require('jsonwebtoken')
const conn= require('../db/dbConnection')
const util = require("util"); // helper
const roles = {

    student:"3",
}

Object.freeze(roles)//3shan amn3 en 7d y3del 3leha


const auth =(roles = [])=>{
    return async (req, res, next) => {
        try {
            const { authorization} = req.headers;
            if (!authorization?.startsWith(process.env.BEARER_KEY)) {
                return res.json({ message: "In-valid bearer key" })
            }
            const token = authorization.split(process.env.BEARER_KEY)[1]
            if (!token) {
                return res.json({ message: "In-valid token" })
            }
            const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
            if (!decoded?.id) {
                return res.json({ message: "In-valid token payload" })
            }
            
            const query = util.promisify(conn.query).bind(conn); //transform query mysql to promise to use await &a sync
                const authUser = await query("select * from users where id =?",[decoded.id]);
            // const authUser = await userModel.findById(decoded.id).select('userName email role')
            if (!authUser) {
                return res.json({ message: "Not register account" })
            }

            if (!roles.includes(authUser[0].role)){
                console.log('====================================');
                console.log(authUser[0].role);
                console.log( !roles.includes(authUser.role));
                console.log('====================================');
                return res.json({ message: "u re not authorized" })

            }
            delete authUser[0].password;
            req.user = authUser[0];
            return next()
            } catch (error) {
                return res.json({ message: "Catch error" , err:error?.message })
            }
    }
}

module.exports = {auth, roles}