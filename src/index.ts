import { GameEngine } from './engine';

const engine: GameEngine = new GameEngine();
const sceneConfig = [
    { type: 'circle', properties: { color: [0, 0, 255, 1] } }
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