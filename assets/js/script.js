const PET = {
    weight: 2,
    // decrease every 15 mins
    happy: 2,
    // decrease every 20 mins
    hungry: 2,
    health:10,
    poop:0,
    //Queue timer
    poopTime: [],
    // queue timer
    hungryTime:[],
    // happy timer

    isHungry(){
        return this.hungry <= 0;
    },
    isDeath(){
        return this.health <= 0; 
    },
    isFed(){
        this.hungry += 1;
        this.poo
    } 


}

console.log(PET.isHungry())