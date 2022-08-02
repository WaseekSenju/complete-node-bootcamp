const fs = require("fs");

setTimeout(() => console.log("Timer 1 Finished"), 0);
setImmediate(()=> console.log("Immidiate 1 finished"));


fs.readFile('test-file',()=>{
    console.log('IO Finished');
    console.log('----------------');

    setTimeout(()=> console.log('Timer 2 finsihed'),0);
    setTimeout(()=> console.log('Timer 3 finsihed'),3000);
    setImmediate(()=> console.log('Immediate 2 finished'));

});


console.log("Hello from the top level code");
