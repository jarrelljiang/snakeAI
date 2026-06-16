//模拟的键盘事件会产生长按效果，哪怕只执行一次,所以用外挂的时候应该把长按加速功能注释掉
function fireKeyEvent(el, evtType, keyCode) {
    var doc = el.ownerDocument,
        win = doc.defaultView || doc.parentWindow,
        evtObj;
    if (doc.createEvent) {
        if (win.KeyEvent) {
            evtObj = doc.createEvent('KeyEvents');
            evtObj.initKeyEvent(evtType, true, true, win, false, false, false, false, keyCode, 0);
        }
        else {
            evtObj = doc.createEvent('UIEvents');
            Object.defineProperty(evtObj, 'keyCode', {
                get: function () { return this.keyCodeVal; }
            });
            Object.defineProperty(evtObj, 'which', {
                get: function () { return this.keyCodeVal; }
            });
            evtObj.initUIEvent(evtType, true, true, win, 1);
            evtObj.keyCodeVal = keyCode;
            if (evtObj.keyCode !== keyCode) {
                console.log("keyCode " + evtObj.keyCode + " 和 (" + evtObj.which + ") 不匹配");
            }
        }
        el.dispatchEvent(evtObj);
    }
    else if (doc.createEventObject) {
        evtObj = doc.createEventObject();
        evtObj.keyCode = keyCode;
        el.fireEvent('on' + evtType, evtObj);
    }
}
function checkLonely(map, cunrrentPoint) {
    var n = map.length - 1;
    var m = map[0].length - 1;
    if (cunrrentPoint.x >= 0 && cunrrentPoint.x <= n && cunrrentPoint.y >= 0 && cunrrentPoint.y <= m) {
        if (map[cunrrentPoint.x][cunrrentPoint.y] == 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
//BFS算法
var one = [[0, 1], [0, -1], [-1, 0], [1, 0]];//右左上下移动坐标的变化
//这个顺序决定有多条最短路线时走哪条
var nextpath = ["R", "L", "U", "D"];//右左上下移动的表示
//点类记录当前坐标，步数，路径,step表示从出发到当前点经过几步,path表示从出发到当前点经过路径
function Point(x, y, step, path) {
    this.x = x;
    this.y = y;
    this.step = step;
    this.path = path;
}
//判断点是否出界或被访问过
function check(map, cunrrentPoint) {
    var n = map.length - 1;
    var m = map[0].length - 1;
    if (cunrrentPoint.x < 0 || cunrrentPoint.x > n || cunrrentPoint.y < 0 || cunrrentPoint.y > m || map[cunrrentPoint.x][cunrrentPoint.y] == 1)
        return false;
    return true;
}
//BFS搜索最短路径
var minPath = [];//最短路径
var minStep = 10000//最小步数
var bfsMax = ''
var bfsNextFarDiret = []
//参数isMovetoTail名字没取好，这个参数只是用来标注走最远路线的
function BFS(map, startArr, endArr, farDiret, isMovetoTail, isMovetoFood) {
    minPath = [];//最短路径
    minStep = 10000//最小步数
    var list = [];
    list.push(new Point(startArr[0], startArr[1], 0, ''))//向队列中加入第一个点
    while (list.length != 0) {
        //cunrrentPoint的坐标是终点的个数只可能是一个，因为遍历是有先后顺序的，先遍历到终点的点就已经把坐标给占了，标为1了，后面的不能访问
        //console.log(cunrrentPoint.x,cunrrentPoint,y)打印出来所有的坐标中只有一个等于终点坐标，所以judge函数其实没用，不会执行
        var cunrrentPoint = list[0];//当队列中有点时，取出点比较是否为终点
        list.shift();//删除该点
        if (cunrrentPoint.x == endArr[0] && cunrrentPoint.y == endArr[1]) {
            if (minStep > cunrrentPoint.step) {
                minStep = cunrrentPoint.step;
                minPath.push(cunrrentPoint.path);
            } else if (minStep == cunrrentPoint.step) {
                minPath.push(cunrrentPoint.path);
            }
            continue;

        }
        //如果不是终点，依次尝试访问右左上下，并加入队列继续循环
        for (var i = 0; i < 4; i++) {
            var x = cunrrentPoint.x + one[i][0];
            var y = cunrrentPoint.y + one[i][1];
            var step = cunrrentPoint.step + 1;
            var path = cunrrentPoint.path + nextpath[i];
            var point = new Point(x, y, step, path);
            if (check(map, point)) {
                list.push(point);
                if (x != endArr[0] || y != endArr[1]) {
                    map[x][y] = 1;
                }
            }
        }
    }
    //console.log(minPath, minStep == 10000 ? '没有通路' : minStep);//循环结束输出最短步数及路径
    /* if (isMovetoTail && minPath[0] && minPath[0].length >= bfsMax.length) {
        //发现长度相等的路线时，直接push进去，发现长度更长的路线路线时，把整个数组清空，再把这条长路线push进去
        if (minPath[0].length > bfsMax.length && bfsNextFarDiret.length > 0) {
            bfsNextFarDiret = []
        }
        bfsMax = minPath[0]
        bfsNextFarDiret.push(farDiret)
    } */
    if (isMovetoTail && minPath[0]) {
        bfsNextFarDiret.push(farDiret + minPath[0])
    }
    //如果蛇头周围4个方向格子中正好有1个是食物位置，就把这个方向算进去
    /* 
        注意还需要加一个限制参数isMovetoFood：参数isMovetoTail名字没取好，这个参数只是用来标注走最远路线的，而追尾巴时和大后期吃食物
        都是要走最远路线的，如果不再加个限制来区分，那么追尾巴时的处理函数里面的虚拟蛇也可能会触发走下面的if，
        从而导致蛇头不能走正确的方向追蛇尾，而去走它旁边的食物的方向。
     */
    if (isMovetoFood && snake.virtualSnakeHasEat) {
        //console.log('最远距离吃食物，且食物刚好在旁边')
        bfsNextFarDiret.push(farDiret)
        snake.virtualSnakeHasEat = false//这行一定不能漏，要不然循环到下一个方向时会受影响
    }
    return;
}
//DFS搜索最长路径
var total = 0
var max = []
var next = [[0, 1], [1, 0], [0, -1], [-1, 0]]//右下左上
var d = ['R', 'D', 'L', 'U']
function DFS(map, startArr, endArr, diret) {
    total++
    var t = []//下一步的坐标
    if (startArr[0] == endArr[0] && startArr[1] == endArr[1]) {//是否到达终点
        if (max.length == 0 || diret.length >= max[0].length) {
            if (max.length == 0 || diret.length > max[0].length) {
                max = []
                max.push(diret)
            } else if (diret.length == max[0].length && diret[0] != max[0][0]) {
                if (max[1]) {
                    diret[0] != max[1][0] && max.push(diret);
                } else {
                    max.push(diret)
                }
            }
        }
        return;
    }
    //枚举4个方向的走法
    for (var k = 0; k < 4; k++) {
        if (total > 1000000) break;
        t[0] = startArr[0] + next[k][0]
        t[1] = startArr[1] + next[k][1]
        if (t[0] < 0 || t[0] > map.length - 1 || t[0] < 0 || t[1] > map[0].length - 1) {//越界
            continue;
        }
        if (map[t[0]][t[1]] == 0) {
            map[t[0]][t[1]] = 1//标记走过
            DFS(map, [t[0], t[1]], endArr, diret + d[k]);
            map[t[0]][t[1]] = 0//一个方向尝试结束后取消标记
        }
    }
    return
}


var map;  //地图
var snake; //蛇
var food;  //食物
var timer; //定时器
var initSpeed = 30; //初始定时器时间间隔（毫秒）,间接代表蛇移动速度
var grade = 0;  //积分
var flag = 1;   //（可间接看做）关卡
var isBegin = false;
var imageCache = {}; //canvas 绘制使用的图片缓存，避免每帧重复创建 Image。
var step = 0;
var uiState = {
    started: false,
    startFading: false,
    startFadeTime: 0,
    bootTime: 0,
    scoreTop: 0,
    scoreAnimating: false,
    scoreAnimationStart: 0,
    firstScore: 4,
    secondScore: 4,
    gameOver: false,
    gameOverScore: 0,
    pass: false,
    startHover: false,
    hitAreas: {},
    bubbles: []
}; //界面状态全部由 canvas 消费，核心蛇逻辑只负责更新游戏数据。

// 生成背景气泡参数，用于替代原 bubbly-bg 生成的额外 DOM canvas。
function initBubbles() {
    uiState.bubbles = [];
    for (var i = 0; i < 18; i++) {
        uiState.bubbles.push({
            x: Math.random(),
            y: Math.random(),
            r: 8 + Math.random() * 36,
            speed: 0.15 + Math.random() * 0.45,
            hue: Math.random() * 50
        });
    }
}

// 播放音效，保留原来的 audio 标签但不依赖 document.all。
function playSound(src) {
    var sound = document.getElementById('sound');
    if (sound) sound.src = src;
}

// 读取并缓存 canvas 图片，图片加载完成后自动触发一次重绘。
function getCanvasImage(src) {
    if (!imageCache[src]) {
        var img = new Image();
        imageCache[src] = {
            img: img,
            loaded: false
        };
        img.onload = function () {
            imageCache[src].loaded = true;
            renderGame();
        };
        img.src = src;
    }
    return imageCache[src];
}

// 在 canvas 上创建圆角裁剪路径，用来还原原 DOM 蛇身的圆角视觉。
function createRoundRectPath(ctx, x, y, width, height, radius) {
    var r = radius || [0, 0, 0, 0];
    ctx.beginPath();
    ctx.moveTo(x + r[0], y);
    ctx.lineTo(x + width - r[1], y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r[1]);
    ctx.lineTo(x + width, y + height - r[2]);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r[2], y + height);
    ctx.lineTo(x + r[3], y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r[3]);
    ctx.lineTo(x, y + r[0]);
    ctx.quadraticCurveTo(x, y, x + r[0], y);
    ctx.closePath();
}

// 绘制单个格子图片，支持旧 DOM 里的 backgroundSize、backgroundPosition 和 borderRadius 效果。
function drawTileImage(ctx, src, x, y, width, height, options) {
    var cached = getCanvasImage(src);
    if (!cached.loaded) return;

    var opts = options || {};
    var drawWidth = opts.width || width;
    var drawHeight = opts.height || height;
    var drawX = x + (opts.offsetX || 0);
    var drawY = y + (opts.offsetY || 0);

    if (opts.centerX) drawX = x + (width - drawWidth) / 2;
    if (opts.centerY) drawY = y + (height - drawHeight) / 2;

    ctx.save();
    if (opts.radius) {
        createRoundRectPath(ctx, drawX, drawY, drawWidth, drawHeight, opts.radius);
        ctx.clip();
    }
    ctx.drawImage(cached.img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
}

// 根据蛇身相邻节点计算当前格子应该使用的贴图和绘制参数。
function getSnakeSegmentPaint(body, index) {
    var segment = body[index];
    var segx = segment[0];
    var segy = segment[1];
    var tile = 40;
    var paint = {
        src: './images/body1.png',
        width: tile,
        height: tile
    };

    if (index == 0) {
        var nseg = body[index + 1];
        if (!nseg || segy < nseg[1]) {
            paint.src = './images/head-up.png';
            paint.width = tile * 0.88;
            paint.centerX = true;
        } else if (segx > nseg[0]) {
            paint.src = './images/head-right.png';
            paint.height = tile * 0.88;
            paint.centerY = true;
        } else if (segy > nseg[1]) {
            paint.src = './images/head-down.png';
            paint.width = tile * 0.88;
            paint.centerX = true;
        } else if (segx < nseg[0]) {
            paint.src = './images/head-left.png';
            paint.height = tile * 0.88;
            paint.centerY = true;
        }
        return paint;
    }

    if (index == body.length - 1) {
        var prevTail = body[index - 1];
        if (prevTail[1] < segy) {
            paint.src = './images/tail-up.png';
            paint.width = tile * 0.88;
            paint.centerX = true;
        } else if (prevTail[0] > segx) {
            paint.src = './images/tail-right.png';
            paint.height = tile * 0.88;
            paint.centerY = true;
        } else if (prevTail[1] > segy) {
            paint.src = './images/tail-down.png';
            paint.width = tile * 0.88;
            paint.centerX = true;
        } else if (prevTail[0] < segx) {
            paint.src = './images/tail-left.png';
            paint.height = tile * 0.88;
            paint.centerY = true;
        }
        return paint;
    }

    var pseg = body[index - 1];
    var nseg = body[index + 1];
    if (index == body.length - 2) {
        if (pseg[1] < segy) {
            paint.src = './images/tail2-up.png';
        } else if (pseg[0] > segx) {
            paint.src = './images/tail2-right.png';
        } else if (pseg[1] > segy) {
            paint.src = './images/tail2-down.png';
        } else if (pseg[0] < segx) {
            paint.src = './images/tail2-left.png';
        }
    }

    if (pseg[0] < segx && nseg[1] > segy || nseg[0] < segx && pseg[1] > segy) {
        paint.offsetX = -2.5;
        paint.offsetY = 2.5;
        paint.radius = [0, 30, 0, 5];
    } else if (pseg[1] < segy && nseg[0] < segx || nseg[1] < segy && pseg[0] < segx) {
        paint.offsetX = -2.5;
        paint.offsetY = -2.5;
        paint.radius = [5, 0, 30, 0];
    } else if (pseg[0] > segx && nseg[1] < segy || nseg[0] > segx && pseg[1] < segy) {
        paint.offsetX = 2.5;
        paint.offsetY = -2.5;
        paint.radius = [0, 5, 0, 30];
    } else if (pseg[1] > segy && nseg[0] > segx || nseg[1] > segy && pseg[0] > segx) {
        paint.offsetX = 2.5;
        paint.offsetY = 2.5;
        paint.radius = [30, 0, 5, 0];
    } else if (pseg[0] < segx && nseg[0] > segx || nseg[0] < segx && pseg[0] > segx) {
        paint.height = tile * 0.88;
        paint.centerY = true;
    } else if (pseg[1] < segy && nseg[1] > segy || nseg[1] < segy && pseg[1] > segy) {
        paint.width = tile * 0.88;
        paint.centerX = true;
    }

    return paint;
}

// 绘制带透明度的图片，图片未加载完成时跳过并等待 onload 重绘。
function drawImageAsset(ctx, src, x, y, width, height, alpha) {
    var cached = getCanvasImage(src);
    if (!cached.loaded) return;
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * (alpha == null ? 1 : alpha);
    ctx.drawImage(cached.img, x, y, width, height);
    ctx.restore();
}

// 以图片中心点为旋转轴绘制图片，用来还原原 DOM transition rotate 效果。
function drawRotatedImageAsset(ctx, src, x, y, width, height, angle, alpha) {
    var cached = getCanvasImage(src);
    if (!cached.loaded) return;
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * (alpha == null ? 1 : alpha);
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angle);
    ctx.drawImage(cached.img, -width / 2, -height / 2, width, height);
    ctx.restore();
}

// 判断鼠标点击是否落在 canvas 记录的热区里。
function hitTest(area, x, y) {
    return area && x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height;
}

// 绘制圆角按钮，替代原来的 DOM button 和 a.button。
function drawCanvasButton(ctx, text, x, y, width, height, options) {
    var opts = options || {};
    ctx.save();
    ctx.shadowColor = opts.shadow || 'rgba(200,2,1,0.55)';
    ctx.shadowBlur = opts.shadowBlur == null ? 10 : opts.shadowBlur;
    ctx.fillStyle = opts.background || 'rgb(247, 243, 190)';
    createRoundRectPath(ctx, x, y, width, height, [6, 6, 6, 6]);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = opts.color || 'rgb(200, 2, 1)';
    ctx.font = opts.font || '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);

    if (opts.light) {
        createRoundRectPath(ctx, x, y, width, height, [6, 6, 6, 6]);
        ctx.clip();
        var lightX = x + ((Date.now() / 5) % (width + 100)) - 50;
        ctx.globalAlpha = 0.65;
        ctx.translate(lightX, y + height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-45, -4, 90, 8);
    }
    ctx.restore();
}

// 绘制分数滚动动画，模拟原 scoreBox top 从 0 到 -32px 的过渡。
function drawScoreBoard(ctx, x, y) {
    var progress = 1;
    if (uiState.scoreAnimating) {
        progress = Math.min((Date.now() - uiState.scoreAnimationStart) / 1200, 1);
        if (progress >= 1) {
            uiState.scoreAnimating = false;
            uiState.firstScore = uiState.secondScore;
        }
    }

    var offsetY = -32 * progress;
    ctx.save();
    ctx.font = 'bold 28px Arial';
    var firstText = String(uiState.firstScore);
    var secondText = String(uiState.secondScore);
    var scoreWidth = Math.max(42, Math.ceil(Math.max(ctx.measureText(firstText).width, ctx.measureText(secondText).width)) + 16);
    createRoundRectPath(ctx, x, y, scoreWidth, 32, [6, 6, 6, 6]);
    ctx.clip();
    ctx.fillStyle = 'rgba(252, 183, 2, 0.3)';
    ctx.fillRect(x, y, scoreWidth, 32);
    ctx.fillStyle = '#DF130A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstText, x + scoreWidth / 2, y + 17 + offsetY);
    ctx.fillText(secondText, x + scoreWidth / 2, y + 49 + offsetY);
    ctx.restore();
}

// 绘制背景气泡，替代 bubbly-bg 额外插入的背景 canvas。
function drawBubbleBackground(ctx, width, height) {
    ctx.fillStyle = '#fff4e6';
    ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < uiState.bubbles.length; i++) {
        var bubble = uiState.bubbles[i];
        var x = bubble.x * width;
        var y = (bubble.y * height + Date.now() * bubble.speed / 8) % (height + bubble.r * 2) - bubble.r;
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + bubble.hue + ',100%,50%,.3)';
        ctx.arc(x, y, bubble.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 用 canvas 粒子模拟原 fireworks.gif，保持固定位置循环爆开。
function drawCanvasFirework(ctx, x, y, width, height, offset) {
    var now = Date.now() + offset;
    var cycle = (now % 1400) / 1400;
    var centerX = x + width / 2;
    var centerY = y + height / 2;
    var colors = ['#df130a', '#ff7a00', '#ffd447', '#fff2a8'];

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (var ring = 0; ring < 2; ring++) {
        var ringProgress = (cycle + ring * 0.35) % 1;
        var radius = 8 + ringProgress * width * 0.42;
        var alpha = Math.max(0, 1 - ringProgress);
        var count = ring == 0 ? 18 : 12;

        for (var i = 0; i < count; i++) {
            var angle = Math.PI * 2 * i / count + ring * 0.22;
            var sparkX = centerX + Math.cos(angle) * radius;
            var sparkY = centerY + Math.sin(angle) * radius * 0.78;
            var tailX = centerX + Math.cos(angle) * radius * 0.58;
            var tailY = centerY + Math.sin(angle) * radius * 0.45;

            ctx.globalAlpha = alpha * (ring == 0 ? 0.85 : 0.55);
            ctx.strokeStyle = colors[(i + ring) % colors.length];
            ctx.lineWidth = ring == 0 ? 2 : 1.5;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(sparkX, sparkY);
            ctx.stroke();

            ctx.globalAlpha = alpha;
            ctx.fillStyle = colors[(i + 2) % colors.length];
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, ring == 0 ? 2.6 : 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.globalAlpha = 0.7 + Math.sin(cycle * Math.PI * 2) * 0.25;
    ctx.fillStyle = '#fff2a8';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// 计算画布中各个视觉区域的位置，保持原始页面的大致布局。
function getLayout() {
    var width = map && map._map ? map._map.width : window.innerWidth;
    var height = map && map._map ? map._map.height : window.innerHeight;
    var frameWidth = 946;
    var frameHeight = 501;
    var frameX = (width - frameWidth) / 2;
    var frameY = Math.max(170, (height - frameHeight) / 2 + 55);
    return {
        width: width,
        height: height,
        frameX: frameX,
        frameY: frameY,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        boardX: frameX + 73,
        boardY: frameY + 50,
        welcomeX: (width - 1015) / 2,
        welcomeY: (height - 342) / 2 - 15
    };
}

// 绘制游戏主界面，包括提示、得分、AI按钮、地图、蛇和食物。
function drawGameScreen(ctx, layout, alpha) {
    if (!map) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#DF130A';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('按 回车 开始/暂停', layout.width / 2, 60);

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('得分:', layout.width / 2 - 30, 110);
    drawScoreBoard(ctx, layout.width / 2 + 25, 92);

    var buttonText = uiState.pass ? '已通关!!!' : (isBegin ? '点击暂停' : (snake && snake.direct == null ? '开启AI' : '启动AI'));
    uiState.hitAreas.aiButton = { x: layout.width / 2 - 60, y: 140, width: 120, height: 40 };
    drawCanvasButton(ctx, buttonText, uiState.hitAreas.aiButton.x, uiState.hitAreas.aiButton.y, 120, 40, {
        light: !isBegin && !uiState.pass
    });

    ctx.save();
    ctx.translate(layout.frameX + 135, layout.frameY - 10);
    ctx.rotate(-Math.PI / 6);
    drawImageAsset(ctx, './images/pic-l.png', -70, -95, 125, 192, 1);
    ctx.restore();

    ctx.save();
    ctx.translate(layout.frameX + layout.frameWidth - 135, layout.frameY - 10);
    ctx.rotate(Math.PI / 6);
    drawImageAsset(ctx, './images/pic-r.png', -55, -95, 125, 192, 1);
    ctx.restore();

    drawImageAsset(ctx, './images/map.png', layout.frameX, layout.frameY, layout.frameWidth, layout.frameHeight, 1);

    if (food) {
        drawTileImage(ctx, './images/food.png', layout.boardX + food.x * food.width, layout.boardY + food.y * food.height, food.width, food.height);
    }

    if (snake) {
        for (var i = snake.body.length - 1; i >= 0; i--) {
            var segment = snake.body[i];
            var paint = getSnakeSegmentPaint(snake.body, i);
            drawTileImage(ctx, paint.src, layout.boardX + segment[0] * snake.width, layout.boardY + segment[1] * snake.height, snake.width, snake.height, paint);
        }
    }

    if (map.highlightPoint) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        createRoundRectPath(ctx, layout.boardX + map.highlightPoint[0] * 40, layout.boardY + map.highlightPoint[1] * 40, 40, 40, [10, 10, 10, 10]);
        ctx.fill();
    }

    if (!isBegin && snake && snake.direct != null && !uiState.gameOver) {
        ctx.fillStyle = '#DF130A';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Paused...', layout.width / 2, layout.frameY + 235);
    }
    ctx.restore();
}

// 绘制开始页，并保留原版本里文字飞入和 start 缩放的流程感。
function drawStartScreen(ctx, layout) {
    if (uiState.started && !uiState.startFading) return;

    var now = Date.now();
    var bootElapsed = now - uiState.bootTime;
    var fadeProgress = uiState.startFading ? Math.min((now - uiState.startFadeTime) / 2000, 1) : 0;
    var alpha = uiState.startFading ? 1 - fadeProgress : 1;

    if (uiState.startFading && fadeProgress >= 1) {
        uiState.started = true;
        uiState.startFading = false;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    drawImageAsset(ctx, './images/welcome.png', layout.welcomeX, layout.welcomeY, 1015, 342, 1);
    drawCanvasFirework(ctx, layout.welcomeX + 205, layout.welcomeY + 95, 125, 150, 0);
    drawCanvasFirework(ctx, layout.welcomeX + 645, layout.welcomeY + 95, 125, 150, 520);

    var textProgress = Math.min(bootElapsed / 1350, 1);
    var chiProgress = Math.min(bootElapsed / 1000, 1);
    var tanRotation = textProgress * Math.PI * 20;
    var chiRotation = chiProgress * Math.PI * 6;
    var sheRotation = textProgress * Math.PI * 20;
    drawRotatedImageAsset(ctx, './images/tan.png', layout.welcomeX - 562 + (862 * textProgress), layout.welcomeY + 30, 130, 130, tanRotation, 1);
    drawRotatedImageAsset(ctx, './images/chi.png', layout.welcomeX + 405, layout.welcomeY - 515 + (516 * chiProgress), 160, 160, chiRotation, 1);
    drawRotatedImageAsset(ctx, './images/she.png', layout.welcomeX + 1577 - (1037 * textProgress), layout.welcomeY + 34, 130, 130, sheRotation, 1);

    var startDelay = Math.max(bootElapsed - 1600, 0);
    var startProgress = Math.min(startDelay / 700, 1);
    var startScale = 3 - 2 * startProgress;
    var startAlpha = startProgress;
    var startWidth = 200 * startScale;
    var startHeight = 111 * startScale;
    var startX = layout.welcomeX + 380 + (200 - startWidth) / 2;
    var startY = layout.welcomeY + 342 - 60 - startHeight;
    uiState.hitAreas.startButton = { x: layout.welcomeX + 380, y: layout.welcomeY + 171, width: 200, height: 111 };
    drawImageAsset(ctx, uiState.startHover ? './images/start-hover.png' : './images/start.png', startX, startY, startWidth, startHeight, startAlpha);
    ctx.restore();
}

// 绘制 Game Over 弹窗，替代原来的遮罩和 p/a 结构。
function drawGameOver(ctx, layout) {
    if (!uiState.gameOver) return;

    ctx.save();
    ctx.fillStyle = 'rgba(85,85,85,0.7)';
    ctx.fillRect(0, 0, layout.width, layout.height);
    var modalX = layout.width * 0.38;
    var modalY = 200;
    var modalWidth = 300;
    var modalHeight = 376;
    ctx.fillStyle = '#fff';
    createRoundRectPath(ctx, modalX, modalY, modalWidth, modalHeight, [10, 10, 10, 10]);
    ctx.fill();
    ctx.strokeStyle = '#edcf72';
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over!', modalX + modalWidth / 2, modalY + 45);
    drawImageAsset(ctx, './images/cry.gif', modalX + 100, modalY + 85, 100, 100, 1);
    ctx.font = 'bold 34px Arial';
    ctx.fillText('本次得分:', modalX + 130, modalY + 215);
    drawImageAsset(ctx, './images/score-bg.png', modalX + 186, modalY + 184, 90, 78, 1);
    ctx.fillStyle = '#DF130A';
    ctx.font = 'bold 38px Arial';
    ctx.fillText(String(uiState.gameOverScore), modalX + 231, modalY + 225);

    uiState.hitAreas.tryAgain = { x: modalX + 88, y: modalY + 292, width: 124, height: 54 };
    drawCanvasButton(ctx, 'Try again!', uiState.hitAreas.tryAgain.x, uiState.hitAreas.tryAgain.y, 124, 54, {
        background: '#9f8b77',
        color: '#fff',
        shadow: 'transparent',
        shadowBlur: 0,
        font: 'bold 22px Arial'
    });
    ctx.restore();
}

// 单一入口负责绘制整个页面，保证 body 中不再需要其他展示型 DOM。
function renderGame() {
    if (!map || !map.ctx) return;
    var ctx = map.ctx;
    var layout = getLayout();
    uiState.hitAreas = {};
    drawBubbleBackground(ctx, layout.width, layout.height);

    var gameAlpha = uiState.started ? 1 : (uiState.startFading ? Math.min((Date.now() - uiState.startFadeTime) / 2000, 1) : 0);
    drawGameScreen(ctx, layout, gameAlpha);
    drawStartScreen(ctx, layout);
    drawGameOver(ctx, layout);
}

// 持续刷新 canvas，用于背景、开始页动画和按钮扫光效果。
function startRenderLoop() {
    renderGame();
    requestAnimationFrame(startRenderLoop);
}
//地图类
function Map() {
    this.width = 800;
    this.height = 400;
    this.position = 'relative';
    this._map = null;
    this.ctx = null;
    this.highlightPoint = null;
    this.initMapArr = []
    //生成地图
    this.show = function () {
        for (var i = 0; i < this.height / 40; i++) {//注意这里把食物的宽高写死了
            this.initMapArr.push([])
            for (var j = 0; j < this.width / 40; j++) {
                this.initMapArr[i].push(0)
            }
        }

        this._map = document.getElementById('gameCanvas');
        this.resize();
        this.ctx = this._map.getContext('2d');
        this.drawScene();
    }
    //重绘完整游戏画面，蛇、食物、通关高亮都统一走 canvas。
    this.drawScene = function () {
        renderGame();
    }
    //同步 canvas 像素尺寸和视口尺寸，避免绘制被浏览器拉伸。
    this.resize = function () {
        this._map.width = window.innerWidth;
        this._map.height = window.innerHeight;
    }
    //设置通关动画高亮格子，传空值时清除高亮。
    this.setHighlight = function (point) {
        this.highlightPoint = point;
        this.drawScene();
    }
}
//食物类
function Food() {
    this.width = 40;
    this.height = 40;
    this.position = 'absolute';
    this.background = 'url(./images/food.png)';
    this.x = 0;
    this.y = 0;
    //生成食物
    this.show = function () {
        this.x = Math.floor(Math.random() * map.width / this.width);
        this.y = Math.floor(Math.random() * map.height / this.width);
        //新生成的食物不能出现在蛇身(可以利用后面不能撞到蛇身的方法，更简单)(这种方法到后期蛇占据地图很多的时候不行，概率会很低，性能差)
        //新方法，在地图中排除掉蛇占据的坐标，然后在其中随机生成食物
        var mapArr = []
        for (var i = 0; i < map.height / food.height; i++) {
            for (var j = 0; j < map.width / food.width; j++) {
                mapArr.push([j, i])
            }
        }
        var allow = true
        var availableArr = [];
        for (var j = 0; j < mapArr.length; j++) {//把地图的每一个格子一个个拿去给蛇身的每个格子比
            allow = true
            for (var i = 0; i < snake.body.length; i++) {
                if (snake.body[i][0] == mapArr[j][0] && snake.body[i][1] == mapArr[j][1]) {
                    allow = false
                    break;

                }
            }
            if (allow) availableArr.push(mapArr[j])
        }
        var randomIndex = Math.floor(Math.random() * availableArr.length)
        this.x = availableArr[randomIndex][0]
        this.y = availableArr[randomIndex][1]
        map.drawScene();
        //console.log(this.x, this.y)
    }
}
//蛇类
function Snake() {
    this.width = 40;
    this.height = 40;
    this.position = 'absolute';
    this.direct = null;//移动方向
    this.virtualBody = [];
    this.virtualSnakeHasEat = false
    //初始蛇身
    //这里的null是蛇身的dom元素，先用null表示，后面会创建实际的dom元素插入视图
    this.body = new Array(
        [4, 2, 'url(./images/head-right.png)', null],//蛇头
        [3, 2, 'url(./images/body1.png)', null],
        [2, 2, 'url(./images/tail2-right.png)', null],
        [1, 2, 'url(./images/tail-right.png)', null]
    );
    //生成蛇身
    this.show = function () {
        if (this.body.length >= 3) {
            this.body[this.body.length - 2][2] = 'url(./images/tail2-right.png)';
            this.body[this.body.length - 3][2] = 'url(./images/body1.png)';
        }
        map.drawScene();
    }
    //控制蛇移动
    this.move = function () {
        /* ！！！！！！！！！！！在每次移动之前一定要设置this.virtualSnakeHasEat为false
          因为不仅仅下面找食物会改变this.virtualSnakeHasEat的值，而且后面movetoTail也会
          改变this.virtualSnakeHasEat的值，下个回合再走到这里时，一定要把this.virtualSnakeHasEat
          还原，这样才不会影响下面寻找食物的BFS的判断
         */
        this.virtualSnakeHasEat = false
        if (this.body.length > 115) {
            if (this.body.length > 165) {
                this.dfsLongestToTail()
            } else if ((Math.abs(this.body[0][0] - food.x) == 1 && this.body[0][1] == food.y) || (Math.abs(this.body[0][1] - food.y) == 1 && this.body[0][0] == food.x)) {
                //当蛇头挨着食物的时候，走最短距离
                this.shortestMovetoFood()//this.farthestMovetoFood()
            } else {
                this.moveToTail()
            }
        } else {//蛇身小于130的时候走最短距离吃食物
            if (Math.random() < 0.11) {//概率小于0.1，走最大距离，大于0.1走最小距离吃
                this.farthestMovetoFood()
            } else {
                this.shortestMovetoFood();
            }
        }
        //!!!console.log('最终方向', this.direct)
        //给蛇新的位置
        switch (this.direct) {
            case 'R':
                if (!(this.body[0][0] == food.x - 1 && this.body[0][1] == food.y)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][0] = this.body[0][0] + 1;
                    this.body[0][2] = 'url(./images/head-right.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
            case 'L':
                if (!(this.body[0][0] == food.x + 1 && this.body[0][1] == food.y)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][0] = this.body[0][0] - 1;
                    this.body[0][2] = 'url(./images/head-left.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
            case 'U':
                if (!(this.body[0][0] == food.x && this.body[0][1] == food.y + 1)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][1] = this.body[0][1] - 1;
                    this.body[0][2] = 'url(./images/head-up.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
            case 'D':
                if (!(this.body[0][0] == food.x && this.body[0][1] == food.y - 1)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][1] = this.body[0][1] + 1;
                    this.body[0][2] = 'url(./images/head-down.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
        }
        this.condition();
    }
    this.shortestMovetoFood = function (isBFS) {
        this.virtualSnakeHasEat = false
        //外挂逻辑
        var mapArr1 = map.initMapArr.map(item => [...item])//复制数组
        //蛇尾那一格是可以走的，不能标为1
        for (var i = 0; i < this.body.length - 1; i++) {
            mapArr1[this.body[i][1]][this.body[i][0]] = 1
        }
        //先判断按最短路径能不能吃到食物。
        BFS(mapArr1, [this.body[0][1], this.body[0][0]], [food.y, food.x]);//map数组，起点，终点
        if (minStep < 10000) {//按照最短路径能吃到食物
            //console.log('最短路径能吃到食物', minPath)
            //判断虚拟蛇按最短路径吃到食物后，蛇头和蛇尾能不能连通
            var cacheMinPath = [...minPath]
            this.virtualEatFood(minPath[0][0])
            if (minStep < 10000) {//虚拟蛇吃完食物后蛇头和蛇尾能连通，就按照原来的minPath的第一步走，因为虚拟蛇污染了minPath，所以需要引入cacheMinPath
                //console.log('虚拟蛇走cacheMinPath[0]吃完食物后蛇头和蛇尾能连通')
                if (this.movetoFoodWillLonely(cacheMinPath)) {
                    if (isBFS) {
                        this.dfsLongestToTail()
                    } else {
                        this.moveToTail();
                    }
                } else {
                    //!!!console.log('虚拟蛇走最短路径' + cacheMinPath[0] + '吃完食物后蛇头和蛇尾能连通')
                    this.direct = cacheMinPath[0][0]
                }
            } else {/* 虚拟蛇走完后蛇头和蛇尾不能连通，分2种情况：1.假如cacheMinPath[1]存在，先向着cacheMinPath[1]走，
                    还是先让虚拟蛇去探路，假如cacheMinPath[1]走完后蛇头和蛇尾还是不能连通，就按照BFS去找蛇尾，假如cacheMinPath[1]
                    走完后蛇头和蛇尾能连通，就按照原来的cacheMinPath[1]走 */
                //console.log('虚拟蛇走cacheMinPath[0]吃完食物后蛇头和蛇尾不能连通')
                if (cacheMinPath[1]) {//假如cacheMinPath[1]存在，先向着cacheMinPath[1]走
                    //console.log('cacheMinPath[1]存在')
                    this.virtualEatFood(cacheMinPath[1][0], true);
                    if (minStep < 10000) {//虚拟蛇先向着cacheMinPath[1]走吃完食物后蛇头和蛇尾能连通，就按照原来的cacheMinPath[1]走
                        //!!!console.log('虚拟蛇走最短路径' + cacheMinPath[1] + '吃完食物后蛇头和蛇尾能连通')
                        this.direct = cacheMinPath[1][0]
                    } else {//虚拟蛇先向着cacheMinPath[1]走吃完食物后蛇头和蛇尾不能连通，就按照BFS去找蛇尾
                        //console.log('虚拟蛇走cacheMinPath[1]吃完食物后蛇头和蛇尾不能连通')
                        if (isBFS) {
                            this.dfsLongestToTail()
                        } else {
                            this.moveToTail();
                        }
                    }
                } else {//cacheMinPath[1]不存在，直接按照最远路径去找蛇尾吧
                    //console.log('cacheMinPath[1]不存在')
                    if (isBFS) {
                        this.dfsLongestToTail()
                    } else {
                        this.moveToTail();
                    }
                }
            }
        } else {//最短路径不能吃到食物，就按照最远路径去找蛇尾
            //console.log('最短路径不能吃到食物')
            if (isBFS) {
                this.dfsLongestToTail()
            } else {
                this.moveToTail();
            }
            if (!minPath) console.log('最短路径不能吃到食物、蛇头也连不通')
        }
    }
    this.farthestMovetoFood = function () {
        //1.首先从蛇头周围4个格子方向选出不是蛇身和越界的，让虚拟蛇走一步到那个格子
        //2.以虚拟蛇能走的所有格子为起点，找出到食物最小距离最大的格子方向，且必须按最小距离吃完食物后蛇头蛇尾能连通才有效
        //console.log('最远吃食物')
        bfsMax = ''
        bfsNextFarDiret = []
        for (var i = 0; i < 4; i++) {
            var nextX = this.body[0][1] + one[i][0];
            var nextY = this.body[0][0] + one[i][1];
            var mapArr = map.initMapArr.map(item => [...item])
            for (var m = 0; m < this.body.length - 1; m++) {
                mapArr[this.body[m][1]][this.body[m][0]] = 1
            }
            if (check(mapArr, { x: nextX, y: nextY })) {
                this.virtualBody = this.body.map(item => [...item])
                /* !!!!!!!!!!!!!!!!!!!!!!!!!
                这里蛇头周围4个方向中假如食物刚好在其中的1格，虚拟蛇吃到食物后需要把this.virtualSnakeHasEat设为false，
                可以就在BFS的那个判断里面设置，要不然循环到下一个方向时，virtualSnakeHasEat还为true，
                就会把下一个方向直接push进去了。
                 */
                this.virtualMove(nextpath[i])
                var mapArr = map.initMapArr.map(item => [...item])
                //蛇尾那一格是可以走的，不能标为1
                for (var j = 0; j < this.virtualBody.length - 1; j++) {//内外层循环不能都用变量i，要用i、j。被坑了次
                    mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1
                }
                BFS(mapArr, [nextX, nextY], [food.y, food.x], nextpath[i], true, true);
            }
        }//到这里，就拿到了距食物最远的方向，是一个数组，里面有可能存在2个值。然后分别判断虚拟蛇沿这2个方向吃完后蛇头蛇尾能不能连通
        this.virtualSnakeHasEat = false
        if (bfsNextFarDiret.length > 0) {//按照最远路径能吃到食物
            bfsNextFarDiret.sort((a, b) => b.length - a.length)
            //console.log('最远路径能吃到食物', bfsNextFarDiret)
            //判断虚拟蛇按最远路径吃到食物后，蛇头和蛇尾能不能连通
            var cacheBfsNextFarDiret = [...bfsNextFarDiret]
            this.virtualEatFood(bfsNextFarDiret[0][0], false)
            if (minStep < 10000 /* && !this.movetoFoodWillLonely(cacheBfsNextFarDiret, true) */) {//虚拟蛇吃完食物后蛇头和蛇尾能连通，就按照原来的minPath的第一步走，因为虚拟蛇污染了minPath，所以需要引入cacheBfsNextFarDiret
                //!!!console.log('虚拟蛇走最远路径' + cacheBfsNextFarDiret[0] + '吃完食物后蛇头和蛇尾能连通')
                this.direct = cacheBfsNextFarDiret[0][0]
            } else {/* 虚拟蛇走完后蛇头和蛇尾不能连通，分2种情况：1.假如cacheBfsNextFarDiret[1]存在，先向着cacheBfsNextFarDiret[1]走，
                    还是先让虚拟蛇去探路，假如cacheBfsNextFarDiret[1]走完后蛇头和蛇尾还是不能连通，就按照BFS去找蛇尾，假如cacheBfsNextFarDiret[1]
                    走完后蛇头和蛇尾能连通，就按照原来的cacheBfsNextFarDiret[1]走 */
                //console.log('虚拟蛇走cacheBfsNextFarDiret[0]吃完食物后蛇头和蛇尾不能连通')
                if (cacheBfsNextFarDiret[1]) {//假如cacheBfsNextFarDiret[1]存在，先向着cacheBfsNextFarDiret[1]走
                    //console.log('cacheBfsNextFarDiret[1]存在')
                    this.virtualEatFood(cacheBfsNextFarDiret[1][0], true);
                    if (minStep < 10000) {//虚拟蛇先向着cacheMinPath[1]走吃完食物后蛇头和蛇尾能连通，就按照原来的cacheMinPath[1]走
                        //!!!console.log('虚拟蛇走最远路径' + cacheBfsNextFarDiret[1] + '吃完食物后蛇头和蛇尾能连通')
                        this.direct = cacheBfsNextFarDiret[1][0]
                    } else {//虚拟蛇先向着cacheBfsNextFarDiret[1]走吃完食物后蛇头和蛇尾不能连通，就按照BFS去找蛇尾
                        //console.log('虚拟蛇走cacheMinPath[1]吃完食物后蛇头和蛇尾不能连通')
                        this.moveToTail()//this.shortestMovetoFood();
                    }
                } else {//cacheMinPath[1]不存在，直接按照BFS去找蛇尾吧
                    //console.log('cacheMinPath[1]不存在')
                    this.moveToTail()//this.shortestMovetoFood();
                }
            }
        } else {//最远路径不能吃到食物，就按照最短路径去吃食物
            //console.log('最远路径不能吃到食物')
            this.moveToTail()//this.shortestMovetoFood();
            if (!minPath) console.log('最短路径不能吃到食物、蛇头也连不通')
        }
    }
    this.virtualMove = function (virtualDirect) {
        switch (virtualDirect) {
            case 'R':
                if (!(this.virtualBody[0][0] == food.x - 1 && this.virtualBody[0][1] == food.y)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.virtualBody.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.virtualBody[i][0] = this.virtualBody[i - 1][0];
                        this.virtualBody[i][1] = this.virtualBody[i - 1][1];
                    }
                    this.virtualBody[0][0] = this.virtualBody[0][0] + 1;
                } else {
                    this.virtualBody.unshift([food.x, food.y, 'url(./images/head-right.png)', null]);
                    this.virtualSnakeHasEat = true
                }
                break;
            case 'L':
                if (!(this.virtualBody[0][0] == food.x + 1 && this.virtualBody[0][1] == food.y)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.virtualBody.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.virtualBody[i][0] = this.virtualBody[i - 1][0];
                        this.virtualBody[i][1] = this.virtualBody[i - 1][1];
                    }
                    this.virtualBody[0][0] = this.virtualBody[0][0] - 1;
                } else {
                    this.virtualBody.unshift([food.x, food.y, 'url(./images/head-right.png)', null]);
                    this.virtualSnakeHasEat = true
                }
                break;
            case 'U':
                if (!(this.virtualBody[0][0] == food.x && this.virtualBody[0][1] == food.y + 1)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.virtualBody.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.virtualBody[i][0] = this.virtualBody[i - 1][0];
                        this.virtualBody[i][1] = this.virtualBody[i - 1][1];
                    }
                    this.virtualBody[0][1] = this.virtualBody[0][1] - 1;
                } else {
                    this.virtualBody.unshift([food.x, food.y, 'url(./images/head-right.png)', null]);
                    this.virtualSnakeHasEat = true
                }
                break;
            case 'D':
                if (!(this.virtualBody[0][0] == food.x && this.virtualBody[0][1] == food.y - 1)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.virtualBody.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.virtualBody[i][0] = this.virtualBody[i - 1][0];
                        this.virtualBody[i][1] = this.virtualBody[i - 1][1];
                    }
                    this.virtualBody[0][1] = this.virtualBody[0][1] + 1;
                } else {
                    this.virtualBody.unshift([food.x, food.y, 'url(./images/head-right.png)', null]);
                    this.virtualSnakeHasEat = true
                }
                break;
        }
    }
    this.moveToTail = function () {
        bfsMax = ''
        bfsNextFarDiret = []
        //console.log('最远追蛇尾')
        for (var i = 0; i < 4; i++) {
            var nextX = this.body[0][1] + one[i][0];
            var nextY = this.body[0][0] + one[i][1];
            var mapArr = map.initMapArr.map(item => [...item])
            for (var m = 0; m < this.body.length - 1; m++) {
                mapArr[this.body[m][1]][this.body[m][0]] = 1
            }
            if (check(mapArr, { x: nextX, y: nextY })) {
                this.virtualBody = this.body.map(item => [...item])
                this.virtualMove(nextpath[i])
                var mapArr = map.initMapArr.map(item => [...item])
                //蛇尾那一格是可以走的，不能标为1
                for (var j = 0; j < this.virtualBody.length - 1; j++) {//内外层循环不能都用变量i，要用i、j。被坑了次
                    mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1
                }
                var virtualTailIndex = this.virtualBody.length - 1//注意这里不能用tailIndex，因为虚拟蛇吃完食物后是增加了1粒的
                BFS(mapArr, [nextX, nextY], [this.virtualBody[virtualTailIndex][1], this.virtualBody[virtualTailIndex][0]], nextpath[i], true);
            }
        }
        bfsNextFarDiret.sort((a, b) => b.length - a.length)
        //!!!console.log('最远追蛇尾', bfsNextFarDiret)
        this.virtualBody = this.body.map(item => [...item])
        if(bfsNextFarDiret[0])  this.virtualMove(bfsNextFarDiret[0][0])
        var mapArr = map.initMapArr.map(item => [...item])
        for (var j = 0; j < this.virtualBody.length; j++) {
            mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1
        }
        //判断各个方向会不会产生空格
        if (bfsNextFarDiret.length > 1) {
            var breakOuter = false
            for (var i = 0; i < 4; i++) {
                breakOuter = false;
                var currentPoint = [this.virtualBody[0][0] + one[i][0], this.virtualBody[0][1] + one[i][1]]
                if (check(mapArr, { x: currentPoint[1], y: currentPoint[0] })) {
                    for (var n = 0; n < 4; n++) {
                        var nextX = currentPoint[1] + one[n][0];
                        var nextY = currentPoint[0] + one[n][1];
                        if (checkLonely(mapArr, { x: nextX, y: nextY })) {
                            breakOuter = true
                            break;
                        }
                    }
                    if (breakOuter) continue;
                    //!!!console.log('追蛇尾', bfsNextFarDiret[0][0], '会产生空格')
                    this.direct = bfsNextFarDiret[1][0]
                    return
                }
            }
            if (Math.abs(this.body[0][0] - food.x) == 1 && Math.abs(this.body[0][1] - food.y) == 1) {
                if (this.movetoFoodWillLonely(bfsNextFarDiret, true)) {
                    this.direct = bfsNextFarDiret[1][0]
                } else {
                    this.direct = bfsNextFarDiret[0][0]
                }
            } else {
                this.direct = bfsNextFarDiret[0][0]
            }
            return
        } else {
            this.direct = bfsNextFarDiret[0][0]
        }
    }
    this.dfsLongestToTail = function () {
        next = [[1, 0], [0, 1], [0, -1], [-1, 0]];
        d = ["D", "R", "L", "U"];
        var mapArr = map.initMapArr.map(item => [...item])//复制数组
        //蛇尾那一格是可以走的，不能标为1
        for (var i = 0; i < this.body.length - 1; i++) {
            mapArr[this.body[i][1]][this.body[i][0]] = 1
        }
        //if (this.body.length > 130) {
        //！！！注意每次执行DFS前都要把total和max置为0！！！因为这两变量是全局变量，前一次执行DFS后会污染这两个变量
        total = 0
        max = '';
        /* 
        我设置的total最大只能为200000，也就是说在十万次执行后还没找到max，那max就是空，实际上哪怕终点就在起点旁边，
        DFS还是有可能在十万次内找不到max。DFS按照我设置的策略会优先向右边找，如果终点在起点左边，就有可能在十万次内找不到，
        这时候应该走BFS
         */
        var tailIndex = this.body.length - 1;
        DFS(mapArr, [this.body[0][1], this.body[0][0]], [this.body[tailIndex][1], this.body[tailIndex][0]], '');
        //!!!console.log('dfs最长路径追蛇尾-', max)
        if (max[1]) {
            this.virtualBody = this.body.map(item => [...item])
            this.virtualMove(max[1][0])
            if (this.virtualSnakeHasEat) {
                this.direct = max[1][0]
                this.virtualSnakeHasEat = false
            } else {
                this.direct = max[0][0]
            }
        } else {
            this.direct = max[0][0]
        }
    }
    this.virtualEatFood = function (nextDiret) {
        var is1ok = false
        function goDiret(index) {
            this.virtualBody = this.body.map(item => [...item])
            /* for (var i of minPath) {
                    this.virtualMove(i)
                } */
            this.virtualMove(nextDiret)
            while (!this.virtualSnakeHasEat) {
                var mapArr = map.initMapArr.map(item => [...item])
                for (var i = 0; i < this.virtualBody.length - 1; i++) {
                    mapArr[this.virtualBody[i][1]][this.virtualBody[i][0]] = 1
                }
                BFS(mapArr, [this.virtualBody[0][1], this.virtualBody[0][0]], [food.y, food.x])
                /* 
                    因为虚拟蛇每走一步都是重新搜索路线的，此virtualEatFood方法中只是虚拟蛇走第一步时用的cacheDiret[1][0],
                    也就是minPath[1][0]，但是下面一行走第二步时还是用的minPath[0][0]，然后等虚拟蛇走完吃到食物有可能会报告
                    这条路也不通。
                 */
                if (minPath[1]) {
                    this.virtualMove(minPath[index][0])
                } else {
                    this.virtualMove(minPath[0][0])
                }
            }
            this.virtualSnakeHasEat = false;
            var mapArr = map.initMapArr.map(item => [...item])
            //蛇尾那一格是可以走的，不能标为1
            for (var i = 0; i < this.virtualBody.length - 1; i++) {
                mapArr[this.virtualBody[i][1]][this.virtualBody[i][0]] = 1
            }
            var virtualTailIndex = this.virtualBody.length - 1//注意这里不能用tailIndex，因为虚拟蛇吃完食物后是增加了1粒的
            BFS(mapArr, [this.virtualBody[0][1], this.virtualBody[0][0]], [this.virtualBody[virtualTailIndex][1], this.virtualBody[virtualTailIndex][0]]);
            if (minStep < 10000) {
                is1ok = true;
            }
        }
        //虚拟蛇优先走第2条最短路，如果第二条最短路走完蛇头蛇尾能连通，就不需要走第1条最短路了
        goDiret.call(this, 1);
        if (!is1ok) {
            goDiret.call(this, 0);
        }

    }
    this.movetoFoodWillLonely = function (diretArr, two) {
        this.virtualBody = this.body.map(item => [...item])
        this.virtualMove(diretArr[0][0])
        if (two && ((Math.abs(this.virtualBody[0][0] - food.x) == 1 && this.virtualBody[0][1] == food.y) || (Math.abs(this.virtualBody[0][1] - food.y) == 1 && this.virtualBody[0][0] == food.x))) {
            this.virtualBody.unshift([food.x, food.y, 'url(./images/head-right.png)', null]);
        }
        var mapArr = map.initMapArr.map(item => [...item])
        for (var j = 0; j < this.virtualBody.length; j++) {
            mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1
        }
        var breakOuter = false
        for (var i = 0; i < 4; i++) {
            breakOuter = false;
            var currentPoint = [this.virtualBody[0][0] + one[i][0], this.virtualBody[0][1] + one[i][1]]
            if (check(mapArr, { x: currentPoint[1], y: currentPoint[0] })) {
                for (var n = 0; n < 4; n++) {
                    var nextX = currentPoint[1] + one[n][0];
                    var nextY = currentPoint[0] + one[n][1];
                    if (checkLonely(mapArr, { x: nextX, y: nextY })) {
                        breakOuter = true
                        break;
                    }
                }
                if (breakOuter) continue;
                //!!!console.log('吃食物会产生空格', diretArr[0][0])
                //!!!if (two) console.log('追蛇尾食物在对角线会产生空格')
                return true
            }
        }
        return false
    }
    //定时器，开始游戏时，调用
    this.speed = function () {
        timer = setInterval(function () {
            var stepDom = document.getElementById('step');
            stepDom.innerHTML = ++step;
            this.move();
        }.bind(this), initSpeed);//或者:          timer=setInterval(function(){this.move();}.bind(this),initSpeed);setInterval里面的this指window要bind                           
    }
    //条件处理
    this.condition = function () {
        //游戏结束的判断要放在吃食物的判断之前，目的是为了让show发生在push之前(这样可以解决吃掉食物时定时器时间间隔尾巴显示错误)，因为push是发生在吃食物的判断中的
        //判断是否撞到自身（这段代码应该放在判断是否撞墙前面，因为this.show()是在判断是否撞墙这个块里面的，假如撞到自身，return退出函数，不执行下面的块，也就不执行this.show()，所以不会出现游戏结束时还会移动一步的问题）
        for (var i = 1; i < this.body.length; i++) {
            if (this.body[0][0] == this.body[i][0] && this.body[0][1] == this.body[i][1]) {
                clearInterval(timer);
                uiState.gameOver = true;
                uiState.gameOverScore = grade;
                isBegin = false;
                playSound('./music/die.mp3');
                renderGame();
                //location.replace(location);刷新页面
            }
        }
        //解决撞到自身还继续移动的bug,因为下面的this.show()只写在了判断是否撞墙的else里面，没写在判断是否撞到自身的else里面。
        if (uiState.gameOver) { clearInterval(timer); return; }
        //判断是否撞墙
        if (this.body[0][0] < 0 || this.body[0][0] >= map.width / this.width || this.body[0][1] < 0 || this.body[0][1] >= map.height / this.height) {
            clearInterval(timer);
            uiState.gameOver = true;
            uiState.gameOverScore = grade;
            isBegin = false;
            playSound('./music/die.mp3');
            renderGame();
            return;
        } else {
            this.show();//this.show()要放在游戏结束的判断里，当没结束时，就show，当结束，就不执行，不show。因此不会越界。
        }
    }
    this.eatFoodHandle = function () {
        if (this.body.length < 128) {
            if (Math.random() > 0.3) {
                one = [[0, 1], [0, -1], [-1, 0], [1, 0]];
                nextpath = ["R", "L", "U", "D"];
            } else {
                one = [[-1, 0], [1, 0], [0, 1], [0, -1]];
                nextpath = ["U", "D", "R", "L"];
            }
        } else if (this.body.length >= 128 && this.body.length < 146) {
            one = [[-1, 0], [1, 0], [0, 1], [0, -1]];
            nextpath = ["U", "D", "R", "L"];
        } else {
            one = [[0, 1], [0, -1], [-1, 0], [1, 0]];
            nextpath = ["R", "L", "U", "D"];
        }
        //吃食物
        playSound('./music/eat.mp3');
        grade++;
        this.body.unshift([food.x, food.y, 'url(./images/head-right.png)', null]);
        if (this.body.length != 200) {
            food.show();
        } else {
            playSound('./music/pass.mp3');
            uiState.pass = true;
            clearInterval(timer);
            var arr = this.body.map(item=>[...item]).reverse()
            for (let i = 0; i < arr.length; i++) {
                setTimeout(function () {
                    map.setHighlight(arr[i]);
                }, (i + 1) * 15)
            }
            setTimeout(function () {
                map.setHighlight(null);
            }, (arr.length + 1) * 15)
        }

        //计分器效果：动画中连续加分只更新目标数字，不重启动画。
        if (!uiState.scoreAnimating) {
            uiState.firstScore = uiState.secondScore;
            uiState.scoreAnimating = true;
            uiState.scoreAnimationStart = Date.now();
        }
        uiState.secondScore = uiState.secondScore + 1;
        renderGame();
    }
}

// 启动或暂停游戏，复用原来回车键和“开启AI”按钮的业务流程。
function toggleRunState() {
    if (!uiState.started || uiState.startFading || uiState.gameOver) return;
    if (snake.body.length == 200) location.reload();
    if (isBegin == false) {
        if (snake.direct == null) {
            snake.direct = 'R';
            snake.speed();
        }
        if (timer == null) {
            timer = setInterval(function(){snake.move()}, initSpeed);
            document.title = '贪吃蛇';
        }
        isBegin = true;
    } else {
        clearInterval(timer);
        timer = null;
        isBegin = false;
        document.title = '贪吃蛇-暂停中···';
    }
    renderGame();
}

document.onkeydown = function (event) {
    //按下回车键，开始/暂停游戏
    if (uiState.started && !uiState.startFading && !uiState.gameOver) {
        if (event.keyCode == 13) {
            toggleRunState();
        }
    }
    //控制方向（通过判断第一个div和第二个div的left或top是不是相等来控制移动的方向）
    if (isBegin == true) {//非暂停的时候才执行下面的
        switch (event.keyCode) {
            case 38://上键
                snake.direct = snake.body[0][0] == snake.body[1][0] ? snake.direct : 'U';//避免反向移动，触发死亡bug
                if (snake.direct != 'D') {//加这个判断是为了防止按与运动方向相反的键时，由于下面snake.move()的作用，蛇还是会向此时运动的方向加速移动
                    snake.move();//长按加速
                    clearInterval(timer);//按方向键强行让蛇移动时，需要先清除定时器，再启动计时器，是为了避免定时器的移动和snake.move()的移动叠加。
                    //一定要把clearInterval(timer)放在snake.move()后面，假如放在前面，定时器就是‘清除 清除 启动 启动’(snake.move()里面是清除 启动)所以会产生定时器的叠加。
                    timer = setInterval(function(){snake.move()}, initSpeed);//清除了定时器之后再启动定时器。
                }
                break;
            case 40://下键
                snake.direct = snake.body[0][0] == snake.body[1][0] ? snake.direct : 'D';
                if (snake.direct != 'U') {
                    snake.move();
                    clearInterval(timer);
                    timer = setInterval(function(){snake.move()}, initSpeed);
                }
                break;
            case 39://右键
                snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'R';
                if (snake.direct != 'L') {
                    snake.move();
                    clearInterval(timer);
                    timer = setInterval(function(){snake.move()}, initSpeed);
                }
                break;
            case 37://左键
                snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'L';
                if (snake.direct != 'R') {
                    snake.move();
                    clearInterval(timer);
                    timer = setInterval(function(){snake.move()}, initSpeed);
                }
                break;
        }
    }
}
//自动加载游戏
window.onload = function () {
    uiState.bootTime = Date.now();
    initBubbles();
    map = new Map();
    map.show();
    snake = new Snake();
    snake.show();
    food = new Food();
    food.show(); //一定要把snake=new Snake()定义在food.show()的前面，前面要在food里面拿snake里面body的值，如果不定义在前面就拿不到。
    startRenderLoop();

    // 视口变化时同步 canvas 尺寸，保持绘制坐标和点击热区一致。
    window.onresize = function () {
        map.resize();
        renderGame();
    };

    map._map.onmousemove = function (event) {
        var rect = map._map.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        uiState.startHover = hitTest(uiState.hitAreas.startButton, x, y);
        map._map.style.cursor = uiState.startHover || hitTest(uiState.hitAreas.aiButton, x, y) || hitTest(uiState.hitAreas.tryAgain, x, y) ? 'pointer' : 'default';
    };

    map._map.onclick = function (event) {
        var rect = map._map.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        if (!uiState.started && !uiState.startFading && hitTest(uiState.hitAreas.startButton, x, y)) {
            uiState.startFading = true;
            uiState.startFadeTime = Date.now();
            return;
        }

        if (uiState.gameOver && hitTest(uiState.hitAreas.tryAgain, x, y)) {
            location.reload();
            return;
        }

        if (hitTest(uiState.hitAreas.aiButton, x, y)) {
            initSpeed = 30;
            toggleRunState();
        }
    };
}
