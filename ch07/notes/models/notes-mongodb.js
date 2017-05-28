'use strict';

const util = require('util');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const log = require('debug')('notes:mongodb-model');
const error = require('debug')('notes:error');
const Note = require('./Note');

var db;

exports.connectDB = function(){
 return new Promise((resolve, reject) => {
  if(db) return resolve(db);
  //connection URL
  var url = process.env.MONGO_URL;
  MongoClient.connect(url, (err, _db) => {
   if(err) return reject(err);
   db = _db;
   resolve(_db);
  });
 });
};

exports.create = function(key, title, body){
 return exports.connectDB()
 .then(db => {
  var note = new Note(key, title, body);
  var collection = db.collection('notes');
  return collection.insertOne({
   notekey: key, title: title, body: body
  }).then(result => { return note; });
 });
};

exports.update = function(key, title, body){
 return exports.connectDB()
 .then(db => {
  var note = new Note(key, title, body);
  var collection = db.collection('notes');
  return collection.updateOne({notekey: key}, { $set: {title: title, body: body}}).then(result => {return note;});
 })
};

exports.read = function(key){
 return exports.connectDB()
 .then(db => {
  var collection = db.collection('notes');
  return collection.findOne({notekey: key})
  .then(doc => {
   var note = new Note(doc.notekey, doc.title, doc.body);
   return note;
  });
 });
};

exports.destroy = function(key){
 return exports.connectDB()
 .then(db => {
  var collection = db.collection('notes');
  return collection.findOneAndDelete({ notekey: key });
 });
};

exports.keylist = function() {
 return exports.connectDB()
 .then(db => {
  var collection = db.collection('notes');
  return new Promise((resolve, reject) => {
   var keyz = [];
   collection.find({}).forEach(
    note => {keyz.push(note.notekey);},
    err => {
     if(err) reject(err);
     else{ log('Array: ' + util.inspect(keyz));resolve(keyz);};
    }
   );
  });
 });
};

exports.count = function(){
 return exports.connectDB()
 .then(db => {
  var collection = db.collection('notes');
  return new Promise((resolve, reject) => {
   collection.count({}, (err,count) => {
    if (err) reject(err);
    else resolve(count);
   });
  });
 });
};
