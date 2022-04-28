const display = document.querySelector('.display');





let stringTime = 'Tue Apr 26 2022 00:33:05 GMT-0700';


let everySecond = setInterval(() => {
    let rightNow = moment();
    let min30 = moment().add(15, 'minutes');
    display.innerHTML = `
    ${rightNow} <br> 
    ${min30} <br>
    ${moment(stringTime).diff(moment(), 's')}
`;

}, 1000);