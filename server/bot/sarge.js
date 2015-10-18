/** Class, contains A.I. for fully functional slack bot with conversation capabilities */

// var Sarge = require('./sargeAI');
var Slack = require('slack-client');
var cron = require('node-schedule');

var helpers = require('./helpers');
var db = require("../db/fakeDb.js");

var autoReconnect = true, // Automatically reconnect after an error response from Slack.
    autoMark = true; // Automatically mark each message as read after it is processed.

module.exports = function(token){  
  /** Connect to the slack client */
  slackToken = token || 'xoxb-12608710676-WToSXWoZrkJayDKbFRAs2JpL';
  var client = new Slack(slackToken, autoReconnect, autoMark); //instantiate client connection

  /** @type {String} State of our bot */
  var state = 'neutral'; // options: neutral, conversing
  var bot = this; 
  // yessir: ends when every user types yessir, or after 10 seconds 

  // this.conversation = {
  //   isConversing:false, // are we talkin yet?
  //   topic:'', // options: 'yessir', 'poll', 'trivia'
  //   target:'', // user_id. User being spoken to
  //   waiting: false //Bool. for response
  // } // conversation

  this.memory = {
    daily:{}, // used to save relevant information about the days 
    temp:{} //used for current conversation
  } //memory

  this.endConversation = function(){
    this.state = 'neutral';
    this.memory.temp = {}; //reset temporary memory
  };

  /** Triggers when Slackbot is loaded  */
  client.on('open', function(){
    var channel = helpers.slack.findChannelByName('general', client);

    // intro
    var response = "Hi everyone, this is Sarge. \n";
    response += "The time right now is "+new Date().getUTCMinutes()+" \n";
    response += "I'm here to help every everyone get to know everyone else!"
    channel.send(response);

    // further details
    // response = "Hi everyone, this is Sarge. \n";
    // response += "The time right now is "+new Date().getUTCMinutes()+" \n";
    // response += "I'm here to help every everyone get to know everyone else!"
    // channel.send(response);


    /** Ask question every hour  */  
    // var j = cron.scheduleJob('* * * * * *', function(){ 
    //     console.log('The answer to life, the universe, and everything!');
    // });

  }); // client.on open




  client.on('message', function(data){
    var channel = client.getChannelGroupOrDMByID(data.channel);
    var user = client.getUserByID(data.user);
    var msg = data.text;

    if(user.id!==client.self.id){ // message comes from user, not bot
      
      ////////////////////
      // TAKE COMMAND   //
      ////////////////////

      if(state==='neutral'){
        var command = helpers.parse.command(msg, client);

        if(command === 'yessir'){
          helpers.command.yessir(channel, bot);

        }else if(command === 'poll'){
          helpers.command.poll(user, channel, bot);
          

        }else if(command === 'game'){



        }else if(command === 'salute'){  

          channel.send('<@' + user.id + '> at ease soldier ;-)');

        }

      ///////////////////
      // TAKE RESPONSE //
      ///////////////////
      }else if(state ==='yessir'){ 
        helpers.process.yessir(msg, channel, user, bot);
      
      }else if(state==='poll'){
        helpers.process.poll(msg, channel, user, bot);

      }else if(state==='trivia'){

      }else if(state===''){

      } //if(state)
    } //if(appropriate)

    
    
    // var response = 'Hey there <@' + user.id + '>';
    // channel.send(response);

    // /** single word commands */
    // var regex = new RegExp("<@" + botId + ">:\\s(\\w+)", "i");
    // var match = message.match(regex);  
    
    // if(match){
    //   var command = match[1];
    //   console.log("this is a command, "+command)

    //   if(command==='yessir'){
    //     console.log('exercise begin!');
    //   }
    // } //if





  }); //client.on message


  client.on('error', function(err){
      console.error("Error", err)
  });

  client.login()

  
  /////////////////
  // DAILY TASKS //
  /////////////////
  /** Ask question every hour  */  
  // var j = cron.scheduleJob('* * * * * *', function(){ 
  //     console.log('The answer to life, the universe, and everything!');
  // });


}
