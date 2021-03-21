import { GameEngine, TextField } from '../src/engine';

let canvas: HTMLCanvasElement;
describe('GameEngine', () => {
    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.width = 800;
        canvas.height = 800;
        if (document.body.children[0]) {
            document.body.removeChild(document.body.children[0]);
        }
        document.body.appendChild(canvas);
    });
    describe('TextField', () => {
        it('render', () => {
            const gameEngine = new GameEngine();
            const textField = new TextField();
            textField.text = 'Hello,World';
            gameEngine.addGameObject(textField);
            const context = canvas.getContext('2d') as any;
            gameEngine.draw(context);

            const dc = context.__getDrawCalls();
            expect(dc).toMatchSnapshot();
        })
        it('render-2', () => {
            const gameEngine = new GameEngine();
            const textField = new TextField();
            textField.text = 'Hello, World';
            gameEngine.addGameObject(textField);
            const context = canvas.getContext('2d') as any;
            gameEngine.draw(context);
            const dc = context.__getDrawCalls();
            expect(dc).toMatchSnapshot();
        })
    });
});
