var randomBytes = require('randombytes');
var crypto = require('crypto');
var Buffer = require('safe-buffer').Buffer;
var scryptsy = require('scrypt.js');
var ethUtil = require('ethereumjs-util');
var uuidv4 = require('uuid/v4');



const createKeccakHash = require('keccak');





var Wallet = function (priv, pub) {
    // 为啥呢？
    if (priv && pub) {
      throw new Error('Cannot supply both a private and a public key to the constructor')
    }
  
    
  
    this._privKey = priv
    this._pubKey = pub
  }

  function runCipherBuffer (cipher, data) {
    return Buffer.concat([ cipher.update(data), cipher.final() ])
  }


  Object.defineProperty(Wallet.prototype, 'pubKey', {
    get: function () {
    //   if (!this._pubKey) {
    //       var dist =createKeccakHash('keccak256').update(this._privKey).digest()
    //         console.log('dist',dist)
    //         var bits = dist.slice(-32);
    //         //buff.toString('hex')
    //         var pubKey =bits.toString('hex');
        
        
    //     this._pubKey = pubKey
    //   }
      return this._pubKey
    }
  })
  

  Wallet.prototype.getAddress = function () {
      // var  pubKey = ethUtil.toBuffer(p)
      return ''
        var dist =createKeccakHash('keccak256').update(this.pubKey).digest();
        console.log('dist',dist);
        var bits = dist.slice(-20);
        //buff.toString('hex')
        var address =bits.toString('hex');
        return address;
  }

  // https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
Wallet.prototype.toV3 = function (password, opts) {
    // assert(this._privKey, 'This is a public key only wallet')
  
    opts = opts || {}
    var salt = opts.salt || randomBytes(32)
    var iv = opts.iv || randomBytes(16)
  
    var derivedKey
    var kdf = opts.kdf || 'scrypt'
    var kdfparams = {
      dklen: opts.dklen || 32,
      salt: salt.toString('hex')
    }
  
    if (kdf === 'pbkdf2') {
      kdfparams.c = opts.c || 262144
      kdfparams.prf = 'hmac-sha256'
      derivedKey = crypto.pbkdf2Sync(Buffer.from(password), salt, kdfparams.c, kdfparams.dklen, 'sha256')
    } else if (kdf === 'scrypt') {
      // FIXME: support progress reporting callback
      kdfparams.n = opts.n || 262144
      kdfparams.r = opts.r || 8
      kdfparams.p = opts.p || 1
      derivedKey = scryptsy(Buffer.from(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
    } else {
      throw new Error('Unsupported kdf')
    }
    console.log('-----')
    console.log(opts.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv)



    console.log('-----')
  
    var cipher = crypto.createCipheriv(opts.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv)
    
    if (!cipher) {
      throw new Error('Unsupported cipher')
    }
  
    var ciphertext = runCipherBuffer(cipher, this._privKey)
    console.log('-----2')
    var mac = ethUtil.keccak256(Buffer.concat([ derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex') ]))
  
    return {
      version: 3,
      id: uuidv4({ random: opts.uuid || randomBytes(16) }),
      address: this.getAddress().toString('hex'),
      crypto: {
        ciphertext: ciphertext.toString('hex'),
        cipherparams: {
          iv: iv.toString('hex')
        },
        cipher: opts.cipher || 'aes-128-ctr',
        kdf: kdf,
        kdfparams: kdfparams,
        mac: mac.toString('hex')
      }
    }
  }
  
  Wallet.prototype.getV3Filename = function (timestamp) {
    /*
     * We want a timestamp like 2016-03-15T17-11-33.007598288Z. Date formatting
     * is a pain in Javascript, everbody knows that. We could use moment.js,
     * but decide to do it manually in order to save space.
     *
     * toJSON() returns a pretty close version, so let's use it. It is not UTC though,
     * but does it really matter?
     *
     * Alternative manual way with padding and Date fields: http://stackoverflow.com/a/7244288/4964819
     *
     */
    var ts = timestamp ? new Date(timestamp) : new Date()
  
    return [
      'UTC--',
      ts.toJSON().replace(/:/g, '-'),
      '--',
      this.getAddress().toString('hex')
    ].join('')
  }
  
  Wallet.prototype.toV3String = function (password, opts) {
    return JSON.stringify(this.toV3(password, opts))
  }


  Wallet.fromPrivateKey = function (priv) {
    return new Wallet(priv)
  }


  Wallet.fromV3 = function (input, password, nonStrict) {
    
    var json = (typeof input === 'object') ? input : JSON.parse(nonStrict ? input.toLowerCase() : input)
  
    if (json.version !== 3) {
      throw new Error('Not a V3 wallet')
    }
  
    var derivedKey
    var kdfparams
    if (json.crypto.kdf === 'scrypt') {
      kdfparams = json.crypto.kdfparams
  
      // FIXME: support progress reporting callback
      derivedKey = scryptsy(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
    } else if (json.crypto.kdf === 'pbkdf2') {
      kdfparams = json.crypto.kdfparams
  
      if (kdfparams.prf !== 'hmac-sha256') {
        throw new Error('Unsupported parameters to PBKDF2')
      }
  
      derivedKey = crypto.pbkdf2Sync(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256')
    } else {
      throw new Error('Unsupported key derivation scheme')
    }
  
    var ciphertext = Buffer.from(json.crypto.ciphertext, 'hex')
  
    var mac = ethUtil.keccak256(Buffer.concat([ derivedKey.slice(16, 32), ciphertext ]))
    if (mac.toString('hex') !== json.crypto.mac) {
      throw new Error('Key derivation failed - possibly wrong passphrase')
    }
  
    var decipher = crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(json.crypto.cipherparams.iv, 'hex'))
    var seed = runCipherBuffer(decipher, ciphertext)
  
    return new Wallet(seed)
  }
  

  module.exports = Wallet