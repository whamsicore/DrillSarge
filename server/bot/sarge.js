/** Class, contains A.I. for fully functional slack bot with conversation capabilities */

// var Sarge = require('./sargeAI');
var Slack = require('slack-client');
var cron = require('node-schedule');

var helpers = require('./helpers');
var db = require("../db/customDb");
var script = require('./script');




module.exports = function(token){  
  /** slack client connection variables */
  var autoReconnect = true, // Automatically reconnect after an error response from Slack.
      autoMark = true, // Automatically mark each message as read after it is processed.
      slackToken = token || 'xoxb-12608710676-WToSXWoZrkJayDKbFRAs2JpL'; //defaults to betabootcamp.slack.com
  /** @type {Slack} instantiate client connection */
  var client = new Slack(slackToken, autoReconnect, autoMark); //instantiate client connection
  
  /** @type {object} used to give access of object to methods via closure */
  var bot = this; 

  /** @type {Object} Contextual state for Sarge AI */
  //NOTE: based on my understanding of AI having consciousness and memory components
  this.state = {
    //note: consider refactoring into something like "consciousness"
    conversing:false, // options: neutral, conversing
    memory: { //short  data
      temp:{}, //short-term memory: used for current/ongoing conversation
      daily:{}, //middle-term memory (not currently in use): used to save relevant information about the current day. Wiped at 12 a.m. PST. 
      lifetime:{}, //long-term memory (not currently in use): require the use of database
    }
  }

  

  /** Triggers when Slackbot is loaded  */
  client.on('open', function(){
    var channel = helpers.slack.findChannelByName('general', client); 
    var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    
    channel.send('*Atteeeeeention!* `Sarge is connected.`');
    // helpers.show.intro(channel);

    setTimeout(function(){
      helpers.start.rollcall(channel, bot, onlineUsers);

    }, 1000);
    
  }); 



  /** Triggers anytime a new message is sent */
  client.on('message', function(data){
    var channel = client.getChannelGroupOrDMByID(data.channel);
    var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    var user = client.getUserByID(data.user);
    var msg = data.text;

    var conversing = bot.state.conversing; 
    var memory = bot.state.memory;

    if(user.id!==client.self.id){ // message comes from user, not bot
      
      ////////////////////
      // TAKE COMMAND   //
      ////////////////////
      /** NOTE: only if there is no ongoing conversation */
      var command = helpers.parse(msg);

      // no conversation, then read command
      if(!conversing){
        
        if(command){
          var tag = command.tag; 
          var data = command.data; 

          if(tag === 'poke'){ //show. random res.
            channel.send('<@' + user.id + '> '+ helpers.pickRandom(script.discourage) + " `(-1 pt.)`");
            helpers.users.point.minus(user.id);
          }
          else if(tag === 'salute'){ //show: random res.
            channel.send('<@' + user.id + '> '+ helpers.pickRandom(script.encourage) + " `(+1 pt.)`");
            helpers.users.point.plus(user.id);

          } 
          else if(tag === 'help'){ //show
            helpers.show.help(channel);          

          }
          else if(tag === 'about'){ //show
            helpers.show.about(channel);          

          }
          else if(tag === 'scoreboard'){ //show
            helpers.show.scoreBoard(channel, onlineUsers);          

          }
          else if(tag === 'score'){ //show
            helpers.show.score(channel, user);          

          }
          else if(tag === 'rollcall'){ //conversation
            helpers.start.rollcall(channel, bot, onlineUsers);

          }
          else if(tag === 'schedule'){ //show
            helpers.show.schedule(channel);          


          }
          else if(tag === 'poll'){ //conversation
            helpers.start.pollCreate(bot, channel, data, user);

          }
          else if(tag === 'pollErr'){ //error
            helpers.show.pollErr(channel);          

          }
          else if(tag === 'highfive'){ //gamification

            helpers.show.highfive(bot, channel, data, user);

          }
          else if(tag === 'highfiveErr'){ //error
            helpers.show.highfiveErr(channel);          

          }
          else if(tag === 'share'){ //conversation
            // helpers.show.about(channel);          
            helpers.start.random(bot, channel, onlineUsers);


          }
          else if(tag === 'random'){ //conversation
            helpers.start.random(bot, channel, onlineUsers);


          }
          else if(tag === 'challenge'){ //conversation
            helpers.start.random(bot, channel, onlineUsers);


          }
          else if(tag === 'challenge'){ //show


          } ////switch(tag)         
        } //if(command)

      ///////////////////
      // TAKE RESPONSE //
      ///////////////////
      /** there is an ongoing conversation */
      }else{ // conversing
        //quit functionality
        if(command){
          if(command.tag==='quit'){
            channel.send("`("+ bot.state.memory.temp.topic +" cancelled)`");
            bot.endConversation();
          }          
        } //if(command)

        var topic = bot.state.memory.temp.topic; 

        if(topic ==='rollcall'){ 
          helpers.during.rollcall(msg, channel, user, bot, onlineUsers);
        
        }else if(topic==='pollCreate'){
          helpers.during.pollCreate(bot, channel, msg, onlineUsers, user);

        }else if(topic==='poll'){
          helpers.during.poll(bot, channel, msg, onlineUsers, user);

        }else if(topic===''){

        } //if(topic)
      } //if(conversing)
    } //if(appropriate)


  }); //client.on message


  client.on('error', function(err){
      console.error("ClientError", err)
  });


  client.login()


  /////////////////
  // DAILY TASKS //
  /////////////////

  /** 10 a.m. Begin day with sharing */
  //NOTE: server time difference is 7 hours ahead of PST
  var j1 = cron.scheduleJob('0 17 * * *', function(){ //10 a.m
    var channel = helpers.slack.findChannelByName('general', client); 
    bot.endConversation();
    // var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    // helpers.start.rollcall(channel, bot, onlineUsers);
    
    channel.send('The time is now 10 a.m.');
  });
  
  /** 3 tests during the day */
  var j2 = cron.scheduleJob('0 18 * * *', function(){ //11 a.m
    var channel = helpers.slack.findChannelByName('general', client); 
    bot.endConversation();
    // var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    // helpers.start.random(bot, channel, onlineUsers);
    channel.send('The time is now 11 a.m., time for our first challenge!');
  });

  var j3 = cron.scheduleJob('30 20 * * *', function(){ //1:30 p.m.
    var channel = helpers.slack.findChannelByName('general', client); 
    bot.endConversation();
    // var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    // helpers.start.random(bot, channel, onlineUsers);
    channel.send('The time is now 1:30 p.m., time for our second challenge.');
    
  });

  var j4 = cron.scheduleJob('30 22 * * *', function(){ //3:30 p.m.
    var channel = helpers.slack.findChannelByName('general', client); 
    bot.endConversation();
    // var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    // helpers.start.random(bot, channel, onlineUsers);
    channel.send('The time is now 3:30 p.m., time for our third challenge.');
    
  });

  // /** reflection, award ceremony */
  var j5 = cron.scheduleJob('15 23 * * *', function(){ //3:30 p.m.
    var channel = helpers.slack.findChannelByName('general', client); 
    bot.endConversation();
    // var onlineUsers = helpers.slack.getOnlineUsersForChannel(channel, client);
    // helpers.show.scoreBoard(channel, onlineUsers);
    channel.send('The time is now 4:15 p.m., time for our daily reflection.');
        
  });

  ////////////////////////////
  // CONVERSATION FUNCTIONS //
  ////////////////////////////
  /** NOTE: handle our own consciousness */
  /**
   * start a conversation by updating temporary memory
   * @param  {object} context other context to add to conversation
   */
  this.startConversation = function(context){
    // bot.state.conversation = false;
    bot.state.conversing = true;
    this.updateMemory(context);
  };


  this.endConversation = function(){
    if(bot.reminder){ //clear any active reminders
      clearInterval(bot.reminder);
    }
    bot.state.conversing = false;
    this.clearMemory();
  };

  this.updateMemory = function(input){
    for(var key in input){ // map all input tuples to temp memory
      bot.state.memory.temp[key] = input[key]; 
    } //for
  }

  this.clearMemory = function(){
    bot.state.memory.temp = {}; //reset temporary memory
  }
  

} //export
