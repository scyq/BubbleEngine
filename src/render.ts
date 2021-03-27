import { flatArrary, Matrix4, Vector2 } from "./math";

class Camera {
    static PERSPECTIVE: number = 0;
    static ORTHOGRAPHIC: number = 1;

    private type: number;
    private fov: number;    // Field of View in Radian
    private aspect: number;
    private zNear: number;
    private zFar: number;
    projectionMatrix: Matrix4;

    constructor(
        type: number = Camera.PERSPECTIVE,
        width: number = 800,
        height: number = 600,
        fov: number = 45 * Math.PI / 180,
        zNear: number = 0.1,
        zFar: number = 100) {
        if (type === Camera.PERSPECTIVE || type === Camera.ORTHOGRAPHIC) {
            this.type = type;
        }
        else throw new Error("相机类型错误！");

        if (type === Camera.PERSPECTIVE) {
            if (zFar < zNear) throw new Error("透视投影错误");
        }

        this.aspect = width / height;
    }

}

class Render {

    private gl: WebGL2RenderingContext;

    // vertex shader program
    private vsSource: string;

    // fragment shader program
    private fsSource: string;

    constructor(gl: WebGL2RenderingContext, vsSource?: string, fsSource?: string) {
        if (!gl) {
            throw new Error("请传入WebGL2的上下文");
        }
        this.gl = gl;
        if (vsSource) {
            this.vsSource = vsSource;
        }
        else {
            this.vsSource = `
                attribute vec4 aVertexPosition;
        
                uniform mat4 uModelViewMatrix;
                uniform mat4 uProjectionMatrix;
        
                void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            `;
        }
        if (fsSource) {
            this.fsSource = fsSource;
        } else {
            this.fsSource = `
                void main() {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            `;
        }
    }

    // 创建指定类型的着色器，上传source源码并编译
    private loadShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // 创建着色程序
    private initShaderProgram(vsSource?: string, fsSource?: string): WebGLProgram {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, this.vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, this.fsSource);

        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        // 创建失败， alert
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    // 2D顶点缓冲器
    public initBuffers2D(vertices: Array<Vector2>): any {
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(flatArrary(vertices)), this.gl.STATIC_DRAW);

        return {
            position: positionBuffer
        }
    }

    public renderScene() {

    }
}