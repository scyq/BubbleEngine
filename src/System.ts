import { GameObject } from "./GameObject";


export class System {
    rootGameObject: GameObject;
    onStart() { };
    onFrame(duringTime: number) { };
}

export class LifeCycleSystem extends System {

    currentTime: number = 0;

    onFrame(duringTime: number) {
        this.currentTime += duringTime;
        const fps: number = 60;
        const mileSecondPerTick: number = 1000 / fps;
        // fixedUpdate 有bug，暂时未修复
        // while (this.currentTime >= mileSecondPerTick) {
        //     this.currentTime -= mileSecondPerTick;
        //     // this.gameObjectOnFixUpdate(this.rootGameObject, this.mileSecondPerTick);
        // }
        this.gameObjectOnUpdate(this.rootGameObject, duringTime)
    }

    gameObjectOnUpdate(gameObject: GameObject, duringTime: number) {
        for (const component of gameObject.components) {
            component.onUpdate(duringTime);
        }
        for (const child of gameObject.children) {
            this.gameObjectOnUpdate(child, duringTime);
        }
    }

    gameObjectOnFixUpdate(gameObject: GameObject, duringTime: number) {
        for (const component of gameObject.components) {
            component.onFixUpdate(duringTime);
        }
        for (const child of gameObject.children) {
            this.gameObjectOnFixUpdate(child, duringTime);
        }
    }
}