// import { GameEngine } from './engine';
// const engine: GameEngine = new GameEngine();
import { Renderer, Camera } from './render';

const camera = new Camera();
const renderer = new Renderer();
renderer.render(camera);