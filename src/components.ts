import { flatArray2D, Matrix4, Vector2, scale } from "./math";

// 这边逻辑暂时不敢动，不知道如何抽象
export abstract class GameObject {
    x: number = 0;
    y: number = 0;
    alpha: number = 1;

    draw(gl: WebGL2RenderingContext) {
        this.render(gl);
    }

    abstract render(gl: WebGL2RenderingContext): void;
}

export class Rectangle {

    verties: Array<Vector2> = [];
    height: number;
    width: number;
    color: Array<number> = [];
    fragColor: Array<number> = []; // 每个顶点记录自己的颜色
    scaleMatrix: Matrix4;

    // 定对角线的两个点
    constructor(width: number = 2, height: number = 2, color: Array<number> = [255, 255, 255, 1]) {
        // 绘制方法: TRIANGLE_STRIP
        this.verties.push(new Vector2(1, 1));
        this.verties.push(new Vector2(-1, 1));
        this.verties.push(new Vector2(1, -1));
        this.verties.push(new Vector2(-1, -1));

        if (color.length > 4 || color.length < 3)
            throw new Error('错误的RGBA信息');
        this.color.push(color[0] / 255);
        this.color.push(color[1] / 255);
        this.color.push(color[2] / 255);
        this.color.push(color[3] ? color[3] : 1);

        for (let i = 0; i < 4; i++)
            this.fragColor.push(...this.color);

        const scaleX = width / 2;
        const scaleY = height / 2;
        this.scaleMatrix = scale(scaleX, scaleY, 1);
    }

    setColor(r: number, g: number, b: number, a?: number) {
        this.color[0] = r / 255;
        this.color[1] = g / 255;
        this.color[2] = b / 255;
        if (!a) {
            this.color[3] = 1;
        } else this.color[3] = a;
    }
}

