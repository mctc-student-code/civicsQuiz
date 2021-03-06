 
//finding elements in the html
let indivScore=document.querySelector('#yourScore')
let submitButton = document.querySelector('#submit')
let studentNameInput = document.querySelector('#name')
let nextUserButton = document.querySelector('#nextUser')
let averageButton = document.querySelector('#average')
let averageScoreLabel = document.querySelector('#averageScore')
let questionsUrl = "http://localhost:3000/questions"
let scoresUrl = "http://localhost:3000/scores"
//# for id; . for class

//localStorage.removeItem("Zion") //if you need to remove something or rt click and clear local storage

//note: to stop server-    Control+C 
//to start server - in terminal type this:  node_modules/.bin/json-server --watch server.json        OR up arrow in terminal
//to view server- http://localhost:3000/questions or http://localhost:3000/answers
fetch(questionsUrl) //go the the questionsUrl and fetch the questions //getting a 404 when server is on
    .then( resp => resp.json()) //convert object to JSON
    .then( questions => {
                                //code 304 in terminal means not modified - question file is not modified
            let questionCounter = 1;
            
            let questionContainer = document.querySelector('#question-container')
            questions.forEach(question => { //loop through all of the questions in server.json
            
                let singleQuestElement=document.createElement('div')
                //each question will go in its own div that has the class name 'questions'
                singleQuestElement.classList.add('questions')

                //inside each div the question#  will be a header4 element
                let header = document.createElement('h4')
                header.innerHTML= `Question ${questionCounter}`
                questionCounter++  

                singleQuestElement.appendChild(header) //add the header to the div element

                let questionText= document.createElement('p')
                questionText.innerHTML = question.question //set text of the p element to a question from the server
                singleQuestElement.appendChild(questionText) //add the question to the div
                questionContainer.appendChild(singleQuestElement)

            let allAnswerElements = [] //array to hold all answers
                    //call buildAnswerElement function once for each answer, and add these to the array
            let correct = buildAnswerElement(question.correctAnswer, question.id, true) // is correct answer
            allAnswerElements.push(correct) //add correct to the array

            question.wrongAnswers.forEach (answer =>{ //loop through the wrong answers, and add them to the array
                wrong = buildAnswerElement(answer, question.id, false)
                allAnswerElements.push(wrong)
            })

            allAnswerElements = shuffle(allAnswerElements) //calls function below
    
            allAnswerElements.forEach( function(el) {
                singleQuestElement.appendChild(el) //add all of the answers to the div(item)
            })
        });
        
})

function shuffle(arrayOfElements) {
//from w3resource and stackoverflow
    var currentIndex = arrayOfElements.length, tempValue, randomIndex;
// While there are elements in the array
    while (0!==currentIndex) {
// Pick a random index
        randomIndex = Math.floor(Math.random() * currentIndex);
// Decrease currentIndex by 1
        currentIndex--;
// And swap it w/ current element
        tempValue = arrayOfElements[currentIndex];
        arrayOfElements[currentIndex] = arrayOfElements[randomIndex];
        arrayOfElements[randomIndex] = tempValue;
    }
    return arrayOfElements;
}

/** generic method to make one answer radio button  */
function buildAnswerElement(answerText, questionId, isCorrectAnswer) {
    //create label, create radio button, return element with both in
    let answerEl = document.createElement('div')
    let questionLabel=document.createElement('label')
    questionLabel.innerHTML = answerText

    let radioButton = document.createElement("INPUT");
    radioButton.setAttribute("type", "radio");
    radioButton.setAttribute("name", 'quest' + questionId)
    radioButton.setAttribute("class", "button")
    radioButton.setAttribute("value", answerText)   
     
    //if this is a correct answer, set id to correct 
    if(isCorrectAnswer) {
        radioButton.setAttribute("id", "correct")
    }
    questionLabel.appendChild(radioButton) //link the button and the label
    answerEl.appendChild(questionLabel)

    return answerEl 
}


