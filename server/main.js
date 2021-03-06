/*

Copyright (c) 2019 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.

*/

import '../imports/ui/body.js';
import '../imports/api/tasks.js';
import { Meteor } from 'meteor/meteor';
import { Tasks } from "../imports/api/tasks";

Meteor.startup(() => {
});


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:3001/";

const jsxapi = require('jsxapi')

//ENTER THE DEVICE IP ADDRESS HERE
const ipAddress = "ssh://10.105.16.57"
const xapi = jsxapi.connect(ipAddress, {
  username: 'integrator',
  password: 'integrator'
})

//For logging information
'use strict';
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()]
});


logger.info("Attempting to Establish Connection to Endpoint")

xapi.on('error', (err) => {
  logger.error(`connection failed: ${err}, exiting`);
  process.exit(1);
})

var roomName;
// Retrieve and display the Endpoint Name
xapi.status
    .get('UserInterface')
    .then((contactinfo) => {
        logger.info(`Established Connection to Endpoint : ${contactinfo.ContactInfo.Name}`);
        roomName=contactinfo.ContactInfo.Name;
        logger.info("*** READY FOR INPUT FROM PANEL ***")
    });


//Calling the Concierge
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'callConcie'){

      logger.info("Called the Concierge")

      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            //update the state of the record if already existing order
            var newvalues
            if(result.pollState=="Running")
              newvalues = { $set: {pollState: "Inactive"} };
              else{
                newvalues = { $set: {pollState: "Running"} };
              }
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          else{
              //create a new order with only concierge
              if (err) throw err;
              var dbo = db.db("meteor");
              var myobj = { roomName: roomName, pollState : "Inactive" };
              dbo.collection("polls").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });

   }
   else{
     return;
   }
})

//add a MASALA CHAI
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'masala_chai_incr'){
      logger.info("Increasing Masala Chai Count");
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            if(result.masalaChai!=null){
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'masala_chai_text',
                Value: result.masalaChai+1
              })
            }
            else{
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'masala_chai_text',
                Value: 1
              })
            }
            //update the state of the record if already existing order
            var newvalues = { $inc: {masalaChai: 1} };
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          else{
              //create a new order
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'masala_chai_text',
                Value: 1
              })
              if (err) throw err;
              var dbo = db.db("meteor");
              var myobj = { roomName: roomName, pollState: "Running", masalaChai: 1};
              dbo.collection("polls").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });
   }
})



//add a TEA
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'tea_incr'){
      logger.info("Increasing Tea Count");
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            if(result.tea!=null){
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'tea_text',
                Value: result.tea+1
              })
            }
            else{
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'tea_text',
                Value: 1
              })
            }
            //update the state of the record if already existing order
            var newvalues = { $inc: {tea: 1} };
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          else{
              //create a new order
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'tea_text',
                Value: 1
              })
              if (err) throw err;
              var dbo = db.db("meteor");
              var myobj = { roomName: roomName, pollState: "Running", tea: 1};
              dbo.collection("polls").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });
   }
})


//add a GREEN TEA
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'green_tea_incr'){
     logger.info("Increasing Green Tea Count");
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            if(result.greenTea!=null){
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'green_tea_text',
                Value: result.greenTea+1
              })
            }
            else{
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'green_tea_text',
                Value: 1
              })
            }
            //update the state of the record if already existing order
            var newvalues = { $inc: {greenTea: 1} };
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          else{
              //create a new order
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'green_tea_text',
                Value: 1
              })
              if (err) throw err;
              var dbo = db.db("meteor");
              var myobj = { roomName: roomName, pollState: "Running", greenTea: 1};
              dbo.collection("polls").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });
   }
})



//add a cafe Latte
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'latte_incr'){
     logger.info("Increasing cafe Latte Count");
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            if(result.cafeLatte!=null){
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'latte_text',
                Value: result.cafeLatte+1
              })
            }
            else{
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'latte_text',
                Value: 1
              })
            }
            //update the state of the record if already existing order
            var newvalues = { $inc: {cafeLatte: 1} };
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          else{
              //create a new order
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'latte_text',
                Value: 1
              })
              if (err) throw err;
              var dbo = db.db("meteor");
              var myobj = { roomName: roomName, pollState: "Running", cafeLatte: 1};
              dbo.collection("polls").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });
   }
})



//add a Cappucino
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'capuccino_incr'){
     logger.info("Increasing Cappuccino Count");
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            if(result.cappuccino!=null){
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'cappucino_text',
                Value: result.cappuccino+1
              })
            }
            else{
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'cappucino_text',
                Value: 1
              })
            }
            //update the state of the record if already existing order
            var newvalues = { $inc: {cappuccino: 1} };
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          else{
              //create a new order
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'cappucino_text',
                Value: 1
              })
              if (err) throw err;
              var dbo = db.db("meteor");
              var myobj = { roomName: roomName, pollState: "Running", cappuccino: 1};
              dbo.collection("polls").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });
   }
})


//add a Espresso
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'espresso_incr'){
     logger.info("Increasing Espresso Count");
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null){
            if(result.espresso!=null){
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'espresso_text',
                Value: result.espresso+1
              })
            }
            else{
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'espresso_text',
                Value: 1
              })
            }
            //update the state of the record if already existing order
            var newvalues = { $inc: {espresso: 1} };
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          else{
              //create a new order
              xapi.command('UserInterface Extensions Widget SetValue', {
                WidgetId: 'espresso_text',
                Value: 1
              })
              if (err) throw err;
              var dbo = db.db("meteor");
              var myobj = { roomName: roomName, pollState: "Running", espresso: 1};
              dbo.collection("polls").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });
   }
})


