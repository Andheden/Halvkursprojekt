const fs = require("fs");
const { getBuiltinModule } = require("process");


function getHtml (name) {
    return fs.readFileSync(name+".html").toString();
}

function render(content) {
    let html = fs.readFileSync(__dirname + "/public/html/template.html").toString();
    return html.replace("‎ ", content);
}

function getIMG (){
    return JSON.parse(fs.readFileSync("MUA.json").toString())
}

function skapaBild (bild) {
    let bilder = getIMG();
    bilder.push(bild);

    sparabilder(bilder);
}

function sparabilder (bilder) {

    fs.writeFileSync("MUA.json", JSON.stringify(bilder, null, 2))
    return true;

}

function deleteBild (id) {
    let bilder = getIMG();
    let bilder2 = bilder.filter(g=>g.id!=id);
    sparabilder(bilder2);
}

module.exports = {getHtml, render, getIMG, sparabilder, skapaBild, deleteBild};