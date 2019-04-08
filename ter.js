let crypto = require('tendermint-crypto')
 
// generate a keypair


let priv = crypto.PrivKeyEd25519()
console.log(priv)
