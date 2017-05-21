var util = require('util');
var A = "another A";
var B = "another B";
var m1 = require('./module1');
util.log('A='+A+' B='+B+' values='+util.inspect(m1.values()));
