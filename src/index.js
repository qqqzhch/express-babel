import app from './app';
const walk = require('ignore-walk');
var readSync = require('read-file-relative').readSync;

const { PORT = 8082 } = process.env;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // eslint-disable-line no-console



// const result = walk.sync({ path: './data' });

// console.log(result);
// var jsonlist=[]
// result.forEach(function(value,index){
//     console.log(value,index)
//     var result = readSync("../data/"+value);
//     var list = result.split('\n');
//     list.forEach(function(item){
//         var keyvalue = item.split(':');
//         var obj={};
//         obj[keyvalue[0]]=keyvalue[1];
//         jsonlist.push(obj);
//     })
    

    
// })


// console.log(jsonlist)