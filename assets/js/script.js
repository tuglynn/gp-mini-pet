// hungry timer after eating
const HUNGRY = 15;
// poop timer after eating
const POOP = 20;
// happy timer after play
const BORED = 30;
// sick timer after eating too much
const SICK = 40;
// sick timer if cage is not clean
const CLEANCHECK = 50;
// Animal instinct timer - animal will go bored and hungry 
const HANGRY = 50;

// second tracker -> use it for age calculation in the future
let count = 0;

// main render div
const mainDisplay = document.querySelector('.display');
const gameMusic = new Audio('/assets/sound/game.mp3');
const clickSound = new Audio('./assets/sound/pickupCoin.wav');
const gameOver = new Audio('./assets/sound/gameOver.wav');
const musicPlay = document.querySelector('.musicPlay');
musicPlay.addEventListener('click',loopMusic);
function loopMusic (){
    gameMusic.volume = 0.1;
    gameMusic.play();
    gameMusic.loop = true;
}
// main view of all the stats and animation
const displayContainer = document.querySelector('#displayContainer');
const defaultStats = {
    stats: {
        name:'',
        age: 0,
        weight: 2,
        happy: 2,
        hungry: 2,
        sickness: 0,
        poop: 0,
        sleep:false
    },
    actionQueue: []
}
const PET = {
    stats: {
        name:'',
        age: 0,
        weight: 0,
        happy: 4,
        hungry: 4,
        sickness: 0,
        poop: 0,
        sleep:false
    },
    // action tracker
    actionQueue: [],

    instinct() {
        this.beHungry();
        this.beBored();
        setLocalPet();
    },

    isDeath() {
        return this.stats.hungry <= 0 || this.stats.happy <= 0 || this.stats.sickness >= 5;
    },
    mealFed() {
        if (this.stats.hungry >= 4) {
            this.stats.sickness++;
            this.actionQueue.push({
                time: moment().add(SICK, 's').format('X'),
                action: 'beSick'
            });
        } else {
            this.stats.hungry++;
            this.actionQueue.push({
                time: moment().add(POOP, 's').format('X'),
                action: 'poop'
            });
        }
        this.sortActionQueue();
        setLocalPet();
    },
    playGame() {
        if (this.stats.happy < 4) {
            //call mini game function
            // miniGame()
            this.stats.happy++;
            this.actionQueue.push({
                time: moment().add(BORED, 's').format('X'),
                action: 'beBored'
            })
            this.sortActionQueue();
            setLocalPet();
        } else {
            // pet doesnt want to play
            // add denying animation to main view
        }
    },
    beHungry() {
        // console.log('behungry call')
        this.stats.hungry--;
    },
    beBored() {
        this.stats.happy--;
    },
    beSick() {
        console.log('besick call')
        // get more sick
        this.stats.sickness++;
        //alarm user: pet need medicine
    },
    bePooping() {
        console.log('poopping call')
        this.stats.hungry--;
        this.stats.poop++;
        this.actionQueue.push({
            time: moment().add(CLEANCHECK, 's').format('X'),
            action: 'cleanCheck'
        });
        this.sortActionQueue();
        //display poop on screen
    },
    cleanCheck() {
        console.log('cleancheck call')
        if (this.stats.poop > 0) {
            this.stats.sickness++
        };
    },
    beCleaned() {
        this.stats.poop--;
        setLocalPet();
    },
    beVaccininated() {
        if (this.stats.sickness > 0) {
            this.stats.sickness--;
        }
        setLocalPet();
    },
    sortActionQueue() {
        // this.actionQueue.sort((a,b)=>timeCheck(a.time)-timeCheck(b.time))
        if (this.actionQueue.length >= 2) {
            this.actionQueue.sort((a, b) => a.time - b.time)
        };
    }
}

