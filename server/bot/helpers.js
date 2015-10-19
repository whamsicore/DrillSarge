/** helper bot functions */
var db = require("../db/fakeDb.js");
var commands = require("./commands.js")

module.exports = {
  parse: parseCommand,
  start: { // beginning a conversation
    rollcall: startRollCall,
    poll: startPoll,
    pollIncomplete: startPollIncomplete,
  },
  show: {
    help: showHelp,
    schedule: showSchedule,
    leaderBoard: showLeaderBoard,
    about: showAbout,
  },
  during:{ // when conversation has started already
    rollcall: duringRollCall,
    poll: duringPoll,
  }, 
  slack:{
    findChannelByName:findChannelByName, 
    getOnlineUsersForChannel: getOnlineUsersForChannel
  }
}



////////////////////////
// START CONVERSATION //
////////////////////////

function startRollCall (channel, bot, onlineUsers){
  // var topic = bot.state.memory.temp.topic = 'rollcall';
  bot.startConversation({
    topic:'rollcall',
    usersWhoAnswered:[],
  });

  channel.send("Everybody say yessir!");
  
  setTimeout(function(){
    if(bot.state.memory.temp.topic==='rollcall'){
      /** Chastise users who have not answered */
      var response = "Alright, time's up! \n";
      var noResponseCount = 0; 

      for(var key in onlineUsers){
        var user = onlineUsers[key];
        var memory = bot.state.memory.temp.usersWhoAnswered;
        if(memory.indexOf(user.id) === -1){ //user has not answered
          // do nothing?
          response += "<@"+ user.id +">, ";
          noResponseCount++
        }else{
      
        }

      } //for
      
      response += "are ";
      resposne += noResponseCount>1 ? "y'all": "you";
      response += " deaf? I got my eyes on YOUSE!"
      
      channel.send(response);
      bot.endConversation();

    }

  }, 5000);
} //startRollCall


/**
 * Begin poll by getting question and options. Then proceed to ask the question and get response from everyone on the team
 * @param  {object} user    the poll creator
 * @param  {object} channel slack channel object
 * @param  {object} bot     sarge instance
 * @param  {object} data    .match results recovered from parseCommand()
 */
function startPoll (user, channel, bot, data){
  bot.startConversation({
    topic: 'poll',
    creator_id: user.id, 
    waiting: true
  }); //topic='poll'
  
  channel.send("Everybody say yessir!");
  
  setTimeout(function(){
    if(bot.state.memory.temp.waiting){
      channel.send("Get back to me when you've made up your mind, son!");
      bot.endConversation();
    } //if
  }, 5000); //note: change to 10 seconds once complete
} //startPoll

function startPollIncomplete(channel){
  var response = '';
  response += "Son, if you want me create a poll, you gotta provide a question. \n"
  response += ">Follow the format `poll <question>?`"
  channel.send(response);
}





/////////////////////////
// DURING CONVERSATION //
/////////////////////////

function duringRollCall (msg, channel, user, bot, onlineUsers){
  var memory = bot.state.memory;

  if(msg==='yessir'){
    console.log('yessir testing')
    /** @type {array} array of answered user ids */
    var answeredList = memory.temp.usersWhoAnswered;
    
    if(answeredList.indexOf(user.id)===-1){ //user has not answered before
      
      if(answeredList.length===0){ 
        updateScore(user, 'answering first', channel);
      }else{
        updateScore(user, 'answering', channel);
      }

      answeredList.push(user.id);

      /** All users have answered */
      if(answeredList.length===onlineUsers.length){ 
      
        channel.send("Good job guys, everyone gets extra points.");
      
        for(var key in onlineUsers){
          var user = onlineUsers[key];
          updateScore(user, 'extra', channel);
        }

        bot.endConversation()
      } //if(finished)
    } //if(new response)
  }else{ //interupts are reprimanded
    updateScore(user, "don't interrupt", channel);
  } //if

} //duringYessir



function duringPoll (user, channel, bot){
  var creator_id = bot.state.memory.temp.creator_id;

  if( user.id === creator_id ){
    // channel.send();
    console.log("from poll creator");

  }


} //duringPoll





////////////////////
// SHOW SOMETHING //
////////////////////


