import { GameEngine } from './engine';

const engine: GameEngine = new GameEngine();
const sceneConfig = [
    { type: 'rectangle', properties: { width: 2, height: 1 } },
    { type: 'rectangle', properties: { width: 0.5, height: 0.5, color: [123, 47, 32] } }
];

// let move: Move;

engine.onStart = () => {

}

engine.onUpdate = (deltaTime) => {

}

engine.onTick = () => {
    // move.tick();
}

engine.start([], sceneConfig);

// class Move {
//     private totalTime: number = 0;
//     private initX = 0;
//     private initY = 0;

//     constructor(private gameObject: GameObject, private speed: number) {
//         this.initX = gameObject.x;
//         this.initY = gameObject.y;
//     }

//     tweenUpdate(deltaTime: number) {
//         this.totalTime += deltaTime;
//         this.gameObject.x = this.initX + this.totalTime / 1000 * this.speed;
//     }

//     tick() {
//         this.gameObject.x += 1;
//     }
// }