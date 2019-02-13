
const axios =require('axios');
var protobuf = require("protobufjs");
var TenderKeys =require('tendermintelectronkey');
var crypto    = require("crypto");
import Amino  from 'irisnet-crypto/chains/iris/amino.js'

const path = require('path');
var fs = require('graceful-fs')


var protofilepath=path.join(__dirname, '/awesome.proto');

var nodeBaseUrl = 'http://18.136.176.184:13657/';


function generatesha256(data){
      
    let hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest();
    
  }

  var lastpayobj={},lastpayArry={};


export default {
    accountInfo:function(address){
        var nodeBaseUrl = 'http://18.136.176.184:13657/';
    
        var addressinfourl=nodeBaseUrl+'abci_query?path=%22/accounts/'+address+'%22&data=&height=&prove='
        console.log(addressinfourl)
    
        return  axios.get(addressinfourl)

    },
    paydata: async function(address,to,amount){
        //
              var result = await  this.accountInfo(address);
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

              //   var payload = { from: acountjson.address ,to:query.to ,amount:query.amount };
              var nonce = acountjson.nonce ;

              var payload = { 
                from: Buffer.from(acountjson.address,'hex') ,
                to:Buffer.from(to,'hex') ,
                amount:amount ,
                gas: 1,
                createTime :  +(new Date()).getTime().toString().substr(0,10)
              };

              
              
              var TxDataMessage = protoRoot.lookupType('types.TxData');
              var errMsg = TxDataMessage.verify(payload);
              
              if (errMsg)
                return false
                

              
              var TxData = TxDataMessage.create(payload);
              var TxDatabuffer = TxDataMessage.encode(TxData).finish();


              var TxSendMessage = protoRoot.lookupType('types.TxSend');

              var sendload={
                id:generatesha256(TxDatabuffer),  
                txData:TxData
              }
              
               errMsg = TxSendMessage.verify(sendload);
               
              if (errMsg)
                return false

              var TxSend = TxSendMessage.create(sendload);
              
              
              var TxPayloadMessage = protoRoot.lookupType('types.TxPayload');

              var TxPayload={
                txSend:TxSend,
                payload:'txSend'
              }
              TxPayload.nonce=nonce+1;
              errMsg = TxPayloadMessage.verify(TxPayload);
              

              if (errMsg)
                return false

              var TxPay = TxPayloadMessage.create(TxPayload);
            
              lastpayobj=TxPay;
              console.log(lastpayobj);
              
              
            
              const buffer = TxPayloadMessage.encode(TxPay).finish();
              lastpayArry=buffer
              return {
                lastpayobj,
                lastpayArry
              }


    },
    Wallettransfer:async function(  praobj ){
      var privKey='a2a648616d003f0ce7cf53af18670fe65daa83cc0acd26d3055e877552c80d644d51bf93ec89e08282da5e3cb017fdb06134385a893e2c47f60a2730e08ba245';
      var pubKey ='4d51bf93ec89e08282da5e3cb017fdb06134385a893e2c47f60a2730e08ba245';
        console.log('Wallettransfer');

      var tenderKeys = new TenderKeys();
      const protoRoot = await  protobuf.load(protofilepath);
      var TxMessage = protoRoot.lookupType('types.Tx');
      console.log('lastpayArry',lastpayArry)
      var sindata = tenderKeys.signBuffer(Buffer.from(privKey,'hex') ,praobj.lastpayArry);//   lastpayobj
      
      Amino.RegisterConcrete(null,'tendermint/PubKeyEd25519')
      var TxMessageload={
        key: Amino.MarshalBinary('tendermint/PubKeyEd25519',  Buffer.from(pubKey,'hex')) ,
        signature:sindata,
        payload:praobj.lastpayobj
      }

      var errMsg = TxMessage.verify(TxMessageload);
      if (errMsg){
          return false 
      }
      var TxMessageData = TxMessage.create(TxMessageload);
      
      var txinfourl=nodeBaseUrl+'broadcast_tx_commit';
      var TxMessagebuffer = TxMessage.encode(TxMessageData).finish();
      var TxMessagebufferJson = TxMessagebuffer.toJSON();
      var  data = await axios.get(txinfourl, {
            params: {
            tx:JSON.stringify(TxMessagebufferJson.data)
            }
        });
        
      return data;

    }
}
