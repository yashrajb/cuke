let {StepParser} = require('./step-parser')
let {ConfluenceStepOutputter} = require('./confluence-step-outputter');
var path = require("path");
var fs = require("fs");
const yargs = require("yargs");
const argv = yargs.argv;
let outputFile = path.resolve(__dirname,"output.json")
yargs.version("1.0").command("o","open file");
yargs.command("d","directory of step defintions files");



if(argv.o && argv.d){
  console.log("you can only give one command either --o or --d");
}else if(argv.o){
 openFile(argv.o)
}else if(argv.d){
  makeFile(argv.d);
}




function makeFile(stepDefinitionDir){
  let all_steps = [];
  let directory = path.resolve(...stepDefinitionDir.split("/"));
  let output = new ConfluenceStepOutputter(outputFile,all_steps);
  let dirs = fs.readdirSync(directory)
dirs.forEach((dir) => {
  dir = path.resolve(directory,dir);
  let step_parser = new StepParser();
  let nestedDir = fs.readdirSync(dir);
  nestedDir.forEach((nestedDir) => {
    nestedDir = path.resolve(dir,nestedDir);
    step_parser.read(nestedDir);
  });
    //console.log(step_parser.steps);
    all_steps.push(...step_parser.steps);    ;
});
output.sorter();
output.makeFile();
output.makePageAndUpdate();
}

function openFile(file){
  let outputFile = path.resolve(...file.split("/"));
  console.log(outputFile);
  let output = new ConfluenceStepOutputter();

  output.openFile(outputFile);
}



