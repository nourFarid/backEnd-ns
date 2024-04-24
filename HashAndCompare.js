const bcrypt = require('bcryptjs')
 const hash = ( plaintext, salt = process.env.SALT_ROUND ) => {
    const hashResult = bcrypt.hashSync(plaintext, parseInt(salt))
    return hashResult
}


 const compare = ( plaintext, hashValue ) => {
    const match = bcrypt.compareSync(plaintext, hashValue)
    return match
}

module.exports ={hash , compare}
