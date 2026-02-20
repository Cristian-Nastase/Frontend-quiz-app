window.addEventListener("load", getData); 

// First parsing the data, if it's okay, it will go further to effectively load the quiz

let _data;

function getData()
{
    fetch("data.json")
    .then( response => 
        {
            if(!response.ok) return null;
            
            response.json().then( responseData => 
                {
                    _data = responseData?.quizzes;
                    loadQuizMenu(responseData?.quizzes);
                })
            })
            .catch((error) => {console.error(error); return null;});
}

function loadQuizMenu(data)
{
    const menu = document.getElementById("menu");
    const menuButtonsContainer = document.getElementById("menu-buttons-container");

    menuButtonsContainer.replaceChildren();

    if(menu.hasAttribute("aria-hidden")) toggleHide(menu);

    for(let i = 0; i < data.length; i++)
        {
            const button = createMenuButton(data[i]?.title, data[i]?.icon, i);
            
            menuButtonsContainer.appendChild(button);
            
            button.addEventListener("click", function()
            {
                toggleHide(menu);
                quizLogic(data[button.dataset.quizIndex]);
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
    const submitError = document.getElementById("select-error");

    const progress = document.getElementById("progress");

    let currentQuestion = 0;
    let score = 0;
    
    let answerSelected = -1;
    let rightAnswer;

    let canContinue = false;

    function loadQuestion()
    {
        canContinue = false;
        
        const {question, options, answer} = data.questions[currentQuestion];
        
        currentQuestionNumber.innerText = currentQuestion + 1;
        questionText.innerText = question;
        
        rightAnswer = options.indexOf(answer);
        
        answerSelected = -1;
        
        submitAnswerButton.innerText = "Submit answer";

        progress.style.setProperty("--progress", `${(currentQuestion + 1) * 10}%`);

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

        const questionsData = data.questions[currentQuestion].options
        for (let i = 0; i < questionsData.length; i++)
            {
                const button = createQuizButton(questionsData[i], String.fromCharCode(65 + i));
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

    function changeHeader()
    {
        const headerSection = document.getElementById("header-quiz-section");
        const headerImage = document.getElementById("quiz-section-image");
        const headerTitle = document.getElementById("quiz-section-name");

        headerSection.removeAttribute("data-hidden");
        headerSection.classList.remove("hidden");

        headerTitle.innerText = data.title;

        headerImage.src = data.icon;
    }

    // Start the quiz by making it visible
    document.body.style.setProperty("--section-bgColor", returnBgColor(data.title));
    toggleHide(quiz);
    createButtons();
    changeHeader();

    loadQuestion();
    
    submitAnswerButton.addEventListener("click", handleSubmitAnswerButton);
    
    function handleSubmitAnswerButton(e)
    {
        if(answerSelected < 0)
            {
                submitError.classList.remove("hidden");
            }
        else
            {
                if(canContinue)
                    {
                        if(currentQuestion === data.questions.length - 1) 
                        {
                            submitAnswerButton.removeEventListener("click", handleSubmitAnswerButton);                            
                            toggleHide(quiz);
                            showResults(data, score);
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
                        submitError.classList.add("hidden");
                    }   
            } 
    }
}


function showResults(data, score)
{
    const result = document.getElementById("result");
    const resultSectionIcon = document.getElementById("result-section-image");
    const resultSectionTitle = document.getElementById("result-section-title");
    
    const resultScoreText = document.getElementById("final-score");
    const resultQuestionsText = document.getElementById("final-total-questions");

    const playAgain = document.getElementById("play-again");

    toggleHide(result);

    resultSectionIcon.src = data.icon;
    resultSectionTitle.innerText = data.title;

    resultScoreText.innerText = score;
    resultQuestionsText.innerText = data.questions.length;

    playAgain.addEventListener("click", handlePlayAgainClick);

    function handlePlayAgainClick()
    {
        playAgain.removeEventListener("click", handlePlayAgainClick);
        toggleHide(result);
        loadQuizMenu(_data);
    }
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
    
    button.classList.add("quiz__container__button");

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

    icon.style.setProperty("--bgColor", returnBgColor(title));

    button.setAttribute("data-quiz-index", index);
    button.classList.add("right-anim");

    return button;
}

function toggleHide(current)
{
    current.toggleAttribute("inert");
    current.setAttribute("aria-hidden", !current.getAttribute("aria-hidden"));
    current.classList.toggle("hidden");
}

function returnBgColor(title)
{
    let bgColor = 
    {
        html: "var(--orange-400)",
        css: "var(--green-500)",
        javascript: "var(--blue-500)",
        accessibility: "var(--purple-600)" 
    };

    return bgColor[title.toLowerCase()];
}