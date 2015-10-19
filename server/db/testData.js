var testData = {
  


  questions: [
    {
      prompt: "What do you like more?",
      options: [
        'Star Wars', 'Star Trek', 'Niether'
      ]
    }, 
    {
      prompt: "What do you like more?",
      options: [
        'Blue', 'Red', 'Black', 'Orange', 'Yellow', 'Pink', 'Brown', 'Blue', 'Turquoise'
      ]
    }, 
    {
      prompt: "What do you prefer?",
      options: [
        'Walk on the beach', 'Hike in the mountains', 'Going to the mall', 'House party'
      ]
    }, 
    {
      prompt: "What do you prefer?",
      options: [
        'Beauty', 'Brains', 'Character', 'Kindness'
      ]
    }, 
    {
      prompt: "What do you prefer?",
      options: [
        'Intense work out?', 'Nice long walk?'
      ]
    }, 
    {
      prompt: "Best company?",
      options: [
        'Apple', 'Google', 'Facebook', 'Amazon', 'Able'
      ]
    },  
    {
      prompt: "Do you believe ghosts might be real?",
      options: [
        'Yes', 'No', "Don't care"
      ]
    }, 
    { 
      prompt: "Which movie do you like most?",
      options: [ 'The Matrix', 'Mission Impossible', 'The Titanic', 'Anything Pixar']
    },
    { 
      prompt: "Who's better looking?",
      options: ["Brad Pitt", "Nicholas Cage", "Johnny Depp", "I am!", ]
    },
    { 
      prompt: "What sport are you best at?",
      options: ["Basketball", "Soccer", "Tennis", "Swimming"]
    }
  ], // questions
  


  /** Keeps track of user answers so we can ask them later */
  answers: [
    {
      // SAMPLE
      // u_id: 1, // answered by which user
      // q_id: 1, // question id id. e.g. Which movie... 
      // r_index: 2 // response index. e.g. The Titanic
    }
  ], // answers


} // testData