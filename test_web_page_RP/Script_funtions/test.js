const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
//  readline.question(`What's your name?`, name => {
//    console.log(`Hi ${name}!`);
//    readline.close();
//  });

const math = require('mathjs');
let f = "sin(x)"

f= readline.question(
    "che funzione vuoi analizzare ",
    f => {
        for (let index = -10; index < 10; index++) {
            const f_temp = f.replace(/\bx\b/g, `(${index})`)
            console.log(`con x = ${index} f(x) vale ${math.evaluate(f_temp)}`)
        };
        readline.close()
    }
)