function showSchedule (channel){
  var response = '';
  response += ">>>Daily Schedule: \n"
  response += "```9 o'clock: Meet in #general for daily sharing \n"
  response += "11 a.m.: Test your knowledge of teammates and earn points \n"
  response += "1 p.m.: Test your knowledge of teammates and earn points \n"
  response += "3 p.m.: Test your knowledge of teammates and earn points \n"
  response += "4:30 p.m.: Daily reflection ```\n"
  channel.send(response);
} //showSchedule


function showAbout (channel){
  var response = '';
  response += ">>> My name is Sarge. \n";
  response += "• I fought in wars you never even heard of... \n";
  response += "• I've got over 30 years of experience in LEADERSHIP. \n";
  response += "• My job here is to help this team become a single unit. ";
  response += " To do so, I'm gonna host daily sharing sessions between y'all. ";
  response += "Then, throughout the day I'm gonna test you guys on just how much you know about your team. ";
  response += "At the end of everyday I'll announce a winner. That could be you...";
  
  channel.send(response);
} //showSchedule



function showLeaderBoard (channel, onlineUsers){
  var response = '';
  for(var key in onlineUsers){
    var user = onlineUsers[key];



  }


} //showSchedule



function showHelp (channel){
  var response = '';

  response += ">Useful Commands: \n"
  response += "```help: show commands \n"
  response += "schedule: show daily schedule \n"
  response += "rollcall: make sure everyone is present \n"
  response += "poll <question>?: coming soon... \n"
  response += "leaderboard: show leaderboard \n"
  response += "test: test your team on interpersonal knowledge \n"
  response += "poke: I dare you to \n"
  response += "salute: What you should do everyday. \n"
  response += "hungry: coming soon... \n"
  response += "givePoints @<username>: coming soon... \n"
  response += "giveHighFive @<username>: coming soon... \n"
  response += "schedule: show daily schedule"
  response += " ```\n"

  channel.send(response);
} //showSchedule




///////////
// OTHER //
///////////


/**
 * func: Process the command ('yessir', 'poll', 'play', 'review')
 * @param  {string} msg message sent by user
 * @return {string}     return the name of the 'command'
 */
function parseCommand (msg){
  /** single word commands */
  for(var tag in commands){
    var regex = commands[tag];
    // console.log('regex='+regex);
    
    // console.log('match=',match);
    if(match = msg.match(regex)){
      return {
        tag: tag, 
        data: match
      }
    } //if
  } //for 
  console.log('no command found')
  return null; // if there are no matches

} //parseCommand




function updateScore(user, reason, channel){
  var change = 0; 

  /** determine change amount */
  if(reason === 'answering!'){
    change = 1;
  }else if(reason === 'answering first!'){
    change = 2;
  }else if(reason === 'interrupting!'){
    change = -1;

  }else if(reason === 'extra'){
    change = 1;

  } //if(reason)

  /** add user to db if not exist */
  if(!db.users[user.id]){
    db.users[user.id] = {
      points:0
    }
  }

  /** update database */
  db.users[user.id].points += change; //update database
  /** output  */
  if(change>0){
    channel.send('<@'+user.id+'> '+ change +'points for '+ reason +' ('+db.users[user.id].points+' total)');
  }else if(change<0){
    channel.send('<@'+user.id+'> '+ Math.abs(change)+' points for '+ reason +' ('+db.users[user.id].points+' total)');
  }

} //updateScore



/**
 * func: Return a channel from slack object based on name
 * @param  {string} name   
 * @param  {object} client 
 * @return {object}        slack channel object
 */
function findChannelByName(name, client){

  for(var channel_id in channels = client.channels){  
    var channel = client.getChannelGroupOrDMByID(channel_id);
    
    if(channel.name===name){
      return channel;
    }
  } //for

  return null; //no match found 
} //findChannelByName




/**
 * Find all the online users (human) in the channel
 * @param  {object} channel information about the current channel
 * @param  {object} client  slack client
 * @return {array}         array of user objects
 */
function getOnlineUsersForChannel (channel, client) {
  if (!channel){
    return [] 
  }else{
      return (channel.members || [])
          .map(function(id) { 
            return client.users[id] })
          .filter(function(u) { 
            return !!u && !u.is_bot && u.presence === 'active'
          })
    
   }  
};


