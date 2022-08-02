const fs = require('fs'); // file system
const http = require('http');

// const { dirname } = require('path');
// const url = require('url');
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
//////////////////////////////////////////
//Files
//Blocking Sync way
// const data = fs.readFileSync('./txt/input.txt','utf-8');
// console.log(data);
// const myInput = `This is what we know about avocado : ${data}.\n Created on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt',myInput);
// const data2 = fs.readFileSync('./txt/output.txt','utf-8');
// console.log(data2)


//Non Blocking Async way
// fs.readFile('.','utf-8',(err,data1)=>{
//     if(err){
//         //return console.log('Error!')
//     }
//     fs.readFile(`./txt/${data1}.txt`,'utf-8',(err,data2)=>{
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`,'utf-8',(err,data3)=>{
//             console.log(data3);

//             fs.writeFile('./txt/final.txt',`${data2}\n${data3}`,'utf-8',err =>{
//                 console.log("FIle has been written");
//             })
//         });
//     });
// });
// console.log("Reading file");
const replaceTemplate = (temp , product) =>{
    let output = temp.replace(/{%PRODUCTNAME%}/g,product.productName);
    output = output.replace(/{%ID%}/g,product.id);
    output = output.replace(/{%IMAGE%}/g,product.image);
    output = output.replace(/{%PRICE%}/g,product.price);
    output = output.replace(/{%FROM%}/g,product.from);
    output = output.replace(/{%DESCRIPTION%}/g,product.description);
    output = output.replace(/{%QUANTITY%}/g,product.quantity);
    
    if(!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g,'not-organic');

    return output;
}

const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`,'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`,'utf-8');
const tempProdut = fs.readFileSync(`${__dirname}/templates/product.html`,'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`,'utf-8');
const dataObj = JSON.parse(data);


//////////////////////////////////////////
//Server
const server = http.createServer((req,res)=>{
    const path = req.url;
    //Overview page
    if(path === '/' || path === '/'==='overview'){
        res.writeHead(200,{'Content-Type':'text/html'});
        
        const productsArray =  dataObj.map((element)=>replaceTemplate(tempCard,element)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}',productsArray);
        
        
        res.end(output);
    //Product page
    }else if(path =='/product'){
        res.end('This is a product');
    
        //Apia page    
    }else if(path === '/api')
    {
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end('API');
    }
    //error
    else{
        res.writeHead(400,{'Content-Type':'application/json'});
        res.end('Page not found');
    }
})

server.listen(8000,'127.0.0.1',()=>{
    console.log('Listengin to requests on port 8000')
});