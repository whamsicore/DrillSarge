/** helper bot functions */
var db = require("../db/fakeDb.js");
var commands = require("./commands.js")

module.exports = {
  parse: parseCommand,
  start: { // beginning a conversation
    rollcall: startRollCall,
    poll: startPoll,
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

/**
 * func: Process the command ('yessir', 'poll', 'play', 'review')
 * @param  {string} msg message sent by user
 * @return {string}     return the name of the 'command'
 */
function parseCommand (msg){
  console.log('inside parseCommand msg='+msg);
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

  return null; // if there are no matches

} //parseCommand




function startRollCall (channel, bot, onlineUsers){
  // var topic = bot.state.memory.temp.topic = 'rollcall';
  bot.startConversation('rollcall');

  channel.send("Everybody say yessir!");
  
  setTimeout(function(){
    if(bot.state.memory.temp.topic==='rollcall'){
      /** Chastise users who have not answered */
      var response = "Alright, time's up! \n";

      for(var key in onlineUsers){
        var user = onlineUsers[key];
        var memory = bot.state.memory.temp.usersWhoAnswered;
        if(memory.indexOf(user.id) === -1){ //user has not answered
          // do nothing?
          response += "<@"+ user.id +">, "
        }else{
          // response += "<@"+ user.id +"> Good! (point+1). \n"
        }

      } //for
      
      response += "are you deaf? I got my eyes on YOU!"
      
      channel.send(response);
      bot.endConversation();

    }

  }, 5000);
} //startRollCall



function startPoll (user, channel, bot){
  bot.startConversation('poll', {
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







function duringRollCall (msg, channel, user, bot, onlineUsers){
  var memory = bot.state.memory;

  if(msg==='yessir'){
    /** @type {array} array of answered user ids */
    var answeredList = memory.temp.usersWhoAnswered = memory.temp.usersWhoAnswered || [];
    
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

// function processAnswer (msg){
//   var response = 'Hey there <@' + user.id + '>';
//   channel.send(response);

//   /** single word commands */
//   var regex = new RegExp("<@" + botId + ">:\\s(\\w+)", "i");
//   var match = message.match(regex);  
  
//   if(match){
//     var command = match[1];
//     console.log("this is a command, "+command)

//     if(command==='yessir'){
//       console.log('exercise begin!');
//     }
//   } //if    
// } //processAnswer

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


