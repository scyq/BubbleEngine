export abstract class GameObject {
    x: number = 0;
    y: number = 0;
    alpha: number = 1;

    draw(gl: WebGL2RenderingContext) {
        this.render(gl);
    }

    abstract render(gl: WebGL2RenderingContext): void;
}

