const FILE_PATH = '../src/slowa.txt';
const letters = ["a", "ą", "b", "c", "ć", "d", "e", "ę", "f", "g", "h", "i", "j", "k", "l", "ł", "m", "n", "ń", "o", "ó", "p", "r", "s", "ś", "t", "u", "w", "y", "x", "z", "ź", "ż", "q", "v"];
let numberOfGamesInt;
let letterNumber;
let letter;
var text = "";
var length;
var wonhidden = true;

// Changes Capslock to small
document.addEventListener('keydown', function (e) {
    if(e.getModifierState && (e.getModifierState('CapsLock') || e.getModifierState('Shift'))){
        e.preventDefault();
        CapslockModal();
    }
});

// Dark Mode - Light Mode 
let lightModeToggled = localStorage.getItem('lightModeToggled');
const lightModeToggle = document.getElementById('slonce');
const darkModeToggle = document.getElementById('ksiezyc')

if(lightModeToggle != "enabled" && lightModeToggle != "disabled"){
    darkModeToggle.style.display="inline-block";
    lightModeToggle.style.display="none";
}

if(lightModeToggled == "enabled"){
    document.body.classList.add('lightMode');
    darkModeToggle.style.display="none";
    lightModeToggle.style.display="inline-block";
}
if(lightModeToggled == "disabled"){
    darkModeToggle.style.display="inline-block";
    lightModeToggle.style.display="none";
}

darkModeToggle.addEventListener("click", () => {
    localStorage.setItem("lightModeToggled", "enabled");
    lightModeToggled = localStorage.getItem("lightModeToggled");
    darkModeToggle.style.display="none";
    lightModeToggle.style.display="inline-block";
    document.body.classList.add('lightMode');
    console.log(lightModeToggled);
});

lightModeToggle.addEventListener("click", () => {
    localStorage.setItem("lightModeToggled", "disabled");
    lightModeToggled = localStorage.getItem("lightModeToggled");
    darkModeToggle.style.display="inline-block";
    lightModeToggle.style.display="none";
    document.body.classList.remove('lightMode');
    console.log(lightModeToggled);
});

