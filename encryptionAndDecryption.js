const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');
dotenv.config();

// Generate a random key and IV
const key = CryptoJS.enc.Hex.parse('00112233445566778899AABBCCDDEEFF');
// 3DES key size
const iv = CryptoJS.lib.WordArray.random(8); // 3DES uses an 8-byte IV

function encryptData(data) {
  
    const encrypted = CryptoJS.TripleDES.encrypt(data, key, { iv: iv });
    return {
        encryptedData: encrypted.toString(),
        iv: iv.toString()
    };
}


// const decrypt = (encryptedData, iv) => {
//     const decipher = crypto.createDecipheriv('des-ede3-cbc', key, Buffer.from(iv, 'hex'));
//     let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
// };

module.exports={
    encryptData , 
}
