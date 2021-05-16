import {loadStdlib} from '@reach-sh/stdlib'
import * as backend from './build/index.main.mjs'
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';


(async()=>{
    const stdlib = await loadStdlib()
    const isPlayer1 = await ask(
        `Are you Player1?`,
        yesno
      );
      const who = isPlayer1 ? 'Player1' : 'Player2';
      console.log(`Starting Morra game as ${who}`);

      let acc = null;
  const createAcc = await ask(
    `Would you like to create an account? (only possible on devnet)`,
    yesno
  );

  if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
  } else {
    const secret = await ask(
      `What is your account secret?`,
      (x => x)
    );
    acc = await stdlib.newAccountFromSecret(secret);
  }

  let ctc = null;
  const deployCtc = await ask(
    `Do you want to deploy the contract? (y/n)`,
    yesno
  );
  if (deployCtc) {
    ctc = acc.deploy(backend);
    const info = await ctc.getInfo();
    console.log(`The contract is deployed as = ${JSON.stringify(info)}`);
  } else {
    const info = await ask(
      `Please paste the contract information:`,
      JSON.parse
    );
    ctc = acc.attach(backend, info);
  }

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async () => fmt(await stdlib.balanceOf(acc));

  const before = await getBalance();
  console.log(`Your balance is ${before}`);

  const interact = {...stdlib.hasRandom };
  interact.play = async()=>{
      console.log(`${who} played`)
    const fingers = await ask("Please enter number of fingers?",parseInt)
    const prediction = await ask("Please enter number for prediction?",parseInt);
    return [fingers,prediction];
  };



   if (isPlayer1) {
    const amt = await ask(
      `How much do you want to wager?`,
      stdlib.parseCurrency
    );
    interact.wager = amt;
  } else {
    interact.acceptWager = async (amt) => {
      const accepted = await ask(
        `Do you accept the wager of ${fmt(amt)}?`,
        yesno
      );
      if (accepted) {
        return true;
      } else {
        process.exit(0);
        return  false;
      }
    };
  }
  const WINNING_STATES= ["Its a draw", "Player 1 wins","Player 2 wins"]

  interact.displayWinner= (index)=>{
    console.log(`Displaying Result for ${who} Result:  ${WINNING_STATES[index]}`)
};

const part = isPlayer1 ? backend.Player1 : backend.Player2;
await part(ctc, interact);


const after = await getBalance();
console.log(`Your balance is now ${after}`);

done();


})()






// (async()=>{
// const stdlib = await loadStdlib()

// const WINNING_STATES= ["Its a draw", "Player 1 wins","Player 2 wins"]

// const AllPlayers=((who)=>({
//   play:()=>{
//       console.log(`${who} played`)
//     if(who == "Player1"){
        
//         return [5,2];
//     }else{
//        return [3,8] ;
//     }
//   },
//    displayWinner:(index)=>{
//        console.log(`Displaying Result for ${who} Result:  ${WINNING_STATES[index]}`)
//    },
//    ...stdlib.hasRandom
// //   play:()=>{
// //       return [1,4]
// //   }
// }))

// const startingBalance = stdlib.parseCurrency(10)
// const player1Account = await stdlib.newTestAccount(startingBalance)
// const player2Account = await stdlib.newTestAccount(startingBalance)

// const ctcAccount1 = player1Account.deploy(backend)
// const info = await ctcAccount1.getInfo();
// const ctcAccount2 = player2Account.attach(backend,info)


// const fmt = (x)=>stdlib.formatCurrency(x,4)
// const getBalance = async(who) => fmt( await stdlib.balanceOf(who))

// const player1StartBalance = await getBalance(player1Account)
// const player2StartBalance =  await getBalance(player2Account);


// console.log(`Player 1 start Balance : ${player1StartBalance}`)
// console.log(`Player 2 start Balance : ${player2StartBalance}`)

// await Promise.all([
//     backend.Player1(ctcAccount1,{...AllPlayers("Player1"),wager:stdlib.parseCurrency(6)}),
//     backend.Player2(ctcAccount2,{...AllPlayers("Player2"),acceptWager:(a)=>{return true}})
// ])

// const player1EndBalance = await getBalance(player1Account)
// const player2EndBalance =  await getBalance(player2Account);

// console.log(`Player 1 end Balance : ${player1EndBalance}`)
// console.log(`Player 2 end Balance : ${player2EndBalance}`)

// console.log("Program ended")


// })()