const eipc = require('electron-better-ipc');
const axios =require('axios');
var protobuf = require("protobufjs");
const path = require('path');
const { shell } = require('electron');
var fs = require('graceful-fs')
const settings = require('electron-settings');
var log = require('electron-log');
var fs = require('graceful-fs')
var TenderKeys =require('tendermintelectronkey');
var crypto    = require("crypto");



var {DAEMON_CONFIG} =require('../config.js')
// var ETHwallet = require('./ETHv3wallet.js');
import ETHwallet from './ETHv3wallet.js'

import Amino  from 'irisnet-crypto/chains/iris/amino.js'





 function getAccountInfo(){
    //1从钱包中读取 addesss
    //2 调用接口读取
    var path= DAEMON_CONFIG.BASE_PATH+'/v3file.json'
    var v3file =fs.readFileSync(path);
    var v3file = JSON.parse(v3file);
    var address = v3file.address;
    var nodeBaseUrl = settings.get('user.node');
    // var nodeBaseUrl = 'http://192.168.1.12:13657/';
    var addressinfourl=nodeBaseUrl+'abci_query?path=%22/accounts/'+address+'%22&data=&height=&prove='
    console.log(addressinfourl)
    
    return  axios.get(addressinfourl)
    
    
    

}

var lastpayobj;
var lastpayJSON;
var lastpayArry;


function generatesha256(data){
      
    let hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest();
    
  }
  
export default function(){
  var protofilepath=path.join(__static, '/awesome.proto');
    eipc.answerRenderer('pay', async (query) => {

        try {
    
            console.log('pay支付开始')
              var result = await  getAccountInfo();
            //   console.log('accountInfo',result)
              var accountInfo =result.data.result.response.value;
              
              
              const protoRoot = await  protobuf.load(protofilepath);

              //====
              var buf=Buffer.from(accountInfo,'base64');
              var AccountMessage = protoRoot.lookupType('types.Account');
              var Message=AccountMessage.decode(buf);
              var acountjson={
                address:Message.address.toString('hex'),
                balance:parseInt(Message.balance, 10),
                nonce:parseInt(Message.nonce, 10)
              }
              console.log('acountjson',acountjson);

              //====
              var payload = { 
                from: Buffer.from(acountjson.address,'hex') ,
                to:Buffer.from(query.to,'hex') ,
                amount:query.amount ,
                gas: 1,
                createTime :  +(new Date()).getTime().toString().substr(0,10)
              };
            //   var payload = { from: acountjson.address ,to:query.to ,amount:query.amount };
              var nonce = acountjson.nonce ;
              
              log.info('payload',payload);
              var TxDataMessage = protoRoot.lookupType('types.TxData');
              var errMsg = TxDataMessage.verify(payload);
              
              if (errMsg)
                return {data:JSON.stringify(errMsg),state:false} 
                

              
              var TxData = TxDataMessage.create(payload);
              var TxDatabuffer = TxDataMessage.encode(TxData).finish();


              var TxSendMessage = protoRoot.lookupType('types.TxSend');

              var sendload={
                id:generatesha256(TxDatabuffer),  
                txData:TxData
              }
              
               errMsg = TxSendMessage.verify(sendload);
               
              if (errMsg)
                return {data:JSON.stringify(errMsg),state:false} 

              var TxSend = TxSendMessage.create(sendload);
              log.info('------------------')
              
              var TxPayloadMessage = protoRoot.lookupType('types.TxPayload');

              var TxPayload={
                txSend:TxSend,
                payload:'txSend'
              }
            //   if(nonce!=0){
                TxPayload.nonce=nonce+1;
            //   }


              log.info('TxPay2',TxPayload);
              errMsg = TxPayloadMessage.verify(TxPayload);
              log.info('errMsg',errMsg)

              if (errMsg)
                return {data:JSON.stringify(errMsg),state:false} 


             log.info('TxPay3');

              var TxPay = TxPayloadMessage.create(TxPayload);
            //   TxPay.payload = "TxSend";
              lastpayobj=TxPay;
              
              console.log('TxSend',TxSend)
            //   const buffer = TxSendMessage.encode(TxSend).finish();
              const buffer = TxPayloadMessage.encode(TxPay).finish();
              lastpayArry=buffer
              
            return {data:TxPay,state:true} ;
            
        } catch (error) {
            console.log(error)
            return {data:JSON.stringify(error),state:false} 
            
        }
        
    
          
    });

    eipc.answerRenderer('Wallettransfer',async(query)=>{
      console.log('Wallettransfer')
      try {
        var password = query.password;
        var txdata =query.txdata;

      //====
      var path= DAEMON_CONFIG.BASE_PATH+'/v3file.json'
      var v3file =fs.readFileSync(path,'utf8');
      console.log('v3file',v3file)
      console.log(ETHwallet)
      var wallet = ETHwallet.fromV3(v3file,password);
      var tenderKeys = new TenderKeys();
      
      
      const protoRoot = await  protobuf.load(protofilepath);
      var TxMessage = protoRoot.lookupType('types.Tx');
      // console.log('wallet._privKey',wallet._privKey.toString('hex'))
      // console.log('wallet.pubKey',wallet.pubKey)
      // console.log('lastpayobj',txdata ,typeof txdata)
      // console.log('lastpayArry',lastpayArry)
      // console.log('lastpayArry',lastpayArry.toString('hex'))

    //   var sindata = tenderKeys.sign(wallet._privKey.toString('hex'),JSON.stringify(txdata));//   lastpayobj
    //   var sindata = tenderKeys.sign(wallet._privKey.toString('hex'),JSON.stringify(txdata));//   lastpayobj
      var sindata = tenderKeys.signBuffer(wallet._privKey.toString('hex'),lastpayArry);//   lastpayobj


      // var helloword = tenderKeys.sign(wallet._privKey.toString('hex'),lastpayArry.toJSON().data);//   lastpayobj
      // console.log('helloword',helloword.toString('hex'))
      
      Amino.RegisterConcrete(null,'tendermint/PubKeyEd25519')
      
      // console.log('wallet.publicKey',wallet.pubKey)
      // console.log('wallet.publicKey',Buffer.from(wallet.pubKey,'hex'))
    //   console.log('wallet.publicKey',Amino.MarshalBinary('tendermint/PubKeyEd25519',  Buffer.from(wallet.pubKey,'hex')))

      // console.log('sindata',sindata)
      // console.log('sindata',sindata.toString('hex'))
    //   console.log('signature',Amino.MarshalBinary('tendermint/SignatureEd25519',  sindata))
      var TxMessageload={
          key: Amino.MarshalBinary('tendermint/PubKeyEd25519',  Buffer.from(wallet.pubKey,'hex')) ,
        //   signature:Amino.MarshalBinary('tendermint/SignatureEd25519',  sindata),
          signature:sindata,
          payload:lastpayobj
      }
      

      var errMsg = TxMessage.verify(TxMessageload);



      if (errMsg){
          res.json({
              data:errMsg
          })
      }
      var TxMessageData = TxMessage.create(TxMessageload);
      //https://github.com/irisnet/irisnet-crypto/search?q=pubKey&unscoped_q=pubKey
      console.log('TxMessageData',TxMessageData)
          
      
      //http://18.136.176.184:13657/  
      //
      // var nodeBaseUrl = 'http://192.168.1.12:13657/';
      // var nodeBaseUrl = 'http://18.136.176.184:13657/';
      var nodeBaseUrl = settings.get('user.node');
      var txinfourl=nodeBaseUrl+'broadcast_tx_commit';

      // console.log('toObject')
      // //兑取组合的数据类型 
      // var jsondata = JSON.stringify(TxMessage.toObject(TxMessageData))
      // console.log('toObject',jsondata)

      var TxMessagebuffer = TxMessage.encode(TxMessageData).finish();
      console.log('TxMessagebuffer',TxMessagebuffer);

      console.log('---')
      console.log(TxMessagebuffer);
      var yy = TxMessagebuffer.toJSON();
      console.log(JSON.stringify(yy.data));
      
      
      
      var  result = await axios.get(txinfourl, {
            params: {
              tx:JSON.stringify(yy.data)
            }
      });
      // console.log(result)
      
      return {data:result,state:true} 
        
      } catch (error) {
        console.log(error)
            return {data:JSON.stringify(error),state:false} 
        
      }
      
      

      //====

    })
}


