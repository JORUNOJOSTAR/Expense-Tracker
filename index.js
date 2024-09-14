#! /usr/bin/env node
import { CRUD } from "./crud.js";
import { Command } from "commander"; 
const program = new Command();

function monthChecker(opt_month){
  const month = opt_month?opt_month-1 : new Date().getMonth();
  const monthName = CRUD.monthName[month];
  const notValid = month<0 || month > 11;
  if(notValid){
      console.log("Invalid Month. Month musth be between 1 and 12");
  }
  return {
    month : month,
    isValid : !notValid
  }
}

function bugetChecker(budget){
  const inputBudget = Number(budget);
  const notValid = isNaN(inputBudget) || (inputBudget<=0);
  
  if(notValid){
    console.log("Invalid amount for expense. Amount must be number and greater than 0.");
  }
  return {
     buget: inputBudget,
     isValid: !notValid
  };
}


program
  .name('expense-tracker')
  .description('Track your expense')
  .version('0.0.1');

program.command('add')
  .description('Add expense')
  .requiredOption('--description <string>','Name of the expense')
  .requiredOption('--amount <value>','Cost of the expense')
  .option('--category <name>','Name of the category','not defined')
  .action(opt=>{
    
    if(bugetChecker(opt.amount).isValid){
      const data = {
        expenseName: opt.description,
        expenseAmount: bugetChecker(opt.amount).buget,
        expenseCategory: opt.category
      };
      CRUD.addFunc(data);
    }
});

program.command('summary')
  .description('Get total expense')
  .option('--month <integer>','Month in number. Start from January 1 to December 12.')
  .action(opt=>{
    const checkMonth = monthChecker(opt.month);
    if(checkMonth.isValid){
      let expense = CRUD.sumUp(checkMonth.month);
      console.log(`Total expense for ${CRUD.monthName[checkMonth.month]} ${expense}`);
    }
  });

program.command('setBudget')
  .description('Add limit budget for month of current year')
  .option('--month <integer>','Month in number. Start from January 1 to December 12.',new Date().getMonth()+1)
  .requiredOption('--budget <integer>','Maximum buget for --month.')
  .action(opt=>{
    const checkMonth = monthChecker(opt.month);
    const checkBudget = bugetChecker(opt.budget);
    if(checkMonth.isValid || checkBudget.isValid){
      CRUD.setBudget(checkMonth.month,checkBudget.buget);
    }
  });

program.command('showBudget')
  .description('Show the budget. By default budget of current month will be shown.')
  .option('--month <integer>','Month in number. Start from January 1 to December 12.')
  .action(opt=>{
    const checkMonth = monthChecker(opt.month);
    if(checkMonth.isValid){
      const budget = CRUD.showBudget(checkMonth.month);
      const monthName = CRUD.monthName[checkMonth.month];
      console.log(budget?`Budget for ${monthName} is ${budget}`:`No budget set for ${monthName}`);
    }
  });


program.command('list')
  .description('Listing up all expense')
  .option('--category <name>','Name of the category.')
  .action((opt)=>{
    CRUD.listUp(opt.category);
  });

program.command('delete')
  .description('Delete expense with id')
  .requiredOption('--id <id>','Id of the expense')
  .action(opt=>{
    const expenseId = opt.id;
    if(!CRUD.deleteFunc(expenseId)){
      console.log(`No expense found for ID:${expenseId}`);
    };
  });

program.command('getCSV')
  .description('Get expense data with csv')
  .action(()=>{
    CRUD.makeCSV();
  });


program.parse();