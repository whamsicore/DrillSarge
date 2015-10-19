/** Fake database for testing purposes */

var testData = require('./testData')

function userTable (){
  data = {}; // contains all user objects, hashed to user_id

  this.findOrCreate = function(user_id){
    if(!data[user_id]){
      data[user_id] = {
        score: Math.floor(Math.random()*50) //give random score to make things interesting
      }
    } //if
    
    return data[user_id]
  } //findOrCreate

} //Users


function answerTable (){

} //Users


function questionTable (){

} //Users


////////////
// EXPORT //
////////////

module.exports = {
  users: new userTable(), 
  answers: new answerTable(), 
  questions: new questionTable(), 

}; //object full of tables 