/* 
app.post('/Wallettransfer',async function(req,res){
  console.log('req.body',req.body);
  

  var password = req.body.password;
  var transferdata=req.body.txdata;
  
  var path= DAEMON_CONFIG.BASE_PATH+'/v3file.json'
      var v3file =fs.readFileSync(path,'utf8');
      console.log('v3file',v3file)
      var wallet = ETHwallet.fromV3(v3file,password);
      var tenderKeys = new TenderKeys();
      console.log('protofilepath')
      var protofilepath=path.join(__static, '/awesome.proto');
      console.log('protofilepath',protofilepath)
      const protoRoot = await  protobuf.load(protofilepath);
      var TxMessage = protoRoot.lookupType('types.Tx');
      var sindata = tenderKeys.sign(wallet._privKey,transferdata);
      var TxMessageload={
          key:wallet.publicKey,
          signature:sindata,
          payload:transferdata
      }
      var errMsg = TxDataMessage.verify(TxMessageload);
      if (errMsg){
          res.json({
              data:errMsg
          })
      }
      var TxMessageData = TxDataMessage.create(TxMessageload);
          
      

      var nodeBaseUrl = 'http://18.136.176.184:13657/';
      var txinfourl=nodeBaseUrl+'broadcast_tx_commit';
      axios.get(txinfourl, {
          tx:TxMessageData
      })
      .then(function(data){
          console.log('回掉',data.data)
          res.json({
              data:data.data
          })

      })
      .catch((err)=>{
          res.json({
              data:err
          })
      })

      
      
      
        

})
*/