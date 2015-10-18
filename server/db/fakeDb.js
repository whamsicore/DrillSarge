/** Fake database for testing purposes */

var testData = {
  /**
   * Initial seed of test questions
   * @type {Array}
   */
  questions: [
    { 
      id: 1,
      prompt: "Which movie do you like most?",
      answers: [ 'The Matrix', 'Mission Impossible', 'The Titanic', 'Anything Pixar']
    },
    { 
      id: 2,
      prompt: "Who's better looking?",
      answers: ["Brad Pitt", "Nicholas Cage", "Johnny Depp", "I am!", ]
    },
    { 
      id: 3,
      prompt: "What sport are you best at?",
      answers: ["Basketball", "Soccer", "Tennis", "Swimming"]
    }
  ], // questions
  
  /** Keeps track of user answers so we can ask them later */
  answers: [
    {
      q_id: 1, // Which movie... 
      response: 2 // The Titanic
    }
  ], // answers
  /** Users */
  users: [
    {


    }
  ], // answers


} // testData

module.exports = testData; 