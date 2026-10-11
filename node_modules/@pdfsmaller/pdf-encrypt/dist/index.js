const { encryptPDF, AlreadyEncryptedError, PasswordEncodingError } = require('./pdf-encrypt.js');
const { encodePasswordLegacy, encodePasswordAES256, saslPrep } = require('./password-encoding.js');
const { md5, RC4, hexToBytes, bytesToHex } = require('./crypto-rc4.js');
const { sha256, sha384, sha512, aes256CbcEncrypt, aes256CbcEncryptNoPad, aes256EcbEncryptBlock, computeHash2B, concat } = require('./crypto-aes.js');

module.exports = { encryptPDF, AlreadyEncryptedError, PasswordEncodingError, encodePasswordLegacy, encodePasswordAES256, saslPrep, md5, RC4, hexToBytes, bytesToHex, sha256, sha384, sha512, aes256CbcEncrypt, aes256CbcEncryptNoPad, aes256EcbEncryptBlock, computeHash2B, concat };
