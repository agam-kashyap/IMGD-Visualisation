import Renderer from "./renderer.js";
import Shader from "./shader.js"
import vertexShaderSrc from './shader/Triangle/vertex.js';
import fragmentShaderSrc from './shader/Triangle/fragment.js';
import CirVertexShaderSrc from './shader/Circle/vertex.js';
import CirFragShaderSrc from './shader/Circle/fragment.js';
import Triangle from './triangle.js';
import Circle from './circle.js';

const renderer = new Renderer();
const gl = renderer.webGlContext();

const triShader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
const circShader = new Shader(gl,CirVertexShaderSrc,CirFragShaderSrc);

const Color = {
    'triangle' : new Float32Array([1.0, 1.0, 1.0, 0.0])
};

const BinSize = 100;

var Tri = new Triangle(gl, Color['triangle']);
let terminate = false;

//----CSV Input--------
const csvFile = document.getElementById("csvFile");
var fileName = "";

// The Dales dataset contains .txt files which contain '\r\n' hence splitting the lines is different
// The Vaihingen dataset contains .csv files which just have '\n' to denote line break
var fileExt = "csv"; 
var isDale = true;
function csvToArray(str, delimiter = " ") {

    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = ["x","y","z", "alpha", "beta", "gamma", "class"];

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    var rows;
    if(fileExt == "csv")
    {
        rows = str.slice(str.indexOf("\n") + 1).split("\n");
        isDale = false;
    }
    else
    {
        rows = str.slice(str.indexOf("\r\n") + 1).split("\r\n");
        isDale = true;
    }
    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(
        function (row) {
            const values = row.split(delimiter);
            for(var i=3; i<6; i+=1)
            {
                values[i] = Math.round(values[i]*BinSize)/BinSize;
            }
            const el = headers.reduce(function (object, header, index) {
                object[header] = values[index];
                return object;
            },{});
            return el;
        });
    
    // return the array
    var newarr = arr.slice(0, arr.length-1);
    return newarr;
}
var classes = [];
function merge(arr)
{
    //create a key with string

    const map = new Map();

    for(var i=0; i<arr.length; i+=1)
    {
        var key = "" + arr[i].alpha.toString() + " " + arr[i].beta.toString() + " " + arr[i].gamma.toString();
        if(classes.indexOf(arr[i].class)==-1)
        {
            classes.push(arr[i].class);
        }
        if(!map.has(key))
        {
            var vals = [0,0,0,0,0,0,0,0,0,0,0,0];
            vals[arr[i].class] = 1;
            map.set(key, vals);
        }
        else
        {
            var vals = map.get(key);
            vals[arr[i].class] += 1;
            map.set(key, vals);
        }
        // if(i==10)break;
    }

    for(let key of map.keys()){
        var total = 0;
        const vals = map.get(key);
        for(var i of vals)
        {
            total += i;
        }
        for(var i=0; i<9; i+=1)
        {
            vals[i] = Math.round(vals[i]*BinSize/total)/BinSize;
        }
        map.set(key, vals);
    }
    return map;
}

fileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        Glyphs = [];
        const input = csvFile.files[0];
        fileExt = input.name.split(".")[1];
        fileName = input.name.split(".")[0];
        console.log(fileName);

        fileNameNode.nodeValue = fileName;
        typeNode.nodeValue = fileExt == 'csv'? 'Vaihingen': 'Dales';

        const reader = new FileReader();

        reader.onload = function (e) {
            const text = e.target.result;
            const data = csvToArray(text);
            const vals = merge(data);
            Glyphs = [];
            Glyphs = update_figure(vals);
        };
    
    reader.readAsText(input);
    
});

function update_figure(map)
{
    const Glyphs = [];
    for(var [key, val] of map)
    {
        const probs = key.split(" ");
        var alpha = probs[0];
        var beta = probs[1];
        // x1, y1 = 0, 0.98
        //
        var posX = (-0.98)*(1-alpha-beta) + (0.98)*alpha + (0)*beta;
        var posY = (-0.98)*(1-alpha-beta) + (-0.98)*alpha + (0.98)*beta;
        if(posY<-0.98)continue;
        else
        {
            if(isDale) Glyphs.push(new Circle(gl, posX,posY, 0.98/BinSize, val, 1));
            else Glyphs.push(new Circle(gl, posX,posY, 0.98/BinSize, val, 0));
        }
    }
    return Glyphs;
}

var Glyphs = [];

window.onload = () => 
{
    document.addEventListener("keydown", (ev) => {
        if(ev.key == 'Escape')
        {
            terminate = true;
        }
    });
};


const screenshot = document.querySelector('#screenshot');
screenshot.addEventListener('click', () => {  
    triShader.use();
    Tri.draw(triShader);
    
    circShader.use();
    for(let i=0; i< Glyphs.length; i+=1)
    {
        Glyphs[i].draw(circShader);
    }
    
    renderer.getCanvas().toBlob((blob) => {
        saveBlob(blob, `${fileName}.png`);
    });
});

const saveBlob = (function() {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    return function saveData(blob, fileName) {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
    };
}());


var fileNameElement = document.querySelector('#fileName');
var fileNameNode = document.createTextNode("");
fileNameElement.appendChild(fileNameNode);

var fileTypeElement = document.querySelector('#dataType');
var typeNode = document.createTextNode("");
fileTypeElement.appendChild(typeNode);

function animate()
{
    renderer.resizeCanvas();
    renderer.clear();

    triShader.use();
    Tri.draw(triShader);
    
    circShader.use();
    for(let i=0; i< Glyphs.length; i+=1)
    {
        Glyphs[i].draw(circShader);
    }
    
    // Activated by pressing 'Escape' key
    if(terminate == false)
        window.requestAnimationFrame(animate);
    else
        window.cancelAnimationFrame(animate);
}

animate();