// GETTER
function getLocalPet() {
    console.log(count, PET.stats, PET.actionQueue)
    const PETstats = JSON.parse(localStorage.getItem('myPET')) || defaultStats;
    PET.stats = {...PETstats.stats};
    PET.actionQueue = [...PETstats.actionQueue];
    // console.log(PET);
}
// SETTER
function setLocalPet() {
    const PETstats = {
        stats: PET.stats,
        actionQueue: PET.actionQueue
    };
    localStorage.setItem('myPET', JSON.stringify(PET));
}

// dequeue function
function actionCheck() {
    if (PET.actionQueue.length > 0) {
        //is the first event of action queue past time?
        // past?do stuff and shift:nothing
        if (moment().diff(moment(PET.actionQueue[0].time, 'X'), 's') > 0) {
            switch (PET.actionQueue[0].action) {
                case 'beHungry':
                    PET.beHungry();
                    break;
                case 'beSick':
                    PET.beSick();
                    break;
                case 'beBored':
                    PET.beBored();
                    break;
                case 'poop':
                    PET.bePooping();
                    break;
                case 'cleanCheck':
                    PET.cleanCheck();
                    break;
                default:
                    break;
            }
            PET.actionQueue.shift();
            setLocalPet()
        };
    }
    return;
}
// if pet dies, reset the game
function petDie() {
    gameOver.play();
    const allInputs = document.querySelectorAll('.uiBtn');
    console.log(allInputs);
    allInputs.forEach((input, i) => {
        input.setAttribute('disabled',true);
    });
    document.querySelector('.poop').innerHTML ='';
    mainDisplay.innerHTML = `
            <h2>R.I.P.</h2>
            <img class='w-80' src='./assets/imgs/Death.gif' alt='RIP'/>
            <button class='nes-btn' id="resetBtn">RESET</button>
    `;

    document.querySelector('#resetBtn').addEventListener('click', function () {
        localStorage.clear();
        init();
        
        allInputs.forEach((input, i) => {
            input.removeAttribute('disabled');
        });
        mainDisplay.innerHTML ='';
    });

}
function displayTracker(){
    if(PET.stats.poop>0){
        let htmlTemplate=''
        for(let i =0; i< PET.stats.poop;i++){
            htmlTemplate += '<i class="fa-3x fa-solid fa-poo brown m-2"></i>'
        }
        document.querySelector('.poop').innerHTML = htmlTemplate;
    }else{
        document.querySelector('.poop').innerHTML = '';
    }
}
function gameStart(){
    
    
    loopMusic();
    
    document.querySelector('.startGame').innerHTML = ''; 
    getLocalPet();
    document.querySelector('#petName').innerHTML = `<h2>${PET.stats.name} akachan</h2>`;
    idleDisplay();
    let animalInstinct = setInterval(() => {
        console.log('instinct call')
        if (PET.isDeath()) {
            clearInterval(animalInstinct);
            petDie();
        } else {
            PET.instinct();
        }
    }, HANGRY*1000);
    // get and set localstorage every 5s
    let everySecond = setInterval(() => {
        count++;
        getLocalPet();
        displayTracker()
        if (!PET.isDeath()) {
            // check actionQue and execute the action
            actionCheck()
        } else {
            console.log('pet die');
            clearInterval(everySecond);
            petDie();
        }
    }, 1000);

    setLocalPet();
   
}

function init() {
    
    // what is your pet name
    if(!!!localStorage.getItem('myPET')){
        askPetName();
    }else
    {gameStart()};
    if(!!PET.stats.sleep){
        displayContainer.classList.toggle('is-dark');
    }
}
init();

