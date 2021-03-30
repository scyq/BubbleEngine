import { Behaviour } from "./components";
import { Matrix4, Vector2, scale, flatArray2D } from "./math";
import { Renderer } from "./render";

export abstract class GameObject {
    parent: GameObject = null;
    children: GameObject[] = [];
    renderMode: number = WebGL2RenderingContext.TRIANGLE_STRIP;
    buffers: WebGLBuffer;
    localMatrix: Matrix4 = scale(1, 1, 0);

    private static allObjects: { [gameObjectId: number]: GameObject } = {};
    private static gameObjectIdIndex = 1;
    gameObjectId: number = 0;

    private behaviours: Behaviour[] = [];

    static getGameObject(gameObjectId: number): GameObject {
        return this.allObjects[gameObjectId];
    }

    constructor() {
        this.gameObjectId = GameObject.gameObjectIdIndex++;
        GameObject.allObjects[this.gameObjectId] = this;
    }

    addBehaviour(behaviour: Behaviour) {
        this.behaviours.push(behaviour);
        behaviour.gameObject = this;
    }

    addChild(child: GameObject): void {
        const childIndex = this.children.indexOf(child);
        if (childIndex === -1) {
            this.children.push(child);
        }
    }

    removeChild(child: GameObject): void {
        const childIndex = this.children.indexOf(child);
        if (childIndex >= 0) {
            this.children.splice(childIndex, 1);
            child.parent = null;
        }
    }

    removeAllChildren() {
        for (const child of this.children) {
            this.removeChild(child);
        }
    }

    abstract render(gl: WebGL2RenderingContext, programInfo: any): void;
}



class GameObject2D extends GameObject {

    verties: Array<Vector2> = [];
    color: Array<number> = [];  // 面向用户的颜色
    fragColor: Array<number> = []; // 每个顶点记录自己的颜色，交给片段着色器的颜色
    vertexCnt: number;

    constructor(color: Array<number>, vertexCnt: number) {
        super();
        if (color.length > 4 || color.length < 3) {
            throw new Error('错误的RGBA信息');
        }
        this.vertexCnt = vertexCnt;
        this.setColor(color[0], color[1], color[2], 1);
    }

    setColor(r: number, g: number, b: number, a?: number) {
        this.color = new Array(4);
        this.color[0] = r / 255;
        this.color[1] = g / 255;
        this.color[2] = b / 255;
        if (!a) {
            this.color[3] = 1;
        } else this.color[3] = a;
        this.fragColor = [];
        for (let i = 0; i < this.vertexCnt; i++)
            this.fragColor.push(...this.color);
    }

    render(gl: WebGL2RenderingContext, programInfo: any): void {
        const buffers = Renderer.initBuffers2D(gl, this.verties, this.fragColor);

        // 仿射变换矩阵
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.affineMatrix,
            false,
            this.localMatrix.matrix
        );

        // 取出点的位置信息
        {
            const numComponents = 2;    // (x, y)
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
            const numComponents = 4;    // (r, g, b, a)
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
            gl.drawArrays(this.renderMode, offset, vertexCount);
        }
    }
}

export class Rectangle extends GameObject2D {

    height: number;
    width: number;

    // 定对角线的两个点
    constructor(width: number = 2, height: number = 2, color: Array<number> = [255, 255, 255, 1]) {
        super(color, 4);
        this.localMatrix = scale(width / 2, height / 2, 1);
        // 绘制方法: TRIANGLE_STRIP
        this.verties.push(new Vector2(1, 1));
        this.verties.push(new Vector2(-1, 1));
        this.verties.push(new Vector2(1, -1));
        this.verties.push(new Vector2(-1, -1));
    }
}

export class Circle extends GameObject2D {
    radius: number;

    constructor(radius: number = 1, color: Array<number> = [255, 255, 255, 1]) {
        // 圆分成多少个三角形
        const N = 100;
        super(color, N + 1);

        this.verties.push(new Vector2(0, 0));
        this.radius = radius;
        this.renderMode = WebGL2RenderingContext.TRIANGLE_FAN;

        for (let i = 0; i < N; i++) {
            let theta = i * 2.1 * Math.PI / N;
            let x = this.radius * Math.sin(theta);
            let y = this.radius * Math.cos(theta);
            this.verties.push(new Vector2(x, y));
        }
    }
}

export class Triangle extends GameObject2D {
    constructor(color: Array<number> = [255, 255, 255, 1]) {
        super(color, 3);

        this.verties.push(new Vector2(-1, 0));
        this.verties.push(new Vector2(1, 0));
        this.verties.push(new Vector2(0, 1));
    }
}