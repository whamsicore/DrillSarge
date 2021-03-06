/** helper bot functions */
var db = require("../db/customDb");
var commands = require("./commands")
var script = require("./script")

module.exports = {
  parse: parseCommand,
  pickRandom: pickRandom,
  start: { // beginning a conversation
    rollcall: startRollCall,
    pollCreate: startPollCreate,
    random: startRandomPoll,
  },
  show: {
    pollErr: showPollErr,
    help: showHelp,
    schedule: showSchedule,
    scoreBoard: showScoreBoard,
    score: showScore,
    about: showAbout,
    intro: showIntro,
    highfive: showHighfive,
    highfiveErr: showHighfiveErr,
  },
  during:{ // when conversation has started already
    rollcall: duringRollCall,
    pollCreate: duringPollCreate,
    poll: duringPoll,
  }, 
  slack:{
    findChannelByName:findChannelByName, 
    getOnlineUsersForChannel: getOnlineUsersForChannel
  }, 
  users:{
    point:{
      minus: pointMinus,
      plus: pointPlus
    }
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

  // send rollcall prompt to all online users
  var response = '';
  response += "It's time for my favorite exercise \"rollcall\". \n"
  onlineUsers.forEach(function(user){
      response += "<@"+ user.id +"> ";
  });

  response += "say YESSIR!!!"
  channel.send(response);




  // create reminder
  var memory = bot.state.memory; //closure variable for future reference
  bot.reminder = setInterval(function(){
    if(!bot.state.conversing){
      clearInterval(bot.reminder);
    }else{
      var answeredUserIds = memory.temp.usersWhoAnswered;
      var unansweredList = getUnansweredUserIds(answeredUserIds, onlineUsers);

      var response = '';
      
      response += "We're still waiting on ";
      unansweredList.forEach(function(user_id){
          response += "<@"+ user_id +"> ";
      });
      response += " to say YESSIR. ";
      response += pickRandom(script.noResponse) ;


      channel.send(response);
    } //if(!conversing)

  }, 5500);

  //cancel reminder after one minute
  setTimeout(function(){
    if(bot.reminder){
      clearInterval(bot.reminder);
    }
  }, 1*60*1000);
} //startRollCall


/**
 * Begin poll by creating a poll: get prompt and options. Then proceed to ask the question and get response from everyone on the team
 * @param  {object} user    the poll creator
 * @param  {object} channel slack channel object
 * @param  {object} bot     sarge instance
 * @param  {object} data    .match results recovered from parseCommand()
 */
function startPollCreate (bot, channel, data, user){
  bot.startConversation({
    topic: 'pollCreate',
    creator_id: user.id,
    poll: {
      prompt: data[1], // prompt was saved with msg.match
      options: [] // empty
    }
  }); //topic='poll'

  var options = [];
  var res = '';

  res += getPollNewOptionStr(options);
  
  channel.send(res);

} //startPollCreate

// send out the poll
function startPoll (bot, channel, onlineUsers){
  //first display the poll to channel
  bot.updateMemory({
    topic: 'poll', 
    usersWhoAnswered: [],  
    answers: [] //format = {user_id, option_id}
  });

  var memory = bot.state.memory.temp;
  var res = '';

  res += "It's time for a poll guys! \n";
  res += "Question: " + getPollDisplayString(memory.poll);
  channel.send(res);

  bot.reminder = setInterval(function(){
    if(!bot.state.conversing){
    
      clearInterval(bot.reminder);

    }else{

      var answeredUserIds = memory.usersWhoAnswered;
      var unansweredList = getUnansweredUserIds(answeredUserIds, onlineUsers);

      var response = '';
      
      unansweredList.forEach(function(id){
          response += "<@"+ id +"> ";
      });
      response += pickRandom(script.noResponse);
      response += " Help us finish the poll! \n";
      response += getPollDisplayString(memory.poll);

      channel.send(response);
    } //if(!conversing)

  }, 6000);

  //expect everyone to answer
  //cancel reminder after five minutes
  setTimeout(function(){
    if(bot.reminder){
      clearInterval(bot.reminder);
    }
  }, 5*60*1000);

} //startPoll



function startRandomPoll (bot, channel, onlineUsers){
  var testData = require('../db/testData');
  var questions = testData.questions;

  bot.startConversation({
    poll: pickRandom(questions)
  });

  startPoll (bot, channel, onlineUsers);
  // startPoll (bot, channel, onlineUsers, onlineUsers, user);
}





/////////////////////////
// DURING CONVERSATION //
/////////////////////////

function duringRollCall (msg, channel, user, bot, onlineUsers){

  var memory = bot.state.memory;

  if(msg==='yessir'){
    /** @type {array} array of answered user ids */
    var answeredUserIds = memory.temp.usersWhoAnswered;
    
    if(answeredUserIds.indexOf(user.id)===-1){ //user has not answered before
      updateScore(user, 'answering', channel);

      answeredUserIds.push(user.id);

      /** All users have answered */
      if(answeredUserIds.length===onlineUsers.length){ 
      
        channel.send("Good job guys! Now, let me remind you guys about what I can do:");
        bot.endConversation()
        
        setTimeout(function(){
          showHelp(channel);
        }, 1000); 
        // for(var key in onlineUsers){
        //   var user = onlineUsers[key];
        //   updateScore(user, 'extra', channel);
        // }

      } //if(finished)
    } //if(new response)
  }else{ //interupts are reprimanded

    updateScore(user, "don't interrupt", channel);

  } //if

} //duringYessir



//Finish when user says I'm done or when four options have been filled
// - also user may cancel
// -   
function duringPollCreate (bot, channel, msg, onlineUsers, user){
  var creator_id = bot.state.memory.temp.creator_id;
  var options = bot.state.memory.temp.poll.options;


  if( user.id === creator_id ){


    if(msg.match( /^i\'m done$/i ) ){ 
      
      // channel.send("poll is finished")
      if(options.length>=2){
        
        startPoll (bot, channel, onlineUsers);

      }else{ //warn and ask again
      
        var res = '';
        res += "You must enter at least 2 options! \n";
        res += getPollNewOptionStr(options);
        channel.send(res);

      } //if
      
    }else if(msg === 'cancel'){

      channel.send("Sure thing! `poll cancelled`");
      bot.endConversation();
      
    }else{ //save new option

      var res = '';

      options.push(msg); //push to option

      if(options.length===4){ //maximum options reached
        //todo: save and startPoll()
        startPoll (bot, channel, onlineUsers)
        res += "Complete! Now let's find out what poeple think. <!everyone> MUST respond!";
      
      }else{
        res += getPollNewOptionStr(options);

      } //if(poll completed) 

      channel.send(res);
      //send prompt for next option

    } //var abc = ['A','B','C','D']; //indicates max and alphabetical mapping

  } //if(valid user)


} //duringPollCreate


//take user answers
function duringPoll(bot, channel, msg, onlineUsers, user){
  var memory = bot.state.memory.temp;
  var options = memory.poll.options;
  var abc = ['A', 'B', 'C', 'D'];

  if(abc.indexOf(msg) !== -1){ //blah
    /** @type {array} array of answered user ids */
    var answeredUserIds = memory.usersWhoAnswered;
    
    if(answeredUserIds.indexOf(user.id)===-1){ //user has not answered before

      updateScore(user, 'answering', channel);

      answeredUserIds.push(user.id);
      memory.answers.push({
        user_id: user.id, 
        option_id: abc.indexOf(msg)
      });

      /** All users have answered */
      if(answeredUserIds.length===onlineUsers.length){ 
        var res = '';
        res += "Good job guys! Here are the results... \n";
        res += getPollResultsDisplayString(bot, onlineUsers);
        
        channel.send(res);

        bot.endConversation()
        
        // for(var key in onlineUsers){
        //   var user = onlineUsers[key];
        //   updateScore(user, 'extra', channel);
        // }

      } //if(finished)
    } //if(new response)
  }else{ //interupts are reprimanded
    
    // updateScore(user, "don't interrupt", channel);
  } //if

} //duringPoll





////////////////////
// SHOW SOMETHING //
////////////////////

function showPollErr(channel){

  var response = '';
  response += "Son, if you want me create a poll, you gotta provide a question. \n"
  response += ">Follow the format `poll <question>?`"
  channel.send(response);
}

function showHighfiveErr(channel){

  var response = '';
  response += "Son, if you want me highfive someone, you gotta tell me who. \n"
  response += ">Follow the format `highfive @user_name`"
  channel.send(response);
} 

function showHighfive (bot, channel, data, user){

  var target_id = data[1]; 
  
  if(user.id===target_id){
    channel.send("You CANNOT highfive yourself. "+pickRandom(script.discourage)) ;
    
  }else{

    pointPlus(target_id, 5); // add points for users in database
    
    channel.send("<@"+target_id+"> gets +5 points for being awesome! "+pickRandom(script.encourage)) ;
    
  }

} //showHighfive

/////////////////////
// DISPLAY HELPERS //
/////////////////////

function getPollDisplayString(poll){
  var res = '';
  var abc = ['A','B','C','D']; //indicates max and alphabetical mapping

  res += '"'+poll.prompt + '" ';
  res += "(enter ";
  poll.options.forEach(function(opt, index){
    res += index!==0 ? '/' :'';
    res += abc[index];
  });
  res += ") \n";

  poll.options.forEach(function(opt, index){
    res += "`"+abc[index] + ": "+ opt + "`\n"
  });

  return res;
} //getPollDisplayString


function getPollResultsDisplayString(bot, onlineUsers){
  var memory = bot.state.memory.temp;
  var options = memory.poll.options;
  var answers = memory.answers;

  var res = '';
    
  // how many people answered
  
  options.forEach(function(opt, index){
    var count = 0;
    answers.forEach(function(ans){
      if(ans.option_id===index){
        count++
      } //if
    });

    res += "`" + count + " number of people chose " + opt + "` \n"; 

  }); //options.forEach

  res += "A total of "+onlineUsers.length+" members(s) responded. \n";

  return res;
} //getPollResultsDisplayString


function getPollNewOptionStr (options){
  var res = '';
  var abc = ['A','B','C','D']; //indicates max and alphabetical mapping

  res += "What would you like me to put for `option "+abc[options.length]+"`? \n";
  res += "(type `i'm done` to end, or `cancel` to cancel) \n"
  options.forEach(function(opt, index){
    res += "`"+abc[index] + ": "+ opt + "`\n"
  });

  return res;

} //getPollNewOptionStr



function showSchedule (channel){
  var response = '';
  response += ">>>Daily Schedule: \n"
  response += "```10 a.m.: Meet in #general for sharing exercise \n"
  response += "11 a.m.: Test your knowledge of teammates and earn points \n"
  response += "1:30 p.m.: Test your knowledge of teammates and earn points \n"
  response += "3:30 p.m.: Test your knowledge of teammates and earn points \n"
  response += "4:30 p.m.: Daily reflection ```\n"
  channel.send(response);
} //showSchedule


function showScore (channel, user){
  var User = db.users.findOrCreate(user.id);
  var res = '';
  res += "`<@"+user.id+"> you have "+ User.score +" points. `"
  channel.send(res);
}


function showAbout (channel){
  var response = '';
  response += "```I fought in wars you never even heard of... \n";
  response += "I've got over 30 years of experience in LEADERSHIP. \n";
  response += "I reserve my soft spot only for kittens! \n";
  response += "My job here is to help this team become a single unit. ```";
  channel.send(response);
  
} //showSchedule

 
function showIntro (channel){
  var response = '';
  response += ">>> My name is Sarge. \n";
  response += "My job here is to turn this raggity band of strangers into a living, breathing, battle unit! ";
  response += "To do so, we're gonna do daily exercises to facilitate \"*teamwork*\". ";
  channel.send(response);
}

function showScoreBoard (channel, onlineUsers){
  var response = '';
  
  for(var key in onlineUsers){
    var user_id = onlineUsers[key].id;

    var user = db.users.findOrCreate(user_id);
    response += "`<@"+user_id+"> has "+ user.score +" points. `\n"

  } //for

  channel.send(response);


} //showSchedule



function showHelp (channel){
  var res = '';

  res += "`help`: Show commands \n"
  res += "`schedule`: Show daily schedule \n"
  res += "`poke`: I dare you to \n"
  res += "`scoreboard`: Show scores of all players \n"
  res += "`salute`: What you should do everyday. \n"
  res += "`rollcall`: Make sure everyone is present \n"
  res += "`poll`: Poll the entire team! \n"
  res += "`random`: Poll the team with a random question! \n"
  res += "`highfive`: High five a teammate to give them points (NEW FEATURE!) \n"
  res += "`quit`: End any conversation (NEW FEATURE!) \n"
  res += "`challenge`: Challenge your teammates (coming soon...) \n"
  res += "`hungry`: Order food (coming soon...) \n"
  res += "`give`: Give points to teammates (coming soon...) \n"

  channel.send(res);
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


function pointMinus(user_id){
  /** add user to db if not exist */
  var savedUser = db.users.findOrCreate(user_id);
  savedUser.score--; 
}

function pointPlus(user_id, num){
  var num = num || 1;
  /** add user to db if not exist */
  var savedUser = db.users.findOrCreate(user_id);
  savedUser.score+=num; 
}

/** return random element in array */
function pickRandom(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function updateScore(user, reason, channel){
  var change = 0; 

  /** determine change amount */
  if(reason === 'answering'){
    change = 1;
  }else if(reason === 'answering first'){
    change = 2;
  }else if(reason === 'interrupting'){
    change = -1;

  }else if(reason === 'extra'){
    change = 1;

  } //if(reason)

  /** add user to db if not exist */
  var User = db.users.findOrCreate(user.id);
  
  /** update database */
  User.score += change; //update database
  /** output  */
  
  channel.send('<@'+user.id+'>' + " `" + (change>0 ? '+':'-') + change + ' point `');
  

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

function getUnansweredUserIds(answeredUserIds, onlineUsers){
  var res = [];

  for(var key in onlineUsers){

    var user = onlineUsers[key];
    if(user){
      if(answeredUserIds.indexOf( user.id ) === -1){ //not found
        res.push(user.id);
      } //if
      
    }else{

    }
  } //for

  return res;
} //getUnansweredUserIds


