import { GameObject, Rectangle } from "./components";
import { flatArray2D, Matrix4, Vector2, perspProjectionMatrix, baseTranlate, scale } from "./math";

export class Camera {
    static PERSPECTIVE: number = 0;
    static ORTHOGRAPHIC: number = 1;

    type: number;
    fov: number;    // Field of View in Radian
    aspect: number;
    zNear: number;
    zFar: number;

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
        this.fov = fov;
        this.zFar = zFar;
        this.zNear = zNear;
    }

}

export class Renderer {

    private gl: WebGL2RenderingContext;

    // vertex shader program
    private vsSource: string;

    // fragment shader program
    private fsSource: string;

    private renderList: GameObject[];

    constructor(gl: WebGL2RenderingContext, renderList: GameObject[], vsSource?: string, fsSource?: string) {
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
                attribute vec4 aVertexColor;

                uniform mat4 uModelViewMatrix;
                uniform mat4 uProjectionMatrix;
                uniform mat4 uAffine;

                varying lowp vec4 vColor;

                void main(void) {
                    gl_Position = uAffine * uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                    vColor = aVertexColor;
                }
            `;
        }
        if (fsSource) {
            this.fsSource = fsSource;
        } else {
            this.fsSource = `
                varying lowp vec4 vColor;
                void main() {
                    gl_FragColor = vColor;
                }
            `;
        }
        this.renderList = renderList;
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
    private initShaderProgram(): WebGLProgram {
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

    /**
     * 2D对象顶点缓冲区
     */
    public static initBuffers2D(gl: WebGL2RenderingContext, vertices: Array<Vector2>, color: Array<number>): WebGLBuffer {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatArray2D(vertices)), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            color: colorBuffer
        }
    }

    private drawScene(camera: Camera, programInfo: any) {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1); // clear everything
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);


        // 正交投影先不考虑，先只考虑了透视投影
        let projection = perspProjectionMatrix(
            camera.fov,
            camera.aspect,
            camera.zNear,
            camera.zFar
        );

        let modelViewMatrix = new Matrix4();
        modelViewMatrix = baseTranlate([0, 0, -6], modelViewMatrix);

        this.gl.useProgram(programInfo.program);

        // set shader uniforms
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projection.matrix);
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix.matrix);

        for (const obj of this.renderList) {
            obj.render(this.gl, programInfo);
        }
    }

    public render(camera: Camera) {
        const shaderProgram = this.initShaderProgram();

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                affineMatrix: this.gl.getUniformLocation(shaderProgram, "uAffine")
            },
        };

        this.drawScene(camera, programInfo);

    }
}