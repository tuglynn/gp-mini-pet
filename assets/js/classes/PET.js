const POOP = 2*60;
const HUNGRY = 4*60;
const BORED = 3*60;
const SICK = 5*60;

export default class PET {
    constructor(){
        this.happy = happy;
        this.hungry = hungry;
        this.weight = weight;
        this.sickness = sickness;
        this.restroomTime = restroomTime;
        this.actionQueue  =  actionQueue;  
    }

    isHungry(){
        return this.hungry <= 0;
    }
    isDeath(){
        return this.health <= 0; 
    }
    mealFed(){
        if(this.hungry==4){
            this.sickness++;
            this.actionQueue.push({time:moment().add(SICK,'s'),action:'beSick'});
        }else{
            this.hungry++;
            this.actionQueue.push({time:moment().add(POOP,'s'),action:'poop'});
            this.actionQueue.push({time:moment().add(HUNGRY,'s'),action:'beHungry'});
                   
        }
        this.sortActionQueue();
    }
    playGame(){
        if(this.happy<4){
            //call mini game function
            this.happy++;
            this.actionQueue.push({time:moment().add(BORED,'s'),action:'beBored'})
        }
    }
    beHungry(){
        this.hungry--;
        console.log('imhungry')
    }
    sortActionQueue(){
        // this.actionQueue.sort((a,b)=>timeCheck(a.time)-timeCheck(b.time))
        this.actionQueue.sort((a,b)=>a.time.diff(moment(),'s')-b.time.diff(moment(),'s'))
    }
    
}