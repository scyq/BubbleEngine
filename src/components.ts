import { GameObject, Camera } from "./GameObject";
import * as math from '../assets/gl-matrix';
import { Renderer } from "./Render";
import { getModelInfo } from "./Model";


let componentId = -1;
function createComponentId() {
    return componentId++;
}

export function createComponent(config: any): Component {
    switch (config.name) {
        case "Transform":
            return new Transform();
        case "MeshRender":
            return new MeshRender(config.properties.type);
        case "Script":
            return new Script(config.properties.path);
        default:
            break;
    }
    return null;
}


export class Component {
    static componentStore: { [componentId: number]: Component } = {};

    static get(compnentId: number) {
        return Component.componentStore[compnentId];
    }

    componentId: number;

    constructor() {
        this.componentId = createComponentId();
        Component.componentStore[this.componentId] = this;
    }

    // 双向绑定
    gameObject: GameObject;

    onStart() {
    }

    onUpdate(duringTime: number) {
    }

    onFixUpdate(durtingTime: number) {

    }

    onEnd() {
    }
}

export class Transform extends Component {

    x: number = 0;
    y: number = 0;
    z: number = -6.0;
    scaleX: number = 1;
    scaleY: number = 1;
    scaleZ: number = 1;
    rotationX: number = 0;  // degree
    rotationY: number = 0;  // degree
    rotationZ: number = 0;  // degree

    modelViewMatrix: any = math.mat4.create();
    globalMatrix: any = math.mat4.create();

    constructor() {
        super();
        this.updateModelViewMatrix();
    }

    private deg2rad(deg: number) {
        return deg * Math.PI / 180;
    }

    private updateModelViewMatrix() {
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = math.mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        math.mat4.translate(
            modelViewMatrix,    // destination matrix
            modelViewMatrix,    // matrix to translate
            [this.x, this.y, this.z]    // amount to translate
        );

        math.mat4.rotateX(modelViewMatrix, modelViewMatrix, this.deg2rad(this.rotationX));
        math.mat4.rotateY(modelViewMatrix, modelViewMatrix, this.deg2rad(this.rotationY));
        math.mat4.rotateZ(modelViewMatrix, modelViewMatrix, this.deg2rad(this.rotationZ));
        math.mat4.scale(modelViewMatrix, modelViewMatrix, [this.scaleX, this.scaleY, this.scaleZ]);

        this.modelViewMatrix = modelViewMatrix;
    }

    onUpdate() {
        this.updateModelViewMatrix();
    }

    // private updateGlobalMatrix() {
    //     const globalMatrix = math.mat4.create();
    //     if (this.gameObject.parent) {
    //         math.mat4.multiply(globalMatrix, this.gameObject.parent)
    //     } else {

    //     }
    // }
}

export class MeshRender extends Component {
    modelInfo: any;
    renderer: Renderer;

    constructor(type?: string) {
        super();
        if (type) this.modelInfo = getModelInfo(type);
        this.renderer = new Renderer(this.modelInfo);
    }

    render(cam: Camera) {
        this.renderer.render(this.gameObject.getComponent(Transform), cam);
    }

    onUpdate(duringTime: number) {
        this.render(Camera.getInstance());
    }
}

export class Script extends Component {
    path: string = null;    // 必须是相对路径
    constructor(path?: string) {
        super();
        if (path) this.path = path;
    }

    onUpdate(duringTime: number) {
        // if (this.path) {
        //     import * as script from this.path;
        //     script.onUpdate(this.gameObject);
        // }
        this.gameObject.getComponent(Transform).rotationX += 0.5;
        this.gameObject.getComponent(Transform).rotationY += 0.5;
        this.gameObject.getComponent(Transform).rotationZ += 0.5;
    }
}