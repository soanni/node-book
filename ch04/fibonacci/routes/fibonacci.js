var express = require('express');
var router = express.Router();

var math = require('../math');
router.get('/',function(req, res, next){
 if(req.query.fibonum){
  var httpreq = require('http').request({
   host: "localhost",
   port: process.env.SERVERPORT,
   path: "/fibonacci/"+Math.floor(req.query.fibonum),
   method: 'GET'
  }, 
  httpresp => {
   httpresp.on('data', chunk => {
    var data = JSON.parse(chunk);
    res.render('fibonacci',{
     title: "Calculate Fibonacci numbers",
     fibonum: req.query.fibonum,
     fiboval: data.result
    }); 
   });
  });
  httpreq.on('error', err => { next(err); });
  httpreq.end();
 } else {
  res.render('fibonacci', {
   title: "Calculate Fibonacci numbers",
   fiboval: undefined
  });
 }
});
module.exports = router;
