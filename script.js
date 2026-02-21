const lightMode = document.getElementById("light-mode");

lightMode.addEventListener("change", switchLightMode);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function()
{
    // it will only call the function if the option from the browser
    // does not match the one selected in the website
    if(this.matches !== lightMode.checked)
        {
            switchLightMode();
            lightMode.checked = this.matches;
        }
});

function switchLightMode()
{
    document.body.classList.toggle("dark-mode");
}

function checkLightMode()
{
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if(prefersDark) document.body.classList.add("dark-mode");
    
    lightMode.checked = prefersDark;
}

window.addEventListener("load", function()
{
    checkLightMode();
    getData()
}); 

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

    if(menu.hasAttribute("aria-hidden")) 
        {
            toggleHide(menu);
            const header = document.getElementById("header-quiz-section");
            toggleHide(header);
        }
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
        function createIcon(type)
        {
            const icon = document.createElement("img");
            icon.classList.add(`right__icon`);
            icon.src = type === "right" ? "assets/images/icon-correct.svg" : "assets/images/icon-error.svg";
            icon.alt = `${type} icon`;
            
            return icon;
        }

        deselectButtons();
        
        const rightIcon = createIcon("right");
        quizButtonsContainer.childNodes[rightAnswer].classList.add("right");
        quizButtonsContainer.childNodes[rightAnswer].appendChild(rightIcon);

        if(rightAnswer !== answerSelected)
            {
                quizButtonsContainer.childNodes[answerSelected].classList.add("wrong");
                const wrongIcon = createIcon("wrong");
                quizButtonsContainer.childNodes[answerSelected].appendChild(wrongIcon);
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
                            deselectButtons();
                            this.classList.add("selected");
                        }
                });
            }
    }
    
    function deselectButtons()
    {
        quizButtonsContainer.childNodes.forEach(element => {
            element.classList.remove("selected");
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
    
    function handleSubmitAnswerButton()
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
    current.setAttribute("aria-hidden", (!current.getAttribute("aria-hidden")).toString());
    current.classList.toggle("hidden");
}

function returnBgColor(title)
{
    const bgColor = 
    {
        html: "var(--orange-50)",
        css: "var(--green-100)",
        javascript: "var(--blue-50)",
        accessibility: "var(--purple-100)" 
    };

    return bgColor[title.toLowerCase()];
}