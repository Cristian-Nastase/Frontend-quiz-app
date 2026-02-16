window.addEventListener("load", getData);

// First parsing the data, if it's okay, it will go further to effectively load the quiz

function getData()
{
    fetch("data.json")
    .then( response => 
        {
            if(!response.ok) return null;
            
            response.json().then( responseData => 
                {
                    loadQuizMenu(responseData?.quizzes);
                })
            })
            .catch((error) => {console.error(error); return null;});
}


function loadQuizMenu(data)
{
    const menu = document.getElementById("menu");
    const menuButtonsContainer = document.getElementById("menu-buttons-container");

    for(let i = 0; i < data.length; i++)
        {
            const button = createMenuButton(data[i]?.title, data[i]?.icon, i);
            
            menuButtonsContainer.appendChild(button);
            
            button.addEventListener("click", function()
            {
                toggleHide(menu);
                quizLogic(data[button.dataset.quizIndex].questions);
            });
        }
}

function quizLogic(data)
{    
    const quiz = document.getElementById("quiz");
    const questionText = document.getElementById("quiz-question");
    const currentQuestionNumber = document.getElementById("current-question");
    const quizButtonsContainer = document.getElementById("quiz-buttons-container");

    const submitAnswerButton = document.getElementById("submit-answer");

    let currentQuestion = 0;
    let score = 0;
    
    let answerSelected = -1;
    let rightAnswer;

    let canContinue = false;

    function loadQuestion()
    {
        canContinue = false;

        const {question, options, answer} = data[currentQuestion];

        currentQuestionNumber.innerText = currentQuestion + 1;
        questionText.innerText = question;

        rightAnswer = options.indexOf(answer);

        answerSelected = -1;

        submitAnswerButton.innerText = "Submit answer";

        createButtons();
    }

    function checkAnswer()
    {
        quizButtonsContainer.childNodes[rightAnswer].classList.add("right");
        
        if(rightAnswer !== answerSelected)
            {
                quizButtonsContainer.childNodes[answerSelected].classList.add("wrong");
            }
        else
            {
                score += 1;
            }
    }

    function createButtons()
    {
        quizButtonsContainer.replaceChildren();

        const currentData = data[currentQuestion].options
        for (let i = 0; i < currentData.length; i++)
            {
                const button = createQuizButton(currentData[i], String.fromCharCode(65 + i));
                quizButtonsContainer.appendChild(button);

                button.setAttribute("data-index", i);
                button.addEventListener("click", function()
                {
                    if(!canContinue)
                        {
                            answerSelected = parseInt(this.dataset.index);
                            this.classList.add("selected");
                            deselectOtherButtons();
                        }
                });
            }
    }
    
    function deselectOtherButtons()
    {
        quizButtonsContainer.childNodes.forEach(element => {
            if (element.dataset.index != answerSelected) element.classList.remove("selected");
        });
    }

    // Start the quiz by making it visible
    toggleHide(quiz);
    createButtons();

    loadQuestion();
    
    submitAnswerButton.addEventListener("click", (e) =>
    {
        if(answerSelected < 0)
            {
                return;
            }
        else
            {
                if(canContinue)
                    {
                        if(currentQuestion === data.length - 1) 
                        {
                            e.stopPropagation();
                            toggleHide(quiz);
                            showResults(score);
                        }
                        else
                        {
                            currentQuestion += 1;
                            loadQuestion(); 
                        }
                    }
                else
                    {
                        checkAnswer();
                        canContinue = true;
                        submitAnswerButton.innerText = "Next question";
                    }   
            } 
    });
}


function showResults(score)
{
    console.log(score);
    return score;
}

// Creating the buttons 

function buttonTemplate(title)
{
    const button = document.createElement("button");
    button.classList.add("button");
    button.classList.add("text-preset-4");
    
    const icon = document.createElement("div");
    icon.classList.add("button__icon");
    
    const paragraph = document.createElement("p");
    paragraph.innerText = title;

    button.appendChild(icon);
    button.appendChild(paragraph);

    return { button, icon, paragraph };
}

function createQuizButton(title, variant)
{
    const { button, icon, paragraph } = buttonTemplate(title);
    
    icon.innerText = variant;

    paragraph.innerText = title;

    return button;
}

function createMenuButton(title, iconPath, index)
{
    const { button, icon, paragraph } = buttonTemplate(title);

    const img = document.createElement("img");
    img.src = iconPath;
    img.alt = "logo";
    icon.appendChild(img);

    let bgColor;
    switch(title.toLowerCase())
    {
        case "html":
            bgColor = "var(--orange-400)";
            break;
        case "css":
            bgColor = "var(--green-500)";
            break;
        case "javascript":
            bgColor = "var(--blue-500)";
            break;
        case "accessibility":
            bgColor = "var(--purple-600)";
            break;
    }

    icon.style.setProperty("--bgcolor", bgColor);

    button.setAttribute("data-quiz-index", index);

    return button;
}

function toggleHide(current)
{
    current.toggleAttribute("inert");
    current.setAttribute("aria-hidden", !current.getAttribute("aria-hidden"));
    current.classList.toggle("hidden");
}