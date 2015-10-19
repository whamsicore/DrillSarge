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
    
    helpers.show.about(channel);
  }); 



  /** Triggers anytime a new message is sent */
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
      /** NOTE: only if there is no ongoing conversation */
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
      /** there is an ongoing conversation */
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


  }); //client.on message


  client.on('error', function(err){
      console.error("Error", err)
  });


  client.login()


  /////////////////
  // DAILY TASKS //
  /////////////////

  /** 10 a.m. Begin day with sharing */
  var j1 = cron.scheduleJob('* 10 * * *', function(){ //10 a.m.
      
  });
  
  /** 3 tests during the day */
  var j2 = cron.scheduleJob('* 11 * * *', function(){ //11 a.m
      
  });

  var j3 = cron.scheduleJob('30 13 * * *', function(){ //1:30 p.m.
      
  });

  var j4 = cron.scheduleJob('30 15 * * *', function(){ //3:30 p.m.
      
  });

  /** reflection, award ceremony */
  var j5 = cron.scheduleJob('30 16 * * *', function(){ //3:30 p.m.
      
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
