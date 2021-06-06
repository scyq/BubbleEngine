import { createComponent, MeshRender, Script } from "./Components";
import { GameObject } from "./GameObject";
import { LifeCycleSystem, System } from "./System";

const canvas = document.getElementById('game') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');

function readSceneJson(path: string, onSuccess: Function) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        onSuccess(xhr.responseText);
    }
    xhr.open('get', path);
    xhr.send();
}

export class GameEngine {

    private lastTime: number = 0;
    private rootGameObject: GameObject;
    private systems: System[] = [];

    runMode: "running" | "edit" = "running";

    constructor() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    start() {
        this.loadScene("../scene/defaultScene.json", () => {
            const initTime = Date.now();
            if (this.runMode === "running") {
                this.registerSystem(new LifeCycleSystem());
            }
            this.enterFrame(initTime);
        });
    }

    // 心跳控制器
    enterFrame(enterTime: number) {
        const duringTime = enterTime - this.lastTime;
        this.lastTime = enterTime;
        this.onEnterFrame(duringTime);
        requestAnimationFrame(enterTime => this.enterFrame(enterTime));
    }

    private onEnterFrame(duringTime: number) {
        for (const system of this.systems) {
            system.onFrame(duringTime);
        }
    }

    registerSystem(system: System) {
        this.systems.push(system);
        system.rootGameObject = this.rootGameObject;
        system.onStart();
    }

    loadScene(path: string, onSuccess: Function) {
        readSceneJson(path, content => {
            const sceneConfig = JSON.parse(content);
            const root = this.createGameObjectFromConfig(sceneConfig);
            this.rootGameObject = root;
            onSuccess();
        })
    }

    private createGameObjectFromConfig(config: any): GameObject {
        const { children } = config;
        let gameObject: GameObject = new GameObject;
        if (children) {
            for (const child of children) {
                const childGameObject = this.createGameObjectFromConfig(child);
                gameObject.addChild(childGameObject);
            }
        }
        const componentConfigs = config.components || [];
        for (const componentConfig of componentConfigs) {
            const component = createComponent(componentConfig);
            gameObject.addComponent(component);
        }
        return gameObject;
    }

}