function askPetName(){
    let htmlTemplate =`
    <div class=''>
    <section class='message-list'>
        <section class='message row askName'>
            <i class='nes-bcrikko col-3 mt-5 is-dark'></i>
            <div class='nes-balloon from-left col-9'>
                <p>What is your pet name?</p>
            </div>
        </section>
        
        <section class='message row mt-5'>
            <div class='nes-balloon from-right col-12'>
                <form id='getName' class='nes-field is-centered'>
                    <label for='petName'>I will call it</label>
                    <input type='text' id='myPetName' class='nes-input'/>
                    <button type='submit' class='nes-btn is-primary mt-2'>Submit</button>
                </form>
            </div>
        </section>
    </section>
    </div>

    `;

    document.querySelector('.startGame').innerHTML = htmlTemplate;

    document.querySelector('#getName').addEventListener('submit',function(e){
        e.preventDefault();
        const petName = document.querySelector('#myPetName');
        
        PET.stats.name=petName.value;
        htmlTemplate = `
        <section class='message-list'>
            <section class='message row askName'>
                <i class='nes-bcrikko col-3 mt-5 is-dark'></i>
                <div class='nes-balloon from-left col-9'>
                    <p class='niceName'><span class='nes-text is-primary'>${PET.stats.name}</span> is a very nice name!</p>
                    <p> Want to start the game?</p>
                </div>
            </section>
            <section class='message row mt-5'>
                <div class='nes-balloon from-right col-12'>
                    <form id='getName' class='nes-field is-centered'>
                        <button type='submit' class='nes-btn is-primary mt-2' onclick='gameStart' >Yeah! Let's do it!</button>
                    </form>
                </div>
            </section>
        </section
        `;
        document.querySelector('.startGame').innerHTML = htmlTemplate;
        PET.stats.hungry = 4;
        PET.stats.happy = 4;
        PET.stats.sickness=0;
        PET.stats.sleep=false;
        PET.stats.poop = 0;   
        setLocalPet();    
    })
}


/* INTERACTION */
// FEED button
document.querySelector('#feed').addEventListener('click', function () {
   
    clickSound.play();
    PET.mealFed();

    mainDisplay.innerHTML = `
    <div >
        <h2 class='text-center'>Give your pet some foods</h2>
        <div class="Character" style='top:150px;left:150px;'>
            <img id='petAnimation' class="Character_spritesheet pixelart lick" src="./sprite/img/cat.jpeg" alt="Character" />
        </div>
        <div style='position:absolute; top:330px;left:200px;'>
            <i class=" fa-solid fa-bowl-food brown fa-3x"></i>
        </div>
    </div>
    `;
})

// Light Button
document.querySelector('#light').addEventListener('click', function () {
    
    clickSound.play();  
    mainDisplay.innerHTML = `
        <div class=''>
            <h2>Light View</h2>
            <p> Toggle Light Switch to toggle pet Sleeping mode</p>        
            <button onClick='lightToggle()' class='nes-btn'>${PET.stats.sleep?'On':'Off'}</button>    
        </div>
    `;
})
function lightToggle(){
    PET.stats.sleep = !PET.stats.sleep;
    displayContainer.classList.toggle('is-dark');
    mainDisplay.innerHTML = `
        <div class=''>
            <h2>Light View</h2>
            <p> Toggle Light Switch to toggle pet Sleeping mode</p>      
            <button onClick='lightToggle()' class='nes-btn'>${PET.stats.sleep?'On':'Off'}</button>    
        </div>
    `;
    
}
// Play Button
document.querySelector('#play').addEventListener('click', function () {
    
    clickSound.play();
    PET.playGame();
    setLocalPet();
    mainDisplay.innerHTML = `<h2>Play View</h2>
        <p> Play Animation</p>
        <p> Random number [0-9] and display: RnNum1</p>
        <p> prompt user to press lesser or greater button</>
        <button><</button> <button>></button>
        <p> then generate another random number from [0-9] and doesnt containt the prev random number: RnNum2</p>        
        <p> user (RnNum1 - RnNum2) to compare with userInput</p>
        <p> if user win 3 out of 5 times, +1 to happiness stat</p>
    `;
})

// Medicine Button
document.querySelector('#medicine').addEventListener('click', function () {
    clickSound.play();
   
    PET.beVaccininated();
    mainDisplay.innerHTML = `
        <div class='text-center'>
        <h2>Gave you pet some drugs</h2>
        <img src='./assets/imgs/medicine.gif' alt='pet takes medicine'/>
        </div>
    `;
})


