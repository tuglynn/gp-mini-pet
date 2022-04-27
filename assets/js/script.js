const POOP = 1*20;
const HUNGRY = 15;
const BORED = 1*30;
const SICK = 1*40;
const CLEANCHECK = 1*50;
let count = 0;
const HANGRY=10*1000;
const mainDisplay = document.querySelector('.display');
const PET = {
    stats:{
        weight: 2,
        // decrease every 15 mins
        happy: 2,
        // decrease every 20 mins
        hungry: 2,
        sickness:0,
        poop:0,
    },
    // action tracker
    actionQueue: [],

    instinct(){     
        this.beHungry();
        this.beBored();
        setLocalPet();  
    },
    
    isDeath(){
        return this.stats.hunger <= 0 || this.stats.happy <=0; 
    },
    mealFed(){
        if(this.stats.hungry==4){
            this.sickness++;
            this.actionQueue.push({time:moment().add(SICK,'s').format('X'),action:'beSick'});
        }else{
            this.stats.hungry++;
            this.actionQueue.push({time:moment().add(POOP,'s').format('X'),action:'poop'});          
        }
        this.sortActionQueue();
    },
    playGame(){
        if(this.stats.happy<4){
            //call mini game function
            // miniGame()
            this.stats.happy++;
            this.actionQueue.push({time:moment().add(BORED,'s').format('X'),action:'beBored'})
            this.sortActionQueue();
        }
    },
    beHungry(){
        // console.log('behungry call')
        this.stats.hungry--; 
    },
    beBored(){
        this.stats.happy--;
    },
    beSick(){
        console.log('besick call')
        // get more sick
        this.stats.sickness++;
        //alarm user: pet need medicine
    },
    bePooping(){
        console.log('poopping call')
        this.stats.hungry--;
        this.stats.poop++;
        this.actionQueue.push({time:moment().add(CLEANCHECK,'s').format('X'),action:'cleanCheck'});
        this.sortActionQueue();
        //display poop on screen
    },
    cleanCheck(){
        console.log('cleancheck call')
        if(this.stats.poop>0){this.stats.sickness++};
    },
    sortActionQueue(){
        // this.actionQueue.sort((a,b)=>timeCheck(a.time)-timeCheck(b.time))
        if(this.actionQueue.length>=2){this.actionQueue.sort((a,b)=>a.time-b.time)};
    }
}

// GETTER
function getLocalPet(){
    console.log(count,PET.stats, PET.actionQueue)
    const PETstats = JSON.parse(localStorage.getItem('myPET'));
    PET.stats = PETstats.stats;
    PET.actionQueue = [...PETstats.actionQueue];
    // console.log(PET);
}
// SETTER
function setLocalPet(){
    const PETstats = {stats:PET.stats,actionQueue:PET.actionQueue};
    localStorage.setItem('myPET',JSON.stringify(PET));
}


function actionCheck(){
    if(PET.actionQueue.length>0){
        //is the first event of action queue past time?
        // past?do stuff and shift:nothing
        if(moment().diff(moment(PET.actionQueue[0].time, 'X'),'s')>0){
            switch (PET.actionQueue[0].action){
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


PET.mealFed()
setLocalPet()

// get and set localstorage every 5s
let every5Second = setInterval(() => {
    count++;
    displayStats();
    getLocalPet()
    if(!PET.isDeath()){
        // check actionQue and execute the action
        actionCheck()  
    }else{
        console.log('pet die')
        clearInterval(every5Second);
    }  
}, 3000);

function init(){
    let animalInstinct = setInterval(() => {
        console.log('instinct call')
        if(PET.isDeath()){clearInterval(animalInstinct)}
        else{PET.instinct();}
        
    }, HANGRY);
}
init()



function displayStats(){
    mainDisplay.innerHTML = `
        <p>Weight: ${PET.stats.weight}</p>
        <p>Happy: ${PET.stats.happy}</p>
        <p>Hungry: ${PET.stats.hungry}</p>
    `;

}


