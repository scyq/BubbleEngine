import { flatArray2D, Vector2 } from "./math";

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

    // 定对角线的两个点
    constructor(width: number = 2, height: number = 2) {
        // 绘制方法: TRIANGLE_STRIP
        this.verties.push(new Vector2(1, 1));
        this.verties.push(new Vector2(-1, 1));
        this.verties.push(new Vector2(1, -1));
        this.verties.push(new Vector2(-1, -1));
    }
}