//Gets a random word;
async function getWord() {
    try {
        const response = await fetch(FILE_PATH);
        const fileContent = await response.text();
        
        var words = fileContent.split(/\s+/);
        
        var randomIndex = Math.floor(Math.random() * words.length);
        
        return words[randomIndex];
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}
//Assign random word to a gameTable;
async function assignWord(){
    var wordDiv = document.getElementById("creating");
    var randomWord = await getWord();
    randomWord = randomWord.toLowerCase();
    wordDiv.setAttribute("data-rword", randomWord);
}
// Resets the game
function resetGame(){
    document.getElementById('wrapper').innerHTML = '';
    CreateNumberOfGames();
}

// Asks player for number of games and returns to CreateNumberOfGames()
function getNumberOfGames(){
    // Gets number of games on load;
    var numberOfGames = prompt("Wpisz ilość gier:", "1");
    while(numberOfGames == null || numberOfGames == ""){
        numberOfGames = prompt("Wpisz ilość gier:", "1");
    }
    numberOfGamesInt = parseInt(numberOfGames);
    // numberOfGamesInt = 1;
    return numberOfGamesInt;
}

//Creates number of games 
function CreateNumberOfGames(){
    var numberOfGames = getNumberOfGames();
    var gameTable;
    var gameRow;
    var gameCell;
    var numberOfRows = 5+numberOfGames;
    for(var i = 0; i < numberOfGames; i++){
        // Creating Game Table;
        gameTable = document.createElement("div");
        gameTable.classList.add("game_rows");
        gameTable.setAttribute("id", "creating");
        document.getElementById("wrapper").appendChild(gameTable);
        assignWord();
        for(var j = 0; j < numberOfRows; j++){
            //Creating Rows;
            gameRow = document.createElement("div");
            gameRow.classList.add("row");
            gameRow.classList.add("unused");
            gameRow.setAttribute("id", "editing")
            document.getElementById("creating").appendChild(gameRow);
            for(var k = 0; k < 5; k++){
                //Creating Cells;
                gameCell = document.createElement("div");
                gameCell.classList.add("row-letter");
                gameCell.classList.add("letter-unused");
                document.getElementById("editing").appendChild(gameCell);
            }
            gameRow.removeAttribute("id");
        }
        gameTable.removeAttribute("id");
    }
    changeElementsToActive();
    createKeyboard();
    CreateModals();
}
// If game in this table hasn't ended yet, change next row to active
function changeElementsToActive(){
    changeElementsToDone();
    let divs = document.querySelectorAll('div.game_rows');
    divs.forEach(div => {
        let done = div.querySelector(".locked")
        if(!done){
            let ChildRow = div.querySelector(".unused");
            if(ChildRow) {
                let cells = ChildRow.querySelectorAll(".letter-unused");
                cells.forEach(cell => {
                    cell.classList.add("active-cell");
                    cell.classList.remove("letter-unused")
                })
            ChildRow.classList.remove("unused");
            ChildRow.classList.add("active-row");
            }
        }
    });
    KeyboardColorLoop()

}
// Change current row to done
function changeElementsToDone(){
    let divs = document.querySelectorAll('div.game_rows');
    divs.forEach(div => {
        let ChildRow = div.querySelector(".active-row");
        if(ChildRow) {
            let cells = ChildRow.querySelectorAll(".active-cell");
            cells.forEach(cell => {
                cell.classList.add("done-cell");
                cell.classList.remove("active-cell")
            })
            ChildRow.classList.remove("active-row");
            ChildRow.classList.add("done-row");
        }
    });
}

// Keyhandler
function addLetter(){
        document.getElementById('input').addEventListener("keyup", function(event1) {
        // Removes last letter (backspace)
        if (event1.key === "Backspace" || event1.key === "Delete" ) {
            let divs = document.querySelectorAll('div.game_rows');
            divs.forEach(div => {
                let ChildRow = div.querySelector(".active-row");
                if(ChildRow) {
                    if(ChildRow.querySelectorAll(".typed").length){
                        let deleteds = ChildRow.querySelectorAll(".typed");
                        var deleted = deleteds[deleteds.length -1];
                        deleted.classList.remove("typed");
                        deleted.classList.add("active-cell");
                        deleted.innerHTML = "";
                    }
                }
            });
        }
        // Checks and Accepts the word typed in input
        else if (event1.key === "Enter" && checkLength() == 5){
            if(ifWordinFile().then(found => {
                if(found) {
                    ColorTheWord();
                    changeElementsToActive();
                    document.getElementById('input').value = "";
                    CheckForEnd()
                }
                else {
                    console.log('Podane słowo nie należy do listy');
                }
            }));        }
        // Changes current box from active to typed ( checkLetter actually adds a letter to box )
        else {
            if(letters.includes(event1.key)){
                if(checkLength() > checkBoxLength()){
                    clearInput();
                    let divs = document.querySelectorAll('div.game_rows');
                    divs.forEach(div => {
                        let ChildRow = div.querySelector(".active-row");
                        if(ChildRow) {
                            let cell = ChildRow.querySelector(".active-cell");
                            let celltyped = ChildRow.querySelectorAll(".typed").length;
                            if(cell){
                                    checkLetter(cell, celltyped);
                                    cell.classList.add("typed");
                                    cell.classList.remove("active-cell")
                                }
                        }
                    });
                }

            }
            else { clearInput(); lowerInput();}    
        }
        lowerInput();
    });
}
addLetter();

// Filters input
function clearInput(){
    document.getElementById('input').addEventListener("keyup", function(event1) {
        var input = event1.target.value;
        var clearedInput = input.split('').filter(letter => letters.includes(letter.toLowerCase())).join('');
        event1.target.value = clearedInput;
    });
}
// Lowers all of the letters in input
function lowerInput(){
    var input = document.getElementById('input');
    var val = document.getElementById('input').value;
    input.value = val.toLowerCase();

}
// Actually adds a letter to a box
function checkLetter(cell, celltyped){
    text = document.getElementById('input').value;
    letter = text[celltyped];
    cell.innerHTML = letter.toLowerCase();    
}
// Returns input length of value
function checkLength(){    
    text = document.getElementById('input').value;
    length = text.length;
    return length;
}
// Returns how many boxes have been filled already from the active row
function checkBoxLength(){
    let row = document.querySelector('div.active-row');
    if(row) {
        let boxNumber = row.querySelectorAll('.typed').length;
        return boxNumber;
    }
}
// Checks if sent word is in the 'words file' 
async function ifWordinFile(){
    text = document.getElementById('input').value;
    try {
        var response = await fetch(FILE_PATH);
        if(!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        var data = await response.text();
        return data.includes(text);
    }
    catch (error){
        console.error(`Error fetching or processing the file: `, error);
        return false;
    }
}
// Colors each checkbox with a coresponding color
function ColorTheWord(){
    let divs = document.querySelectorAll('div.game_rows');
    var dataWord;
    var cellLetter;
    var colorY = false;
    var colorG = false;
    divs.forEach(div => {
        dataWord = div.getAttribute('data-rword');
        let ChildRow = div.querySelector(".active-row");
        if(ChildRow) {
            let cells = ChildRow.querySelectorAll(".typed");
            text = document.getElementById('input').value;
            cellid = 0;
            greenAmmount = 0;
            cells.forEach(cell => {
                cell.classList.add("grey");
                cellLetter = cell.innerHTML;
                for(let i = 0; i < 5; i++){
                    if(cellLetter.toString() == dataWord[i].toString()){
                        colorY = true;
                    }
                }
                if(cellLetter.toString() == dataWord[cellid].toString()){
                    colorG = true;
                }
                if(colorY == true){
                    colorY = false; 
                    cell.classList.add("yellow"); 
                    cell.classList.remove("grey");
                }
                if(colorG == true){
                    colorG = false;
                    cell.classList.remove("yellow");
                    cell.classList.add("green");
                    greenAmmount++;

                }
                cellid++;
            })
            if(greenAmmount == 5){
                let rows = div.querySelectorAll('div.row');
                rows.forEach(row => {
                    row.classList.remove("active-row");
                    row.classList.remove("unused");
                    row.classList.add("locked");
                    div.classList.add("won");
                    ResetKeyColor()
                })
                changeHiden(wonhidden)
            }
        }
    });
}

// Checks if the game has ended (0 tries left or the game is won)
function CheckForEnd(){
    var TablesWon = document.querySelectorAll(".won");
    var countTablesWon = TablesWon.length;
    
    var RowsUnused = document.querySelectorAll(".unused");
    var countRUnused = RowsUnused.length;
    var RowsActive = document.querySelectorAll(".active-row");
    var countRActive = RowsActive.length;

    var rwordsList = document.querySelectorAll('[data-rword]')
    var rwordsString = Array.from(rwordsList).map((rword, index) => `${index + 1}. ${rword.getAttribute('data-rword')}`).join(', ');
    
    if(countTablesWon == numberOfGamesInt){
        GameEndModal(true, rwordsString);
    }
    else {
        if(countRActive == 0 && countRUnused == 0){
            GameEndModal(false, rwordsString);
        }
    }
}

// Debuger
// document.getElementById('input').addEventListener('keyup', function (event) {
//     // console.log(document.getElementById('input').value.toString());
//     CheckForEnd();
// });

// document.getElementById('input').addEventListener('keydown', function (e) {
//     if(e.repeat){
//         e.preventDefault();
//     }
// });

// Keyboard
function createKeyboard(){
    let topRow = ['Q','W','E','Ę','R','T','Y','U','I','O','Ó','P'];
    let midRow = ['A','Ą','S','Ś','D','F','G','H','J','K','L','Ł'];
    let botRow = ['Z','Ż','Ź','X','C','Ć','V','B','N','Ń','M'];
    let keyboard = document.createElement("div");
    keyboard.classList.add("keyboard");
    keyboard.setAttribute("id", "keyboard");
    document.getElementById("wrapper").appendChild(keyboard);

    // Top-Row
    let topRowDiv = document.createElement("div");
    topRowDiv.classList.add("keyboardRow");
    topRowDiv.setAttribute("id", "topKeyboard");
    document.getElementById("keyboard").appendChild(topRowDiv);
    
    topRow.forEach(letter => {
        button = document.createElement("div");
        button.classList.add("keyboard-button");
        button.setAttribute("data-char", letter);
        button.setAttribute("data-game", letter.toLowerCase());
        button.innerHTML = letter;
        topRowDiv.appendChild(button);
    });
    // Mid-Row    
    let midRowDiv = document.createElement("div");
    midRowDiv.classList.add("keyboardRow");
    midRowDiv.setAttribute("id", "midKeyboard");
    document.getElementById("keyboard").appendChild(midRowDiv);
    
    midRow.forEach(letter => {
        button = document.createElement("div");
        button.classList.add("keyboard-button");
        button.setAttribute("data-char", letter);
        button.innerHTML = letter;
        midRowDiv.appendChild(button);
    });
    // Bot-Row
    let botRowDiv = document.createElement("div");
    botRowDiv.classList.add("keyboardRow");
    botRowDiv.setAttribute("id", "botKeyboard");
    document.getElementById("keyboard").appendChild(botRowDiv);
    
    botRow.forEach(letter => {
        button = document.createElement("div");
        button.classList.add("keyboard-button");
        button.setAttribute("data-char", letter);
        button.innerHTML = letter;
        botRowDiv.appendChild(button);
    });

    // Adds space at the bottom of the page for keyboard to not overlay the game
    let space = document.createElement("div");
    space.setAttribute("id", "maxPage");
    document.getElementById('wrapper').appendChild(space);
}
// Keyboard animation on key clicked
document.addEventListener('keydown', function(event){
    let inputValue = document.getElementById('input').value;
    let char = event.key;
    var key = document.querySelector('[data-char*="' + char.toUpperCase() + '"]');
    if (!key) return
    key.setAttribute('data-pressed', 'on');
    setTimeout(function () {
        key.removeAttribute('data-pressed');
    }, 200);
})

// Adds Color to the keys
function KeyboardColorLoop(){
    let activeTable = document.querySelector('div.game_rows:not(.won)');
    if(activeTable != null){
        let divs = activeTable.querySelectorAll('div.done-row');
        divs.forEach(div => {
            let letters = div.querySelectorAll('div.typed');
            letters.forEach(letter => {
                let letterKey = letter.innerHTML;
                var keyboardKey = document.querySelector('[data-char*="' + letterKey.toUpperCase() + '"]');
                if(letter.classList.contains('green')){
                    keyboardKey.classList.add('green');
                    keyboardKey.classList.remove('yellow');
                    keyboardKey.classList.remove('grey');
                }
                else if(letter.classList.contains('yellow') && !keyboardKey.classList.contains('green')){
                    keyboardKey.classList.add('yellow');
                    keyboardKey.classList.remove('grey');
                }
                else if(letter.classList.contains('grey') && !keyboardKey.classList.contains('yellow') && !keyboardKey.classList.contains('green')){
                    keyboardKey.classList.add('grey');
                }
            })
        })
    }
}
//Resets KeyColor
function ResetKeyColor(){
    var keyboardKeys = document.querySelectorAll('div.keyboard-button');
    keyboardKeys.forEach(keyboardKey => {
        keyboardKey.classList.remove('green');
        keyboardKey.classList.remove('yellow');
        keyboardKey.classList.remove('grey');
    })
    KeyboardColorLoop()
}

//Create Modals
function CreateModals(){
    // capslock modal
    let capslock = document.createElement("div");
    capslock.classList.add("modal");
    capslock.setAttribute("id", "modalCapslock");
    document.getElementById("wrapper").appendChild(capslock);
    let warning = document.createElement("h2");
    warning.innerHTML = "WYŁĄCZ CAPSLOCK"
    warning.style.color = "rgb(255, 0, 0)";
    capslock.appendChild(warning);
    // at the end of the game modal
    let endModal = document.createElement("div");
    endModal.classList.add("modal");
    endModal.setAttribute("id", "modalEnd");
    document.getElementById("wrapper").appendChild(endModal);
    // creates blury overlay
    let overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.setAttribute("id", "overlay");
    document.getElementById("wrapper").appendChild(overlay);

}
// Close every modal on overlay click
function closeModals(){
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('active-overlay');
    const capsModal = document.getElementById('modalCapslock');
    if(capsModal.classList.contains('active-modal')) { capsModal.classList.remove('active-modal'); }
    const endModal = document.getElementById('modalEnd');
    if(endModal.classList.contains('active-modal')) { endModal.classList.remove('active-modal'); resetGame(); }
}

document.addEventListener('click', (e) => {
    let CapsModal = document.getElementById('modalCapslock');
    let EndModal = document.getElementById('modalEnd');
    if(!CapsModal.contains(e.target) || !EndModal.contains(e.target)){
        closeModals();
    }
});


// Capslock modal action
function CapslockModal(){
    const openCapsModal = document.getElementById('modalCapslock');
    const overlay = document.getElementById('overlay');
    openCapsModal.classList.add('active-modal');
    overlay.classList.add('active-overlay');
}

// End Game Modal action
function GameEndModal(won, rwordsString){
    let message = "";
    if(won == true){message = "Wygrałaś!!!";}
    else {message = "Przegrałaś :((";}
    const openEndModal = document.getElementById('modalEnd');
    const overlay = document.getElementById('overlay');

    let headea = document.createElement("h2");
    headea.innerHTML = message;
    headea.style.color = "rgb(0,0,0)";
    openEndModal.appendChild(headea);

    let hrka = document.createElement("hr");
    openEndModal.appendChild(hrka)

    let listofWords = document.createElement("p");
    listofWords.innerHTML = "Twoimi słowami były: <br>" + rwordsString;
    listofWords.style.color = "rgb(0,0,0)";
    openEndModal.appendChild(listofWords);

    openEndModal.classList.add('active-modal');
    overlay.classList.add('active-overlay');
}

// CLOSING MECHANISMS

    // Changes visibiliy icon on-off, Hides and Unhides won games
    document.getElementById('visOff').style.setProperty("display", "none");
function showHiddenChange(){
    let visOn = document.getElementById('visOn');
    let visOff = document.getElementById('visOff');

    if(wonhidden == true){
        wonhidden = false;
        visOn.style.setProperty("display", "none");
        visOff.style.removeProperty("display");
        changeHiden(wonhidden);
    }
    else {
        wonhidden = true;
        visOn.style.removeProperty("display");
        visOff.style.setProperty("display", "none");
        changeHiden(wonhidden);
    }
}
function changeHiden(wonhidden){
    let divs = document.querySelectorAll('div.won');
    if(wonhidden != true){
        divs.forEach(div => {
            div.style.setProperty("display", "none");
        });
    }
    else {
        divs.forEach(div => {
            div.style.removeProperty("display");
        });
    }
}
