import { vec3, mat4} from 'https://cdn.skypack.dev/gl-matrix';
import Transform from './transform.js';



export default class Circle
{
    constructor(gl, centerX, centerY, radius, probs, type)
    {
        this.gl = gl;

        this.vertexAttributesBuffer = this.gl.createBuffer();
        if(!this.vertexAttributesBuffer)
        {
            throw new Error("Buffer for Circle's vertices could Not be allocated");
        }

        this.radius = radius;
        // this.radius = 0.02;
        this.vertexAttributesData = [];
        this.vertCount = 2;
        this.type = type;

        var bins = 16;
        var categories = probs;
        var pos = 0;
        var degreeCount=0;
        var epsilon = 360/bins;

        for(var i=0; i<bins; i+=1)
        {
            var j = i* Math.PI / (bins/2);
            var vert1 = [
                // X, Y, Z
                Math.cos(j)*this.radius, Math.sin(j)*this.radius,
            ];

            this.vertexAttributesData = this.vertexAttributesData.concat(vert1);
        }		

        this.vertexColorBuffer = this.gl.createBuffer();
        this.vertexColorData = [];
        
        var ColorArray12 =
         [
            [0.65, 0.81, 0.89, 1.0], 
            [0.12, 0.47, 0.71, 1.0], 
            [0.70, 0.87, 0.54, 1.0],
            [0.20, 0.63, 0.17, 1.0], 
            [0.98, 0.60, 0.60, 1.0], 
            [0.89, 0.10, 0.11, 1.0],
            [0.99, 0.75, 0.44, 1.0], 
            [1.00, 0.50, 0.00, 1.0], 
            [0.79, 0.70, 0.84, 1.0],
            [0.42, 0.24, 0.60, 1.0], 
            [1.00, 1.00, 0.60, 1.0], 
            [0.69, 0.35, 0.16, 1.0],
            [0.00, 0.00, 0.00, 1.0], 
            [0.39, 0.39, 0.39, 1.0]
        ];
        var VaiMapIndextoColor12 = [
            7, 10, 1, 6, 2, 5, 4, 11, 3
        ];

        var DaleMapIndextoColor12 = [
            12, 1, 3, 6, 8, 7, 2, 9, 5
        ];

        var ColorArray9 =
        [
            [0.89, 0.10, 0.11, 1.0], 
            [0.22, 0.49, 0.72, 1.0], 
            [0.30, 0.69, 0.29, 1.0],
            [0.60, 0.31, 0.64, 1.0], 
            [1.00, 0.50, 0.00, 1.0], 
            [1.00, 1.00, 0.20, 1.0],
            [0.65, 0.34, 0.16, 1.0], 
            [0.97, 0.51, 0.75, 1.0], 
            [0.60, 0.60, 0.60, 1.0],
            [0.00, 0.00, 0.00, 1.0], 
            [1.00, 1.00, 0.60, 1.0]
        ];
        var VaiMapIndextoColor9 = [
            4, 5, 1, 7, 3, 0, 8, 5, 2
        ];

        var DaleMapIndextoColor9 = [
            9, 1, 2, 7, 6, 4, 3, 10, 0
        ];

        var ColorVaih = 
        [
            [0.0, 0.0, 0.0, 1.0],
            [0.0, 1.0, 1.0, 1.0],
            [0.95, 0.95, 0.95, 1.0],
            [1.0, 1.0, 0.0, 1.0],
            [1.0, 0.0, 1.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [1.0, 0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0, 0.5],
            [0.0,1.0,0.0,1.0]
        ];

        var ColorDale = 
        [
            [0.0, 0.0, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [0.0, 1.0, 0.0, 1.0],
            [1.0, 0.49, 0.49, 0.75], 
            [1.0, 1.0, 0.0, 1.0], 
            [0.63, 0.96, 0.65, 0.70], 
            [0.51, 0.93, 1.0, 0.7], 
            [0.98, 0.55, 0.28, 0.95], 
            [1.0, 0.0, 0.0, 1.0]
        ];

        var GrayScale = 
        [
            [0.0, 0.0, 0.0, 1.0],
            [0.1, 0.1, 0.1, 1.0],
            [0.2, 0.2, 0.2, 1.0],
            [0.3, 0.3, 0.3, 1.0],
            [0.4, 0.4, 0.4, 1.0],
            [0.5, 0.5, 0.5, 1.0],
            [0.6, 0.6, 0.6, 1.0],
            [0.7, 0.7, 0.7, 1.0],
            [0.8, 0.8, 0.8, 1.0],
            [0.9, 0.9, 0.9, 1.0],
            [1.0, 1.0, 1.0, 1.0]
        ]

        var VaihToGray =
        [
            0, 2, 4, -1, -1, 6, -1, -1, 8
        ]

        var DaleToGray =
        [
            4, 6, 8, -1, 0, 7, 5, 3, 1, 10, -1, -1
        ]

        pos = 0;
        degreeCount=0;
        var colMap = {
            1 : [0, 1.0, 1.0, 1.0],
            2 : [1.0, 1.0, 1.0, 1.0],
            5 : [0, 0, 1.0, 1.0],
            8 : [0, 1.0, 0, 1.0]
        }
        for(var i=0; i<bins;)
        {
            if(categories[pos]*360 < epsilon)
            {
                pos += 1;
                continue;
            }
            var color;
            // // 12 Class Colors
            if(type==1) color = ColorArray12[DaleMapIndextoColor12[pos]];
            else color = ColorArray12[VaiMapIndextoColor12[pos]];
            // // 9 Class Colors
            // if(type==1) color = ColorArray9[DaleMapIndextoColor9[pos]];
            // else color = ColorArray9[VaiMapIndextoColor9[pos]];
            // // Dataset Provider
            // if(type==1) color = ColorDale[pos];
            // else color = ColorVaih[pos];
            // GrayScale
            // if(type==1) color = GrayScale[DaleToGray[pos]];
            // else color = GrayScale[VaihToGray[pos]];
            
            this.vertexColorData = this.vertexColorData.concat(color);
            var j = i* 360 / (bins);
            i+=1;
            while(j-degreeCount < categories[pos]*360)
            {
                this.vertexColorData = this.vertexColorData.concat(color);
                j = i* 360 / (bins);    
                i+=1;
            }
            pos+=1;
            degreeCount=j;    
        }


        this.centerX = centerX;
        this.centerY = centerY;
    }

    draw(shader)
    {
        let mat = m3.identity();
        mat = m3.translate(mat, this.centerX, this.centerY);
        
        const model = shader.uniform("Model");
        shader.setUniformMatrix3fv(model, mat);

        let vertexData = new Float32Array(this.vertexAttributesData)
        let elementPerVertex = 2;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0)

        let vertexColor = new Float32Array(this.vertexColorData);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexColor, this.gl.STATIC_DRAW);
        const aColor = shader.attribute("a_color");
        this.gl.enableVertexAttribArray(aColor);
        this.gl.vertexAttribPointer(aColor, 4, this.gl.FLOAT, false, 0,0);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, vertexData.length/this.vertCount);
    }
};