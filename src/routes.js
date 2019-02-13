import { Router } from 'express';
import logger from './log'
import pay from './pay'

const routes = Router();





/**
 * GET home page
 */
routes.get('/', (req, res) => {
  console.log('logs')
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
routes.get('/pay', async(req, res, next) => {
  const { to } = req.query;
  if (to == null || to === '') {
    // You probably want to set the response HTTP status to 400 Bad Request
    // or 422 Unprocessable Entity instead of the default 500 of
    // the global error handler (e.g check out https://github.com/kbariotis/throw.js).
    // This is just for demo purposes.
    next(new Error('The "to" parameter is required'));
    return;
  }
  
  var address='E15354735686C6915BA6C16A42004CAC9E1F7012';
  var amount =1000;
  var resultdata1 = await pay.paydata(address,to,amount);

  console.log('resultdata1',resultdata1)

  // res.json({});
  var resultdata = await pay.Wallettransfer(resultdata1)
  res.json(resultdata.data.result);

  // resultdata.then(function(data){
  //   console.log('okdata',data.data.result)
  //   res.json(data.data.result);

  // })
  // .catch(function(err){
  //   console.log('errdata',err)
  //   res.json(err);
  // })
  
  

  

  
});

export default routes;
