/** tag - regex pairs. tag is the name of the command, regex is the regex used to trigger it */

module.exports = {
  'poll': new RegExp('^poll (.+)$', 'i'), 
  'pollErr': new RegExp('^poll$', 'i'), 
  'rollcall': new RegExp('^rollcall$', 'i'), 
  'help': new RegExp('^help$', 'i'), //show available commands
  'random': new RegExp('^random$', 'i'), //show available commands
  'schedule': new RegExp('^schedule$', 'i'), //show schedule for trivia and games
  'about': new RegExp('^about$', 'i'), //show schedule for trivia and games
  'score': new RegExp('^score$', 'i'), //show your own score
  'leaderboard': new RegExp('^leaderboard$', 'i'), //show everyones scores
  'challenge': new RegExp('^challenge$', 'i'), 
  'salute': new RegExp('^salute$', 'i'), 
  'poke': new RegExp('^poke$', 'i'), //say random blurb
  'hungry': new RegExp('^hungry$', 'i'), //yelp restaurants
  'givePoints': new RegExp('^give \\d points to (\\w)+$', 'i'), //give points to someone
  'highfive': new RegExp('^highfive <@(\d+)>$', 'i'), //give points to someone
  'highfiveErr': new RegExp('^highfive$', 'i'), //give points to someone
  'quit': new RegExp('^quit$', 'i'), //give points to someone
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