//minus a particular item
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'masala_chai_decr'){
      logger.info("Decreasing Masala Chai");
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
          if (err) throw err;
          if(result!=null&&result.masalaChai!=0 && result.masalaChai!=null ){
            //update the state of the record if already existing order
            xapi.command('UserInterface Extensions Widget SetValue', {
              WidgetId: 'masala_chai_text',
              Value: result.masalaChai-1
            })
            var newvalues = { $inc: {masalaChai: -1} };
            var myquery = { roomName: roomName };
            var dbp = db.db("meteor");
            dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                db.close();
              });
          }
          db.close();
        });
      });
   }
   else if(event.WidgetId == 'tea_decr'){
         logger.info("Decreasing Tea Count");
         MongoClient.connect(url, function(err, db) {
           if (err) throw err;
           var dbo = db.db("meteor");
           dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
             if (err) throw err;
             if(result!=null&&result.tea!=0&& result.tea!=null ){
               xapi.command('UserInterface Extensions Widget SetValue', {
                 WidgetId: 'tea_text',
                 Value: result.tea-1
               })
               //update the state of the record if already existing order
               var newvalues = { $inc: {tea: -1} };
               var myquery = { roomName: roomName };
               var dbp = db.db("meteor");
               dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                   if (err) throw err;
                   db.close();
                 });
             }
             db.close();
           });
         });
      }
      else if(event.WidgetId == 'green_tea_decr'){
            logger.info("Decreasing Green Tea Count");
            MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db("meteor");
              dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
                if (err) throw err;
                if(result!=null&&result.greenTea!=0&& result.greenTea!=null ){
                  xapi.command('UserInterface Extensions Widget SetValue', {
                    WidgetId: 'green_tea_text',
                    Value: result.greenTea-1
                  })
                  //update the state of the record if already existing order
                  var newvalues = { $inc: {greenTea: -1} };
                  var myquery = { roomName: roomName };
                  var dbp = db.db("meteor");
                  dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                      if (err) throw err;
                      db.close();
                    });
                }
                db.close();
              });
            });
         }
         else if(event.WidgetId == 'latte_decr'){
               logger.info("Decreasing Cafe Latte Count");
               MongoClient.connect(url, function(err, db) {
                 if (err) throw err;
                 var dbo = db.db("meteor");
                 dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
                   if (err) throw err;
                   if(result!=null&&result.cafeLatte!=0&& result.cafeLatte!=null ){
                     xapi.command('UserInterface Extensions Widget SetValue', {
                       WidgetId: 'latte_text',
                       Value: result.cafeLatte-1
                     })
                     //update the state of the record if already existing order
                     var newvalues = { $inc: {cafeLatte: -1} };
                     var myquery = { roomName: roomName };
                     var dbp = db.db("meteor");
                     dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                         if (err) throw err;
                         db.close();
                       });
                   }
                   db.close();
                 });
               });
            }
            else if(event.WidgetId == 'cappucino_decr'){
                  logger.info("Decreasing Cappuccino Count");
                  MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("meteor");
                    dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
                      if (err) throw err;
                      if(result!=null&&result.cappuccino!=0&& result.cappuccino!=null ){
                        xapi.command('UserInterface Extensions Widget SetValue', {
                          WidgetId: 'cappucino_text',
                          Value: result.cappuccino-1
                        })
                        //update the state of the record if already existing order
                        var newvalues = { $inc: {cappuccino: -1} };
                        var myquery = { roomName: roomName };
                        var dbp = db.db("meteor");
                        dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                            if (err) throw err;
                            db.close();
                          });
                      }
                      db.close();
                    });
                  });
               }
               else if(event.WidgetId == 'espresso_decr'){
                     logger.info("Decreasing Espresso Count");
                     MongoClient.connect(url, function(err, db) {
                       if (err) throw err;
                       var dbo = db.db("meteor");
                       dbo.collection("polls").findOne({roomName: roomName}, function(err, result) {
                         if (err) throw err;
                         if(result!=null&&result.espresso!=0&& result.espresso!=null ){
                           xapi.command('UserInterface Extensions Widget SetValue', {
                             WidgetId: 'espresso_text',
                             Value: result.espresso-1
                           })
                           //update the state of the record if already existing order
                           var newvalues = { $inc: {espresso: -1} };
                           var myquery = { roomName: roomName };
                           var dbp = db.db("meteor");
                           dbp.collection("polls").updateOne(myquery, newvalues, function(err, res) {
                               if (err) throw err;
                               db.close();
                             });
                         }
                         db.close();
                       });
                     });
                  }
})

//close record
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.Type !== 'pressed') return
   if (event.WidgetId == 'delete'){

      logger.info("Delete Order");

      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        var myquery = { roomName: roomName };
        dbo.collection("polls").deleteOne(myquery, function(err, obj) {
          if (err) throw err;

          xapi.command('UserInterface Extensions Widget SetValue', {
            WidgetId: 'tea_text',
            Value: 0
          })

          xapi.command('UserInterface Extensions Widget SetValue', {
            WidgetId: 'masala_chai_text',
            Value: 0
          })

          xapi.command('UserInterface Extensions Widget SetValue', {
            WidgetId: 'green_tea_text',
            Value: 0
          })

          xapi.command('UserInterface Extensions Widget SetValue', {
            WidgetId: 'latte_text',
            Value: 0
          })

          xapi.command('UserInterface Extensions Widget SetValue', {
            WidgetId: 'cappucino_text',
            Value: 0
          })

          xapi.command('UserInterface Extensions Widget SetValue', {
            WidgetId: 'espresso_text',
            Value: 0
          })

          db.close();
        });
      });
   }
})
