import fs from "node:fs";
const fileDir =["./data","./output"]

fileDir.forEach(folder=>{
    if (!fs.existsSync(folder)){
        fs.mkdirSync(folder);
    }
})

function addData(data,file){
    let success = true;
    try{
        fs.writeFileSync(file,data);
    }catch(err){
        console.log(err);
        console.log("Erro Occur while saving file.");
        success = false;
    }
    
    return success;
}

function readData(){
    let data = {};
    try{
        data = fs.readFileSync("./data/expense.json");
    }catch(err){
        data.expenseData = [];
        data.nextId = 1;
        data = JSON.stringify(data);
    }
    
    return JSON.parse(data);
}


export class CRUD{

    static monthName = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    static addFunc(expense){
        const data = readData();
        const newDate = new Date();
        const newId = data.nextId;
        data.nextId+=1;
        data.expenseData.push(
            {
                id: newId,
                description: expense.expenseName,
                amount : expense.expenseAmount,
                category: expense.expenseCategory,
                date: newDate
            }
        );

        if(addData(JSON.stringify(data),"./data/expense.json")){
            console.log(`# Expense added successfully (ID: ${newId})`);
            const totalExpense = CRUD.getTotal(data,newDate.getMonth());
            data.budget = data.budget || {};
            const maxBudget = data.budget[newDate.getMonth()] || totalExpense;
            if(totalExpense> maxBudget){
                console.log("\x1b[31m",`!!!Warning!!!Expense for current month exceeded.(Total Expense: ${totalExpense} , Max Budget: ${maxBudget})`);  
            }
        };
    }
    
    static getTotal(data,month){
        let totalExpense = 0;
        const targetMonth = new Date().getFullYear() + "/" + (month+1);
        data.expenseData = data.expenseData.filter(element=>{
            let dataDate = new Date(element.date).toLocaleDateString().substring(0,6);
            return dataDate == targetMonth;
        });
        
        data.expenseData.forEach(element=>{
            totalExpense += element.amount;
        })
        return totalExpense;
    }

    static sumUp(month){
        const data = readData();
        return CRUD.getTotal(data,month);
    }
    
    static deleteFunc(deleteId){
        const data = readData();
        const beforeCount = data.expenseData.length;
        data.expenseData = data.expenseData
          .map(element => element.id == deleteId?null:element)
          .filter(element=>Boolean(element));
        const afterCount = data.expenseData.length;
        if(addData(JSON.stringify(data),"./data/expense.json") && beforeCount > afterCount){
            console.log(`# Expense deleted successfully`);
        };
        return beforeCount > afterCount;
    }

    static makeCSV(){
        const data = readData();
        let dataRow = ["id,description,amount,category,date"];
        data.expenseData.forEach(element=>{
            let rowData = [];
            Object.entries(element).forEach((e)=>rowData.push(e[1]));
            dataRow.push(rowData.join(","));
        })
        dataRow = dataRow.join("\n");
        
        if(addData(dataRow,"./output/expense.csv")){
            console.log("CSV file is save in ./output/expense.csv");
        };
    }

    static listUp(category){
        const data = readData();
        let expenseData = data.expenseData.sort((a,b)=>a.id-b.id);
        if(category){
            expenseData = expenseData.filter(e=>e.category == category);
        }
        if(expenseData.length<=0){
            console.log(`# No data found. (Category: ${category || ""})`);
            return 
        }
        console.log("# ID  Date     Description  Category  Amount");
        expenseData.forEach(element =>{
            console.log(`# ${element.id}  ${new Date(element.date).toLocaleDateString()}  ${element.description}  ${element.category}  ${element.amount}`);
        })
    }
    
    static setBudget(month,budget){
        const data = readData();
        data.budget = data.budget || {};
        data.budget[month] = budget;
        if(addData(JSON.stringify(data),"./data/expense.json")){
            console.log(`# Budget has been add for ${CRUD.monthName[month]}.(Budget: ${budget})`);
        };
    }

    static showBudget(month){
        const data = readData();
        data.budget = data.budget || {};
        return data.budget[month];
    }
};