// Clean Button
document.querySelector('#clean').addEventListener('click', function () {
    clickSound.play();
    PET.beCleaned();
    displayTracker();
    mainDisplay.innerHTML = `
        <div class='text-center'>
            <h2>Groom your pet</h2>
            <img src='./assets/imgs/clean-vacuum.gif' alt='clean up' style='width:100%;height:auto;'/>
        </div>
    `;
})

// Stat Button
document.querySelector('#stats').addEventListener('click', function () {
    clickSound.play();
    
    let htmlTemplate = `<div class="container">
    <div class="row">
      <div class="col-md-10 nes-container with-title is-rounded">
        <p class="title">STATS</p>
        <section class="icon-list">`
    htmlTemplate +=`<p>Hungry</p>`;
    for(let i=1; i<5;i++){
        if(i<=PET.stats.hungry){
            htmlTemplate+= `<i class="nes-icon is-medium star"></i>`
        }else{
            htmlTemplate += `<i class="nes-icon is-medium star is-empty"></i>`
        }
    }
    htmlTemplate += `<p>Happy</p>`;
    for(let i=1;i<5;i++){
        if(i<=PET.stats.happy){
            htmlTemplate+= `<i class="nes-icon is-medium like"></i>`
        }else{
            htmlTemplate+=`<i class="nes-icon is-medium like is-empty"></i>`
        }

    }
    htmlTemplate += `<p>Health</p>`;
    for(let i=4;i>0;i--){
        htmlTemplate +=`<i class='nes-icon is-medium ${i>PET.stats.sickness?'heart':'heart is-empty'}'></i>`
    }

    htmlTemplate += `      
        </section>
      </div>
    </div>`;
    mainDisplay.innerHTML = htmlTemplate;
    
})

// Discipline Button
document.querySelector('#discipline').addEventListener('click', function () {
    clickSound.play();
    
    fetch('https://api.kanye.rest').then((res) => res.json()).then((data) => {
        console.log(data)
        mainDisplay.innerHTML = `
        <div>
            <h2 class='text-center mb-5'>Kanye's inpiration</h2>
        <section class='message-list'>
            <section class='message row'>
                <div class='col-2 align-self-end nes-container is-rounded p-0 mt-5'> 
                    <img src='https://64.media.tumblr.com/070d70ca75a9f9b1a3dc9a33ee22056b/tumblr_p7s4gfz4rw1tssg0jo1_1280.gifv' alt='kanye' class='w-100 h-100' style='image-rendering:pixelated;'>
                </div>
                <div class='nes-balloon from-left col-9 is-dark mb-5'>
                    <quoteblock>"${data.quote}"</quoteblock>
                </div>
                
            </section>
        </section>
        
        </div>
        
    `;
    });
    PET.playGame();
    setLocalPet();
})


// Play Button
document.querySelector('#attention').addEventListener('click', function () {
   
    clickSound.play();
    idleDisplay();
    
    
})

function idleDisplay(){
    mainDisplay.innerHTML = `
    <div class="Character moving">
        <img id='petAnimation' class="Character_spritesheet pixelart face-right" src="./sprite/img/cat.jpeg" alt="Character" />
    </div>
    `;
    petAnimation();
}

function petAnimation(){
    const walkContainer = document.querySelector('#petAnimation');
    let petMoving = setInterval(() => {
        
        if(!!document.querySelector('.Character') && document.querySelector('.Character').classList.contains('moving')){
            if(walkContainer.classList.contains('face-right')){
                walkContainer.classList.toggle('face-right');
                walkContainer.classList.toggle('face-down');
            }else if (walkContainer.classList.contains('face-down')){
                walkContainer.classList.toggle('face-down');
                walkContainer.classList.toggle('face-left');
            }else if (walkContainer.classList.contains('face-left')){
                walkContainer.classList.toggle('face-left');
                walkContainer.classList.toggle('face-up');
            }else if (walkContainer.classList.contains('face-up')){
                walkContainer.classList.toggle('face-up');
                walkContainer.classList.toggle('face-right');
            }else{
                walkContainer.classList.toggle('face-right');
            }
        }
        else{
            clearInterval(petMoving)
        }
    }, 6000);
}