const POOP = 1 * 20;
const HUNGRY = 15;
const BORED = 1 * 30;
const SICK = 1 * 40;
const CLEANCHECK = 1 * 50;
let count = 0;
const HANGRY = 50 * 1000;
const mainDisplay = document.querySelector('.display');
const defaultStats = {
    stats: {
        age: 0,
        weight: 2,
        happy: 2,
        hungry: 2,
        sickness: 0,
        poop: 0,
    },
    actionQueue: []
}
const PET = {
    stats: {
        age: 0,
        weight: 0,
        happy: 0,
        hungry: 0,
        sickness: 0,
        poop: 0,
    },
    // action tracker
    actionQueue: [],

    instinct() {
        this.beHungry();
        this.beBored();
        setLocalPet();
    },

    isDeath() {
        return this.stats.hungry <= 0 || this.stats.happy <= 0 || this.stats.sickness == 5;
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
        this.stats.poop = 0;
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
    console.log(count*5, PET.stats, PET.actionQueue)
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

function petDie() {
    const allInputs = document.querySelectorAll('button');
    allInputs.forEach((input, i) => {
        input.setAttribute('disabled', true);
    });
    mainDisplay.innerHTML = `
            <h2>PET DIE VIEW</h2>
            <button id="resetBtn">RESET</button>
    `;

    document.querySelector('#resetBtn').addEventListener('click', function () {
        localStorage.clear();
        init();
        allInputs.forEach((input, i) => {
            input.removeAttribute('disabled');
        });
        displayStats();
    });

}


function init() {
    getLocalPet();
    let animalInstinct = setInterval(() => {
        console.log('instinct call')
        if (PET.isDeath()) {
            clearInterval(animalInstinct);
            petDie();
        } else {
            PET.instinct();
        }
    }, HANGRY);
    // get and set localstorage every 5s
    let every5Second = setInterval(() => {
        count++;
        getLocalPet()
        if (!PET.isDeath()) {
            // check actionQue and execute the action
            actionCheck()
        } else {
            console.log('pet die');
            clearInterval(every5Second);
            petDie();
        }
    }, 5000);

    setLocalPet();
}
init()





/* VIEW */
function displayStats() {
    mainDisplay.innerHTML = `
        <p>Age: ${PET.stats.age}</p>
        <p>Happy: ${PET.stats.happy}</p>
        <p>Hungry: ${PET.stats.hungry}</p>
        <p>Sickness: ${PET.stats.sickness}</p>
        <p>Poop: ${PET.stats.poop}</p>
    `;

}



/* INTERACTION */
// FEED button
document.querySelector('#feed').addEventListener('click', function () {
    PET.mealFed();

    mainDisplay.innerHTML = `<h2>Feed View</h2>
        <p> Feed Animation</p>
    `;
})

// Light Button
document.querySelector('#light').addEventListener('click', function () {
    mainDisplay.innerHTML = `<h2>Light View</h2>
        <p> Light Animation</p>
    `;
})

// Play Button
document.querySelector('#play').addEventListener('click', function () {
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
    PET.beVaccininated();
    mainDisplay.innerHTML = `<h2>Medicine View</h2>
        <p> Med Animation</p>
    `;
})


// Clean Button
document.querySelector('#clean').addEventListener('click', function () {
    PET.beCleaned();
    mainDisplay.innerHTML = `<h2>clean View</h2>
        <p> clean Animation</p>
    `;
})

// Stat Button
document.querySelector('#stats').addEventListener('click', function () {
    mainDisplay.innerHTML = `
        <p>Age: ${PET.stats.age}</p>
        <p>Weight: ${PET.stats.weight}</p>
        <p>Happy: ${PET.stats.happy}</p>
        <p>Hungry: ${PET.stats.hungry}</p>
        <p>Sickness: ${PET.stats.sickness}</p>
        <p>Poop: ${PET.stats.poop}</p>
    `;
})

// Discipline Button
document.querySelector('#discipline').addEventListener('click', function () {
    fetch('https://api.kanye.rest').then((res) => res.json()).then((data) => {
        console.log(data)
        mainDisplay.innerHTML = `<h2>Kanye's inpiration</h2>
        
        <quoteblock>"${data.quote}"</quoteblock>
        <p>Drop the Kanye animation here</p>
    `;
    });
    PET.playGame();
    setLocalPet();
})


// Play Button
document.querySelector('#attention').addEventListener('click', function () {
    mainDisplay.innerHTML = `<h2>Attention View</h2>
        <p>Attention Animation</p>
    `;
})