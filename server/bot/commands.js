/** tag - regex pairs. tag is the name of the command, regex is the regex used to trigger it */

module.exports = {
  'poll': new RegExp('^poll (\w)+$', 'i'), 
  'rollcall': new RegExp('^rollcall$', 'i'), 
  'leaderboard': new RegExp('^leaderboard$', 'i'), //show everyones scores
  'play': new RegExp('^play$', 'i'), 
  'salute': new RegExp('^salute$', 'i'), 
  'poke': new RegExp('^poke$', 'i'), //say random blurb
  'hungry': new RegExp('^hungry$', 'i'), //yelp restaurants
  'help': new RegExp('^help$', 'i'), //show available commands
  'givePoints': new RegExp('^give \\d points to (\\w)+$', 'i'), //give points to someone
  'giveHighFive': new RegExp('^give (\\w)+ a five!?$', 'i'), //give points to someone
}

//for reference: 
//
  // var regex = new RegExp("<@" + client.self.id + ">:\\s(\\w+)", "i");
  // var match = msg.match(regex);  
  
  // if(match){ //if there is a command
  //   return {match[1], ;
  // }else{
  //   return null;
  // } //if   