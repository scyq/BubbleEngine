import { Component, Transform } from './Components';

let objId = -1;

function createObjId() {
    return objId++;
}

export class GameObject {
    static gameObjectStore: { [objId: number]: GameObject } = {};

    static get(objId: number) {
        return GameObject.gameObjectStore[objId];
    }

    readonly objId: number;
    name: string;
    parent: GameObject | null = null;
    children: GameObject[] = [];
    components: Component[] = [];

    constructor() {
        this.objId = createObjId();
        this.name = 'GameObject' + this.objId;
        GameObject.gameObjectStore[this.objId] = this;
        const transform = new Transform();
        this.addComponent(transform);
    }

    addChild(child: GameObject) {
        this.children.push(child);
        child.parent = this;
    }

    addComponent(component: Component) {
        this.components.push(component);
        component.gameObject = this;
    }

    getComponent<T extends typeof Component>(clz: T): InstanceType<T> {
        for (const component of this.components) {
            const b = component as any;
            if ((component as any).constructor === clz) {
                return component as any;
            }
        }
        return null;
    }

}

// 为了简化设计，Camera没有设计为GameObject
// 暂时不支持多相机
// 暂时不支持相机移动
// 暂时使用单例模型
export class Camera {
    fov: number;    // in randians
    aspect: number;
    zNear: number;
    zFar: number;

    private static instance: Camera;

    public static getInstance() {
        if (!Camera.instance) {
            Camera.instance = new Camera();
        }
        return Camera.instance;
    }

    constructor(fov: number = 45 * Math.PI / 180, aspect: number = 4 / 3, zNear: number = 0.1, zFar: number = 100.0) {
        this.fov = fov;
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;
    }
}