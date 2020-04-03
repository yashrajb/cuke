var fs = require("fs");

class StepParser {
  constructor() {
    this.steps = [];
    this.current_file = "";
    this.line_number = -1;
    this.lines = "";
    this.comments = [];
    this.read = this.read.bind(this);
    this.parse_lines = this.parse_lines.bind(this);
    this.parse_step_type = this.parse_step_type.bind(this);
    this.parse_step = this.parse_step.bind(this);
    this.parse_step_name = this.parse_step_name.bind(this);
  }

  read(file) {
    this.current_file = file;
    this.line_number = 0;
    this.lines = fs.readFileSync(file, "utf8");
    this.lines = this.lines.split(/\r?\n/);
    this.parse_lines();
  }

  parse_lines() {
    let i = 0;
    let obj = {};
    while (i < this.lines.length) {
      let line = this.lines[i].trim();
      if (
        /^(Given|When|Then|Before|After|AfterStep|Transform)[ (]/.test(line)
      ) {
        if(obj.type && obj.name){
          this.parse_step(obj);
          obj = {};
        }
        obj.type = this.parse_step_type(line);
        obj.name = this.parse_step_name(line);
      }
      if (/^\/\*/gim.test(line) && line.search("-")) {
        let descriptionAndKeywords = this.parse_step_comment_and_keywords(
          line,
          i
        );
        obj.description = descriptionAndKeywords.description;
        obj.keywords = descriptionAndKeywords.keywords;
      }
      if(i === this.steps.length-1){
        if(Object.entries(obj)===4){
          this.parse_step(obj);
        }
      }
     if(i === this.lines.length-1){
       console.log("hello world");
       console.log(obj);
       if(Object.entries(obj).length > 0){
         this.parse_step(obj);
       }
     }
      i++;
    }
  }

  parse_step(obj) {
    
      this.steps.push({ ...obj, filename: this.current_file });
  }

  parse_step_type(line) {
    return /^([A-Za-z]+).*/.exec(line)[1];
  }

  parse_step_name(line) {
    let l = /(["'])(?:(?=(\\?))\2.)*?\1/gi.exec(line)[0];
    return l.replace(/['"]+/g, "");
  }

  parse_step_comment_and_keywords(line, index) {
    let i = index;
    let l = line;
    let description = null,
      keywords = null;
    while (!/^\*\//gim.test(this.lines[i].trim())) {
      i++;
      l = l + this.lines[i];
    }
    i = l.search(/\-{1,}/gim);
    if (i !== -1) {
      i = l.search(/keywords:|keyword:/gim);
      keywords = this.parse_step_keyword(l);
      description = l;
      if (i !== -1) {
        description = l.slice(0, i);
      }
      description = description
        .replace(/\/\*|\*\//gim, "")
        .replace(/\-{1,}/gim, "");
      description = description.trim();
    }
    return {
      description,
      keywords
    };
  }

  parse_step_keyword(line) {
    var index;
    var key;
    if (line.includes("keywords:")) {
      index = line.indexOf("keywords:");
      key = "keywords:";
    }

    if (line.includes("keyword:")) {
      index = line.indexOf("keyword:");
      key = "keyword:";
    }
    if (index && key) {
      return (line = line
        .substring(index)
        .replace(key, "")
        .replace(/\-{1,}/, "")
        .replace("*/", "")
        .trim()
        .split(","));
    }
    return null;
  }
}

module.exports = { StepParser };
