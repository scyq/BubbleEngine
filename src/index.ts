import { GameEngine } from './engine';

const engine: GameEngine = new GameEngine();
const sceneConfig = [
    { type: 'bitmap', id: "earth", properties: { x: 0, y: 0, source: './assets/earth.png' } },
    { type: 'bitmap', properties: { x: 0, y: 0, source: './assets/moon.png' } },
    { type: 'bitmap', properties: { x: 0, y: 0, source: './assets/sun.png' } },
    { type: 'textfield', properties: { x: 0, y: 0, text: '我做的都是动画，这要臣妾怎么办？', color: '#ffffff' } },
    { type: 'rectangle', properties: { x: 500, y: 500, color: '#6429ec', alpha: 0.7 } }
];

let images: Array<string> = [];
for (let config of sceneConfig) {
    if (config['type'] === 'bitmap') {
        images.push(config['properties']['source']);
    }
}

// let move: Move;

engine.onStart = () => {

}

engine.onUpdate = (deltaTime) => {

}

engine.onTick = () => {
    // move.tick();
}

engine.test();

engine.start(images, sceneConfig);

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