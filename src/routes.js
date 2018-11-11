import { Router } from 'express';
import logger from './log'

const walk = require('ignore-walk');
var readSync = require('read-file-relative').readSync;

const routes = Router();





/**
 * GET home page
 */
routes.get('/', (req, res) => {
  console.log('logs')
  
  console.log(result)
  
  logger.info('Hello again distributed logs');
  res.render('index', { title: 'Express Babel' });



});


/**
 * GET /list
 *
 * This is a sample route demonstrating
 * a simple approach to error handling and testing
 * the global error handler. You most certainly want to
 * create different/better error handlers depending on
 * your use case.
 */
routes.get('/list', (req, res, next) => {
  const result = walk.sync({ path: './data' });

console.log(result);
var jsonlist=[]
result.forEach(function(value,index){
    console.log(value,index)
    if(value != '.DS_Store'){
    var result = readSync("../data/"+value);
    var list = result.split('\n');
    var obj={};
    list.forEach(function(item){
        var keyvalue = item.split(':');
        
        obj[keyvalue[0]]='';
        
    })
    obj.countName=value;
    jsonlist.push(obj);
  }

    
})
  res.json(jsonlist)
});


routes.get('/list2', (req, res, next) => {
  const result = walk.sync({ path: './data2' });

console.log(result);
var jsonlist=[]
result.forEach(function(value,index){
    console.log(value,index)
    if(value != '.DS_Store'){
    var result = readSync("../data2/"+value);
    var list = result.split('\n');
    var obj={};
    list.forEach(function(item){
        var keyvalue = item.split(':');
        
        obj[keyvalue[0]]='';
        
    })
    obj.countName=value;
    jsonlist.push(obj);
  }

    
})
  res.json(jsonlist)
});



routes.get('/paylist', (req, res, next) => {
  const result = walk.sync({ path: './pradata' });

console.log(result);
var jsonlist=[]
    result.forEach(function(value,index){
        console.log(value,index)
        if(value != '.DS_Store'){
          
        
        var result = readSync("../pradata/"+value);
        var list = result.split('\n');
        var obj={};
        list.forEach(function(item){
            var keyvalue = item.split(':');
            
            obj[keyvalue[0]]=keyvalue[1];
            
        })
        obj.countName=value;
        jsonlist.push(obj);
      }

        
    })
  res.json(jsonlist)
});

export default routes;
