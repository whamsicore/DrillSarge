/** Class, contains A.I. for fully functional slack bot with conversation capabilities */

// var Sarge = require('./sargeAI');
var Slack = require('slack-client');
var cron = require('node-schedule');

var helpers = require('./helpers');
var db = require("../db/fakeDb.js");
var script = require('./script');



var autoReconnect = true, // Automatically reconnect after an error response from Slack.
    autoMark = true; // Automatically mark each message as read after it is processed.

module.exports = function(token){  
  /** Connect to the slack client */
  slackToken = token || 'xoxb-12608710676-WToSXWoZrkJayDKbFRAs2JpL';
  var client = new Slack(slackToken, autoReconnect, autoMark); //instantiate client connection

  /** @type {String} State of our bot */
  this.state = {
    conversing:false, // options: neutral, conversing
    memory: { //relevant data
      temp:{}, //used for current/ongoing conversation
      daily:{}, // used to save relevant information about the days 
      lifetime:{}, // require the use of database
    }
  }

  var bot = this; 
  
  this.memory = {
  } //memory

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
    var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    var user = client.getUserByID(data.user);
    var msg = data.text;
    var conversing = bot.state.conversing;

    if(user.id!==client.self.id){ // message comes from user, not bot
      
      ////////////////////
      // TAKE COMMAND   //
      ////////////////////

      if(!conversing){
        var command = helpers.parse(msg);
        
        if(command){
          var tag = command.tag; 
          var data = command.data; 

          if(tag === 'rollcall'){ //conversation
            helpers.start.rollcall(channel, bot, onlineUsers);

          }else if(tag === 'poll'){ //conversation
            helpers.start.poll(user, channel, bot, data);          

          }else if(tag === 'pollIncomplete'){ //error
            helpers.start.pollIncomplete(channel);          

          }else if(tag === 'test'){ //conversation


          }else if(tag === 'share'){ //conversation
            // helpers.show.about(channel);          


          }else if(tag === 'about'){ //show
            helpers.show.about(channel);          


          }else if(tag === 'schedule'){ //show
            helpers.show.schedule(channel);          


          }else if(tag === 'leaderboard'){ //show
            helpers.show.leaderBoard(channel);          


          }else if(tag === 'help'){ //show
            helpers.show.help(channel);          


          }else if(tag === 'poke'){ //show. random res.
            channel.send('<@' + user.id + '> '+script.res.poke[ Math.floor( Math.random()*script.res.poke.length ) ] );

          }else if(tag === 'review'){ //show


          }else if(tag === 'salute'){ //show: random res.
            channel.send('<@' + user.id + '> '+script.res.salute[ Math.floor( Math.random()*script.res.salute.length ) ] );

          } //switch(tag)         
        } //if(command)

      ///////////////////
      // TAKE RESPONSE //
      ///////////////////
      }else{ // conversing
        var topic = bot.state.memory.temp.topic; 
        console.log('test topic='+topic);
        if(topic ==='rollcall'){ 
          helpers.during.rollcall(msg, channel, user, bot, onlineUsers);
        
        }else if(topic==='poll'){
          helpers.during.poll(msg, channel, user, bot);

        }else if(topic==='trivia'){

        }else if(topic===''){

        } //if(topic)
      } //if(conversing)
    } //if(appropriate)

    
    
    // var response = 'Hey there <@' + user.id + '>';
    // channel.send(response);

    // /** single word commands */
    // var regex = new RegExp("<@" + botId + ">:\\s(\\w+)", "i");
    // var match = message.match(regex);  
    
    // if(match){
    //   var command = match[1];
    //   console.log("this is a command, "+command)

    //   if(command==='rollcall'){
    //     console.log('exercise begin!');
    //   }
    // } //if





  }); //client.on message


  client.on('error', function(err){
      console.error("Error", err)
  });

  client.login()

  
  //////////////////////
  // MEMORY FUNCTIONS //
  //////////////////////

  /**
   * start a conversation by updating temporary memory
   * @param  {object} context other context to add to conversation
   */
  this.startConversation = function(context){
    // bot.state.conversation = false;
    bot.state.conversing = true;
    for(var key in context){ // map all context tuples to temp memory
      bot.state.memory.temp[key] = context[key]; 
    } //for
  };

  console.log('memory.temp=', bot.state.memory.temp)

  this.endConversation = function(){
    bot.state.conversing = false;
    bot.state.memory.temp = {}; //reset temporary memory
  };

  /////////////////
  // DAILY TASKS //
  /////////////////
  /** Ask question every hour  */  
  // var j = cron.scheduleJob('* * * * * *', function(){ 
  //     console.log('The answer to life, the universe, and everything!');
  // });


}
