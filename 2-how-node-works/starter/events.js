const eventEmmiter = require("events");
const { EventEmitter } = require("stream");

const myEmitter = new EventEmitter();

myEmitter.on("newSale", () => console.log("There was a new sale"));
myEmitter.on("newSale", () => console.log("Customer name: Waseek"));

myEmitter.emit("newSale");
