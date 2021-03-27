import { Vector2 } from "./math";

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

    verties: Array<Vector2>;
    height: number;
    width: number;

    // 定对角线的两个点
    constructor(a: Vector2, c: Vector2) {
        this.width = Math.abs(a.x - c.x);
        this.height = Math.abs(a.y - c.y);
        const b = new Vector2(a.x + this.width, a.y);
        const d = new Vector2(c.x - this.width, c.y);

        this.verties.push(a);
        this.verties.push(b);
        this.verties.push(c);
        this.verties.push(d);
    }
}

