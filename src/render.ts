import * as math from '../assets/gl-matrix';
import { Transform } from './Components';
import { Camera } from './GameObject';
import * as twgl from "twgl.js"

const canvas = document.getElementById('game') as HTMLCanvasElement;
const gl: any = canvas.getContext('webgl2');

const defaultVertexShader = `
    attribute vec4 position;
    attribute vec3 normal;

    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;

    varying vec3 v_normal;

    void main() {
        gl_Position = u_projection * u_view * u_world * position;
        v_normal = mat3(u_world) * normal;
    }
`;

const defaultFragmentShader = `
    precision mediump float;

    varying vec3 v_normal;

    uniform vec4 u_diffuse;
    uniform vec3 u_lightDirection;

    void main () {
    vec3 normal = normalize(v_normal);
        float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
        gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
    }
`;

export function readObjFile(path: string, onSuccess: Function) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        onSuccess(xhr.responseText);
    }
    xhr.open('get', path);
    xhr.send();
}

export function objParser(text: string) {
    // 因为索引是从 1 开始的，所以填充索引为 0 的位置
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];

    // 和 `f` 一样的索引顺序
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
    ];

    // 和 `f` 一样的索引顺序
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
    ];


    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
        });
    }

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    return {
        position: webglVertexData[0],
        texcoord: webglVertexData[1],
        normal: webglVertexData[2],
    };
}

export class Renderer {

    vsSource: string = defaultVertexShader;
    fsSource: string = defaultFragmentShader;
    objData: any;
    bufferInfo: any;
    meshProgramInfo: any;

    constructor(objData: any, vsSource?: string, fsSource?: string) {
        this.objData = objData;
        if (vsSource) this.vsSource = vsSource;
        if (fsSource) this.fsSource = fsSource;
        this.meshProgramInfo = twgl.createProgramInfo(gl, [this.vsSource, this.fsSource]);
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, objData);
    }

    private drawScene(transform: Transform, camera: Camera) {
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = camera.fov;
        const aspect = camera.aspect;
        const zNear = camera.zNear;
        const zFar = camera.zFar;
        const cameraTransform = camera.getComponent(Transform);
        const cameraPos = [cameraTransform.x, cameraTransform.y, cameraTransform.z];
        const lookAtMatrix = math.mat4.create();
        math.mat4.lookAt(lookAtMatrix, cameraPos, camera.lookAt, camera.up);

        // Make a view matrix from the camera matrix.
        const viewMatrix = math.mat4.create();
        math.mat4.invert(viewMatrix, lookAtMatrix);

        const projectionMatrix = math.mat4.create();
        math.mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        const fakeLightDirection = math.vec3.create();
        math.vec3.normalize(fakeLightDirection, [-1, 3, 5]);

        const modelMatrix = transform.globalMatrix;

        const sharedUniforms = {
            u_lightDirection: fakeLightDirection,
            u_view: viewMatrix,
            u_projection: projectionMatrix,
        };

        gl.useProgram(this.meshProgramInfo.program);
        twgl.setBuffersAndAttributes(gl, this.meshProgramInfo, this.bufferInfo);
        twgl.setUniforms(this.meshProgramInfo, sharedUniforms);
        twgl.setUniforms(this.meshProgramInfo, {
            u_world: modelMatrix,
            u_diffuse: [0.5, 1, 0.7, 1]
        });

        twgl.drawBufferInfo(gl, this.bufferInfo);
    }

    render(transform: Transform, camera?: Camera) {
        if (!camera) return;

        this.drawScene(transform, camera);
    }
}