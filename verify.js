const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { performance } = require('perf_hooks');

const codePath = path.resolve(process.env.VERIFY_CODE || path.join(__dirname, 'dist', 'all.min.js'));

// 创建最小浏览器沙箱，只保留 AI 运行必须依赖的 DOM / canvas 接口。
function createContext(code) {
    let canvas;
    const ctx2d = new Proxy({}, {
        get(target, prop) {
            if (prop === 'measureText') return text => ({ width: String(text).length * 16 });
            if (prop === 'canvas') return canvas;
            return target[prop] || (() => {});
        },
        set(target, prop, value) {
            target[prop] = value;
            return true;
        }
    });
    canvas = {
        width: 1200,
        height: 800,
        style: {},
        getContext: () => ctx2d,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 })
    };
    const elements = {
        gameCanvas: canvas,
        sound: { src: '' },
        step: { innerHTML: '' }
    };
    const sandbox = {
        console,
        Math,
        Date,
        setTimeout: () => 0,
        clearTimeout: () => {},
        setInterval: () => 1,
        clearInterval: () => {},
        requestAnimationFrame: () => 0,
        location: { reload: () => {} },
        document: {
            title: '',
            getElementById: id => elements[id] || { style: {}, innerHTML: '' },
            onkeydown: null
        },
        window: {
            innerWidth: 1200,
            innerHeight: 800,
            onload: null,
            onresize: null
        },
        Image: function Image() {
            this.onload = null;
            Object.defineProperty(this, 'src', {
                set: () => {
                    if (typeof this.onload === 'function') this.onload();
                },
                get: () => ''
            });
        }
    };
    sandbox.window.window = sandbox.window;
    sandbox.window.document = sandbox.document;
    sandbox.global = sandbox;
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { timeout: 10000 });
    return sandbox;
}

// 执行单局模拟；禁用绘制只影响验证速度，不改变蛇、食物和路线决策数据。
function runGame(index, code, progressBuffer) {
    const sandbox = createContext(code);
    sandbox.window.onload();
    sandbox.map.drawScene = () => {};
    sandbox.snake.direct = 'R';

    let steps = 0;
    let loopDetected = false;
    const maxSteps = 12000;
    const stateVisits = new Map();
    const progress = progressBuffer ? new Int32Array(progressBuffer) : null;
    const start = performance.now();
    while (sandbox.snake.body.length < 200 && !sandbox.uiState.gameOver && steps < maxSteps) {
        steps++;
        sandbox.snake.move();
        if (sandbox.snake.body.length > 165) {
            // 后期同一完整状态出现 3 次视为确定性循环，提前结束无效验证。
            const stateKey = `${sandbox.food.x},${sandbox.food.y}#${sandbox.snake.direct}#${sandbox.nextpath.join('')}#${sandbox.snake.body.map(item => `${item[0]},${item[1]}`).join('|')}`;
            const visits = (stateVisits.get(stateKey) || 0) + 1;
            if (visits >= 3) {
                loopDetected = true;
                break;
            }
            stateVisits.set(stateKey, visits);
        }
        if (progress && steps % 100 == 0) {
            Atomics.store(progress, 0, steps);
            Atomics.store(progress, 1, sandbox.snake.body.length);
        }
    }
    return {
        game: index,
        full: sandbox.snake.body.length === 200,
        gameOver: !!sandbox.uiState.gameOver,
        loopDetected,
        steps,
        length: sandbox.snake.body.length,
        grade: sandbox.grade,
        ms: Math.round(performance.now() - start)
    };
}

// 主线程按并发数分发 worker，避免手工开多个 Node 进程验证。
async function runMain() {
    const count = Math.max(1, Number(process.argv[2]) || 10);
    const maxConcurrency = Math.max(1, Math.min(2, os.cpus().length - 1 || 1));
    const concurrency = Math.max(1, Math.min(count, Number(process.argv[3]) || maxConcurrency));
    const workerTimeout = 150000;
    const startedAt = performance.now();
    let nextIndex = 1;
    const results = [];

    function runWorker(index) {
        return new Promise((resolve, reject) => {
            const progressBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
            const progress = new Int32Array(progressBuffer);
            const worker = new Worker(__filename, { workerData: { index, codePath, progressBuffer } });
            let settled = false;
            const timeout = setTimeout(() => {
                if (settled) return;
                settled = true;
                worker.terminate();
                resolve({
                    game: index,
                    full: false,
                    gameOver: false,
                    timedOut: true,
                    steps: Atomics.load(progress, 0),
                    length: Atomics.load(progress, 1),
                    grade: Math.max(0, Atomics.load(progress, 1) - 4),
                    ms: workerTimeout
                });
            }, workerTimeout);
            worker.on('message', result => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                resolve(result);
            });
            worker.on('error', error => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                reject(error);
            });
            worker.on('exit', code => {
                if (!settled && code !== 0) {
                    settled = true;
                    clearTimeout(timeout);
                    reject(new Error(`worker exited with code ${code}`));
                }
            });
        });
    }

    async function loop() {
        while (nextIndex <= count) {
            const index = nextIndex++;
            const result = await runWorker(index);
            results.push(result);
            console.log(`game=${result.game}, full=${result.full}, gameOver=${result.gameOver}, loopDetected=${!!result.loopDetected}, timedOut=${!!result.timedOut}, steps=${result.steps}, length=${result.length}, grade=${result.grade}, ms=${result.ms}, error=${result.error || ''}`);
        }
    }

    await Promise.all(Array.from({ length: concurrency }, loop));
    results.sort((a, b) => a.game - b.game);
    const fullResults = results.filter(item => item.full);
    const avg = (items, key) => items.reduce((sum, item) => sum + item[key], 0) / Math.max(items.length, 1);
    console.log(`summary fullCount=${fullResults.length}/${results.length}, avgSuccessSteps=${avg(fullResults, 'steps').toFixed(1)}, avgSuccessMs=${avg(fullResults, 'ms').toFixed(1)}, totalMs=${Math.round(performance.now() - startedAt)}, concurrency=${concurrency}`);
}

if (isMainThread) {
    runMain().catch(error => {
        console.error(error);
        process.exit(1);
    });
} else {
    const code = fs.readFileSync(workerData.codePath, 'utf8');
    try {
        parentPort.postMessage(runGame(workerData.index, code, workerData.progressBuffer));
    } catch (error) {
        const progress = new Int32Array(workerData.progressBuffer);
        parentPort.postMessage({
            game: workerData.index,
            full: false,
            gameOver: false,
            steps: Atomics.load(progress, 0),
            length: Atomics.load(progress, 1),
            grade: Math.max(0, Atomics.load(progress, 1) - 4),
            ms: 0,
            error: error.message
        });
    }
}
