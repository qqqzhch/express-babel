import StellarHDWallet from 'stellar-hd-wallet'

import fs from 'fs';
var ethUtil = require('ethereumjs-util');

const createKeccakHash = require('keccak');


var v3file=require('./v3file.js')



//js:653:30)
//localhost:express-babel webjs$ npx babel-node  wallet.js 

//================
const mnemonic = StellarHDWallet.generateMnemonic()
console.log(mnemonic);

const wallet = StellarHDWallet.fromMnemonic(mnemonic)
var  p = wallet.getPublicKey(0)
var  s = wallet.getSecret(0)
var  k = wallet.getKeypair(0)

console.log('pub:'+p)
console.log('pri:'+s)
console.log(k);

var d = wallet.derive(`m/44'/148'/0'`);
// fs.writeFileSync('./message.txt',JSON.stringify(d));

// var  Address = ethUtil.publicToAddress(p)
// console.log(Address)
// var  pubKey = ethUtil.toBuffer(p)
// var dist =createKeccakHash('keccak256').update(p).digest()
// console.log('dist',dist)
// var bits = dist.slice(-20);
// //buff.toString('hex')
// var address =bits.toString('hex');



console.log('ssss',s.toString('hex'))
console.log('sss',s)
var myv3file=new v3file(new Buffer(s));
var filejson =myv3file.toV3('qq123456');
// console.log('address',myv3file.getAddress())
// console.log(filejson);
var myv3file=new v3file();
console.log('--------------')
console.log(JSON.stringify(filejson))
console.log('--------------')
var  myv3file= v3file.fromV3(JSON.stringify(filejson),'qq123456')
console.log(' ****')
// myv3file._privKey.length==s.length
console.log(myv3file._privKey.length)
console.log(s.length)
console.log(myv3file._privKey.toString('hex'))
console.log(new Buffer(s).toString('hex'))
//==========


// var seedhex =createKeccakHash('keccak256')
// .update('SAGLEMGJOG6A2LP3LPRF7AB7SQPMIPXMAMICKJYZMEXW3XRK3N6U7LBP')
// .digest();      
// console.log(seedhex,seedhex.length)

// var myv3file=new v3file('SAGLEMGJOG6A2LP3LPRF7AB7SQPMIPXMAMICKJYZMEXW3XRK3N6U7LBP');
// console.log('-----')
// console.log('pubKey',myv3file.pubKey);
// console.log('getAddress',myv3file.getAddress());
// console.log('-----')



//========


// var address = createKeccakHash(dist).toString('hex')
// console.log('dist slice',address)

// var address = createKeccakHash('keccak256').update(p).digest('hex');


// var address = createKeccakHash('keccak256').update('nnnb').digest('hex');

// console.log('address');
// console.log(md5Hex(address));
// console.log('address');
// // var  Address = ethUtil.keccak(p).slice(-20);
// var  Address = ethUtil.keccak(p);
// console.log('===');
// console.log(md5Hex(Address),md5Hex(Address).length);
// console.log('===');

//1 生成公钥和私私钥
//2 生成助记


//==需要寻找 1 生成keystore
//========= 2 钱包信息存储到文件里面
//========= 3 交易签名


///=========================================
/**
 * Returns the ethereum address of a given public key.
 * Accepts "Ethereum public keys" and SEC1 encoded keys.
 * @param {Buffer} pubKey The two points of an uncompressed key, unless sanitize is enabled
 * @param {Boolean} [sanitize=false] Accept public keys in other formats
 * @return {Buffer}
 */
// exports.pubToAddress = exports.publicToAddress = function (pubKey, sanitize) {
//     pubKey = exports.toBuffer(pubKey)
//     if (sanitize && (pubKey.length !== 64)) {
//       pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1)
//     }
//     assert(pubKey.length === 64)
//     // Only take the lower 160bits of the hash
//     return exports.keccak(pubKey).slice(-20)
//   }

// test('README example 3', function (t) {
//     var mnemonic = 'basket actual'
//     var seed = bip39.mnemonicToSeed(mnemonic)
//     var seedHex = bip39.mnemonicToSeedHex(mnemonic)
  
//     t.plan(3)
//     t.equal(seed.toString('hex'), seedHex)
//     t.equal(seedHex, '5cf2d4a8b0355e90295bdfc565a022a409af063d5365bb57bf74d9528f494bfa4400f53d8349b80fdae44082d7f9541e1dba2b003bcfec9d0d53781ca676651f')
//     t.equal(bip39.validateMnemonic(mnemonic), false)
//   })





// burden tennis amount urge apart share dutch orange camp soul tissue typical fade lyrics elephant rural slam furnace defy news trip fix hope used
// pub:GABF3DT6VQZP3BCOXWHKZPKV4LSICD7VC7QMD2UDGAJ4D6BS6YZXAP2P
// pri:SC47DJ2IJHXJKT3UZXYXH7MKS5N74IG2CJNF5KA66INZL5XSDOOSIEPZ

// address 8804d2265dd9f6cffdb7d267f23e488f7a617c37


// { version: 3,
//     id: '9697c884-7ddd-4f15-9814-256e78bd8cb0',
//     address: '8804d2265dd9f6cffdb7d267f23e488f7a617c37',
//     crypto: 
//      { ciphertext: '5dc28d32fc744b771ed9002ad924bd0f154532f7cb3572b5e0322d21b57e51df2d4a7d5c3f2bb80aa106eb758aa9c4e85a69e9d42b4887d5',
//        cipherparams: { iv: 'bbf142f6c023ce92b932987299556ed6' },
//        cipher: 'aes-128-ctr',
//        kdf: 'scrypt',
//        kdfparams: 
//         { dklen: 32,
//           salt: '24bded8792188fd5ffaef30bba442245c645ab9a321607793b169426d6dba589',
//           n: 262144,
//           r: 8,
//           p: 1 },
//        mac: '1b615df14f3dbb58c1e4cc0c4d5989ef62a86a84d1f2fca4de62830a9b671dbf' } }
//============
// {
//     "address": "BB3DA8AF82C5AB6C6CC01DF773DFE6F3291DCD71",
//     "pub_key": {
//       "type": "tendermint/PubKeyEd25519",
//       "value": "uuRsGtr6FrWjbJh4ApDPLuotblNetW6kRt8bkbA2BeA="
//     },
//     "last_height": "0",
//     "last_round": "0",
//     "last_step": 0,
//     "priv_key": {
//       "type": "tendermint/PrivKeyEd25519",
//       "value": "Bp0QHnA10qEfHUh9YbMxpZZTDCMWI54FPenaIygh/ve65Gwa2voWtaNsmHgCkM8u6i1uU161bqRG3xuRsDYF4A=="
//     }
//   }
