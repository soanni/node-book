'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var notes = require(process.env.NOTES_MODEL ? path.join('..', process.env.NOTES_MODEL) : '../models/notes-memory');
var util = require('util');

const log = require('debug')('notes:router-home');
const error = require('debug')('notes:error');

/* GET home page. */
router.get('/', function(req, res, next) {
 notes.keylist()
 .then(keylist => {
//  var keyPromises = [];
//  for (var key of keylist){
//   keyPromises.push(
//    notes.read(key)
//    .then(note => {
//     return { key: note.key, title: note.title };
//    })
//   );
//  }
  var keyPromises = keylist.map(key => {
   return notes.read(key).then(note => { return { key:note.key, title: note.title }; });
  });
  return Promise.all(keyPromises);
 })
 .then(notelist => {
  res.render('index', { 
      title: 'Notes', 
      notelist: notelist,
      user: req.user ? req.user : undefined,
      breadcrumbs: [
        { href: '/', text: 'Home' }
      ]
  });
 })
 .catch(err => { error(err); next(err); });  
});

module.exports = router;
