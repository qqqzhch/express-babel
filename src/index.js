// import app from './app';

// const { PORT = 8080 } = process.env;
// app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // eslint-disable-line no-console

import logger from './log'

import fetch from 'cross-fetch';
var md5 = require('md5');

import endata from './data/cn';
import fs from 'fs';


async function demo(){
    // var  result= await translate('苹果','cht')
    // console.log(result)
    var tolang ='en';
    for(var key in endata){    
        for(var key2 in endata[key]){    
           if(endata[key][key2]  instanceof Object){
            for(var key3 in endata[key][key2]){
              var  result= await translate(endata[key][key2][key3],tolang); //'cht'  'zh'
              if(result){
                endata[key][key2][key3]=result;
              }
              console.log(endata[key][key2]);

            }


           }else{
            var  result= await translate(endata[key][key2],tolang); //'cht'  'zh'
            if(result){
                endata[key][key2]=result;
            }
            console.log(endata[key]);

           }
            
            
        
        }   
    }
    fs.writeFileSync('dist.json',JSON.stringify(endata, null, 4));  
    
}
demo()

 

  async function translate(query,to){
    var appid = '20181015000219404';
    var key = 'M_RgFuOPd3EdNbTxHeYZ';
    var salt = (new Date).getTime();
    // var query = 'apple';
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'zh'; //'en'
    // var to = 'zh';
    var str1 = appid + query + salt + key;
    console.log('str1',str1)
    var sign = md5(str1);
    console.log('sign',sign)
    if(query=='苹果'){
        console.log(1)
    }



    try {
     var url=`http://api.fanyi.baidu.com/api/trans/vip/translate?from=${from}&to=${to}&q=${encodeURI(query)}&appid=${appid}&salt=${salt}&sign=${sign}`;
     console.log(url);
      const res = await fetch(url);
      
      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
      
      const user = await res.json();
      console.log(user);
      if(user.error_code!=undefined){
          return false
      }else{
          return user.trans_result[0].dst;
      }
    //   logger.info(user.trans_result);
     
    } catch (err) {
      console.error(err);
    }
  };





//   $.ajax({
//       url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
//       type: 'get',
//       dataType: 'jsonp',
//       data: {
//           q: query,
//           appid: appid,
//           salt: salt,
//           from: from,
//           to: to,
//           sign: sign
//       },
//       success: function (data) {
//           console.log(data);
//       } 
//   });


