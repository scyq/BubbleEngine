// import { GameObject } from './entities';
// import { Matrix4 } from './math';

// export class Behaviour {

//     // 关联的GameObject
//     gameObject: GameObject;

//     private static behaviourIdIndex: number = 1;
//     private static allBehaviors: { [behaviourId: number]: Behaviour } = {}
//     behaviourId: number = 0;

//     static getBehaviour(behaviourId: number) {
//         return Behaviour.allBehaviors[behaviourId];
//     }

//     constructor() {
//         this.behaviourId = Behaviour.behaviourIdIndex++;
//         Behaviour.allBehaviors[this.behaviourId] = this;
//     }

//     onStart() {

//     }

//     onUpdate(deltaTime: number) {

//     }

//     onDestroy() {

//     }
// }

// export class Transform extends Behaviour {
//     x: number = 0;
//     y: number = 0;
//     z: number = 0;
//     scaleX: number = 1;
//     scaleY: number = 1;
//     scaleZ: number = 1;
//     rotationX: number = 0;
//     rotationY: number = 0;
//     rotationZ: number = 0;

//     /**
//      * 相对矩阵
//      */
//     localMatrix: Matrix4;

//     /**
//      * 绝对矩阵
//      */
//     globalMatrix: Matrix4;

//     constructor() {
//         super();
//         this.localMatrix = new Matrix4();
//         this.globalMatrix = new Matrix4();
//     }

//     calculateGloablMatrix(): void {
//         if (!this.gameObject.parent) {
//             return;
//         }


//     }
// }

