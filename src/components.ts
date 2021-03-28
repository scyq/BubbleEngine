import { Matrix4, Vector2, scale, flatArray2D } from "./math";
import { Renderer } from "./render";


export abstract class GameObject {
    children: GameObject[] = [];

    abstract render(gl: WebGL2RenderingContext, programInfo: any): void;
}

class GameObject2D extends GameObject {

    verties: Array<Vector2> = [];
    color: Array<number> = [];  // 面向用户的颜色
    fragColor: Array<number> = []; // 每个顶点记录自己的颜色，交给片段着色器的颜色
    scaleMatrix: Matrix4 = scale(1, 1, 1);

    constructor(color: Array<number>) {
        super();
        if (color.length > 4 || color.length < 3)
            throw new Error('错误的RGBA信息');
        this.color.push(color[0] / 255);
        this.color.push(color[1] / 255);
        this.color.push(color[2] / 255);
        this.color.push(color[3] ? color[3] : 1);
    }

    setColor(r: number, g: number, b: number, a?: number) {
        this.color[0] = r / 255;
        this.color[1] = g / 255;
        this.color[2] = b / 255;
        if (!a) {
            this.color[3] = 1;
        } else this.color[3] = a;
    }

    render(gl: WebGL2RenderingContext, programInfo: any): void {

        const buffers = Renderer.initBuffers2D(gl, this.verties, this.fragColor);

        // 乘缩放矩阵
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.scaleMatrix,
            false,
            this.scaleMatrix.matrix
        );

        // 取出点的位置信息
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers['position']);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // 获取片元着色器信息
        {
            const numComponents = this.verties.length;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexColor);
        }

        {
            const offset = 0;
            const vertexCount = this.verties.length;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }
}

export class Rectangle extends GameObject2D {

    height: number;
    width: number;

    // 定对角线的两个点
    constructor(width: number = 2, height: number = 2, color: Array<number> = [255, 255, 255, 1]) {
        super(color);
        this.scaleMatrix = scale(width / 2, height / 2, 1);
        // 绘制方法: TRIANGLE_STRIP
        this.verties.push(new Vector2(1, 1));
        this.verties.push(new Vector2(-1, 1));
        this.verties.push(new Vector2(1, -1));
        this.verties.push(new Vector2(-1, -1));
        for (let i = 0; i < 4; i++)
            this.fragColor.push(...this.color);
    }
}