submitButton.addEventListener('click', function() {  //this is from original local storage
    //when the user clicks the submit button
    //get the student name
    let userName = studentNameInput.value
    // add validation that name >1character
    if(userName.length<1) {
        alert('Enter a user name')
        return
    }
    
    checkForDuplicateName(userName, function(isDupe) {

        if (isDupe) {
            alert('You already took the quiz.')
        }
        else {
    let questions = document.querySelectorAll('.questions')  //select all w/ class 'questions' - all question div elements
        totalScore=calculateScoreForIndiv() //call this function below - returns totalScore
    
        //show person's score after looping is complete
        indivScore.innerHTML = `You scored ${totalScore} out of ${questions.length}`
        
        
        //localStorage.setItem(userName, totalScore)

        //http://localhost:3000/scores",
        let data = {name: userName, score: totalScore}

        fetch(scoresUrl, { 
            method: 'POST',   //post adds scores to json server;  code 201 means created(request has been fulfilled and a new resource created)
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(data) //converting object into JSON using stringify
            })
            .then(resp => { 
                console.log('response from posting score to scores', resp)
            })
        }
})


nextUserButton.addEventListener('click', function() {
    //clear name input
    studentNameInput.value=''
    //clear result field
    indivScore.innerHTML= ""
    //call function to uncheck all radio buttons
    uncheck()  
    })  //call function below to make sure name not already in server.json

   
})

averageButton.addEventListener('click', function() {
    getScoresToChart()
   
})

function getRadioValue(questNumber) {
    let radioButtonEle = document.getElementsByName(questNumber); 
    
      let userAnswer='';
    for(let i = 0; i < radioButtonEle.length; i++) { //loop through radio button elements for each question
        //if the element is checked, then that element's value is the user Answer
        if(radioButtonEle[i].checked) {  
            userAnswer = radioButtonEle[i].value; 
        } 
    } 
    return userAnswer
} 

function uncheck() { //loop through and set all radio buttons to unchecked
    let allRadioButtonEle = document.getElementsByClassName("button"); 
    for(let x=0; x<allRadioButtonEle.length; x++) {
        allRadioButtonEle[x].checked=false
    }
}

function getScoresToChart() {
   // pseudocode - fetch (get scores).then(decode json).then(data => {
            // draw chart here - re-draw the entire chart
    fetch(scoresUrl) 
        .then (resp =>resp.json() )    //converts response to a JSON object
        .then(scores => {
        //call method to draw chart
            chartResultsAndAverage(scores)
    })
   }
 
function checkForDuplicateName(userName, callback) {
    fetch(scoresUrl)  //get scores from server.json
        .then (resp =>resp.json() )    //converts response to a JSON object
        .then(scores => {       
            for (let x=0; x<scores.length; x++) {//loop through all of the names in the json server
               if (userName === scores[x].name) {
                   alert('This name already used. Please add a last name')
                   callback(true)
               }
            }

            callback(false)
            }) 
}

function calculateScoreForIndiv(){  //new function for json program- started from copy of above in submit
    //how to calculate from json
    let totalScore=0
    let questions = document.querySelectorAll('.questions')  
    questions.forEach(function(question) {  // loop though a node list of questions
        wrongAnswerList=[]
        let correctAnswerEl = question.querySelector('#correct')  //find the correct answer for this question
        let correctAnswer = correctAnswerEl.getAttribute('value')
        let questNumber = correctAnswerEl.getAttribute('name') 
        
        //get the user's answer -call the function below - tie it to the correct class
        userAnswer =getRadioValue(questNumber)
    
        if(userAnswer ===correctAnswer) {  //if the two answers are the same, add one to the total
            totalScore++
        }else{ //otherwise, add that question# to the array
            wrongAnswerList.push(questNumber)  
        }  //if the wrong answer list has any elements in it, alert the user
        if (wrongAnswerList.length>0){
            alert('You got these questions incorrect: ' +  wrongAnswerList)
            for(let x=0; x<wrongAnswerList.length; x++){ //loop through list and let user know correct answer
               // alert('The correct answer to ' + wrongAnswerList[x] + ' is '  + correctAnswer)
                alert('The correct answer to question # ' + [x+1] + ' is '  + correctAnswer)
            }
        } 
    })
    return totalScore
}

        
