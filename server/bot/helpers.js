/** helper bot functions */
var db = require("./fakeDb.js");

module.exports = {
  process:{
    command: parseCommand, 
    option: parseOption, 
    yessir: processYessir 
  },
  slack:{
    findChannelByName:findChannelByName
  }
}

/**
 * func: Process the command ('yessir', 'ask', 'play', 'review')
 * @param  {string} msg message sent by user
 * @return {string}     the topic of the new conversation. Null = no conversation
 */
function parseCommand (msg, client){
  
  /** single word commands */
  var regex = new RegExp("<@" + client.self.id + ">:\\s(\\w+)", "i");
  var match = msg.match(regex);  
  
  if(match){ //if there is a command
    return match[1];
  }else{
    return null;
  } //if    

} //parseCommand

function parseOption (msg, client){
  
  /** single word commands */
  var regex = new RegExp("<@" + client.self.id + ">:\\s(\\w+)(.+)", "i");
  var match = msg.match(regex);  
  if(match){ //if there is a command
    return match[2];
  }else{
    return null;
  } //if    

} //parseCommand




function processYessir (msg, channel, user, memory){

  if(msg==='yessir'){
    var answeredList = memory.temp.usersWhoAnswered = memory.temp.usersWhoAnswered || [];
    
    if(answeredList.indexOf(user.id)===-1){ //user has not answered before
      
      if(answeredList.length===0){ 
        updateScore(user, 'first to answer');
      }else{
        updateScore(user, 'answering');
      }

      answeredList.push(user.id);
    } //if
  }else{ //interupts are reprimanded
    updateScore(user, "don't interrupt");
  } //if

} //processYessir



function processPoll (msg, channel, user, memory){
  var pollState = memory.temp.pollState || 'start';
  
  if(msg==='yessir'){
    var answeredList = memory.temp.usersWhoAnswered = memory.temp.usersWhoAnswered || [];
    
    if(answeredList.indexOf(user.id)===-1){ //user has not answered before
      
      if(answeredList.length===0){ 
        updateScore(user, 'first to answer');
      }else{
        updateScore(user, 'answering');
      }

      answeredList.push(user.id);
    } //if
  }else{ //interupts are reprimanded
    updateScore(user, "don't interrupt");
  } //if

} //processYessir

function updateScore(user, reason){
  var change = 0; 
  if(reason==='answering'){
    change = 1;

  }else if(reason === 'first to answer'){
    change = 2;
  }else if(reason === 'interrupting'){
    change = -1;

  } //if(reason)

  db.users[user.id].score += change; //update database
  if(change>0){
    channel.send('<@'+user.id+'> score+'+change+' ('+ reason +')');

  }else{
    channel.send('<@'+user.id+'> score-'+Math.absolute(change)+' ('+ reason +')');
    
  }

} //updateScore

function processAnswer (msg){
  var response = 'Hey there <@' + user.id + '>';
  channel.send(response);

  /** single word commands */
  var regex = new RegExp("<@" + botId + ">:\\s(\\w+)", "i");
  var match = message.match(regex);  
  
  if(match){
    var command = match[1];
    console.log("this is a command, "+command)

    if(command==='yessir'){
      console.log('exercise begin!');
    }
  } //if    
} //processAnswer

/**
 * return a channel from slack object based on name
 * @param  {string} name [description]
 * @return {[type]}      [description]
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


