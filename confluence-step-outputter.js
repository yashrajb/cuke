let fs = require("fs");
class ConfluenceStepOutputter {
  constructor(file, content) {
    this.file = file + ".json";
    this.content = content;
  }

  makeFile() {
    fs.writeFileSync(this.file, JSON.stringify(this.content), "utf8");
  }

  sorter() {
    let weight = {
      Given: 1,
      When: 2,
      Then: 3,
      Transform: 4,
      Before: 5,
      After: 6,
      AfterStep: 7
    };
    let jsonContent = [];
    this.content.sort(function(a, b) {
      return weight[a["type"]] > weight[b["type"]];
    });
    this.content.forEach(function(el) {
      jsonContent.push(el);
    });
    this.content = jsonContent;
  }

  makePageAndUpdate(file) {
    let catalog;
    if(file){
      catalog = JSON.parse(fs.readFileSync(file));
    }else{
      this.makeFile();
      catalog = this.content;
    }
    let page =
      "<ac:macro ac:name=\"html\"><ac:plain-text-body><![CDATA[<script>\n$(document).ready(function(){\n    $('a.keyword-all').click(function(){\n        var keyword = $(this).html();\n        $('a.keyword-all').parent().parent().parent().hide();\n        $('a.keyword-all').css('font-weight', 'normal');\n        $('a.keyword-'+keyword).parent().parent().parent().show();\n        $('a.keyword-'+keyword).css('font-weight', 'bold');\n     });\n});\n</script>]]></ac:plain-text-body></ac:macro>";
    let keywords_list = [];
    catalog.forEach(step => {
      page += `<ac:macro ac:name="expand"><ac:parameter ac:name="title"> ${
        step["type"]
      } - ${step["name"]}`;
      page += "</ac:parameter><ac:rich-text-body><b>Keywords: ";
      page += '<a class="keyword-all">all</a>';
      step["keywords"].forEach(keyword => {
        page += `,<a class="keyword-all keyword-${keyword}">${keyword}</a>`;
        //console.log();
        if (!keywords_list.find(el => el === keyword)) {
          keywords_list.push(keyword);
        }
      });
      page += "</b><pre>";
      page += step["description"];
      page += "</pre></ac:rich-text-body></ac:macro>";
    });

    let keyword_header ='<h2>Keywords:</h2><p><b><a class="keyword-all">all</a>';
    keywords_list.forEach(keyword => {
      keyword_header += `, <a class="keyword-all keyword-${keyword}">${keyword}</a>`;
    });
    keyword_header += "</b></p><h2>Steps:</h2>";
    page = keyword_header + page;
    console.log("page is generated");
    this.updateConfluencePage(page);
  }

  updateConfluencePage(content){
    //makePageAndUpdate
    console.log("confluence is updated");
  }
}

module.exports = { ConfluenceStepOutputter };
