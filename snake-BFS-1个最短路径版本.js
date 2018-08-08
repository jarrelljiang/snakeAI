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
//BFS算法
var one = [[0, 1], [0, -1], [-1, 0], [1, 0]];//右左上下移动坐标的变化
//这个顺序决定有多条最短路线时走哪条，目测根本不会走judge函数
var nextpath = ["R", "L", "U", "D"];//右左上下移动的表示
//点类记录当前坐标，步数，路径,step表示从出发到当前点经过几步,path表示从出发到当前点经过路径
function Point(x, y, step, path) {
    this.x = x;
    this.y = y;
    this.step = step;
    this.path = path;
}
//按字典序较小选择路径
function judge(A, B) {
    for (var i = 0; i < A.length; i++) {
        if (A[i] < B[i]) {
            return false
        }
    }
    return true;
}
//判断点是否出界或被访问过
function check(map, cunrrentPoint) {
    var n = map.length - 1;
    var m = map[0].length - 1;
    if (cunrrentPoint.x < 0 || cunrrentPoint.x > n || cunrrentPoint.y < 0 || cunrrentPoint.y > m || map[cunrrentPoint.x][cunrrentPoint.y] == 1)
        return false;
    return true;
}
//搜索路径
var minPath = '';//最短路径
var minStep = 10000//最小步数
function BFS(map, startArr, endArr) {
    minPath = '';//最短路径
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
                minPath = cunrrentPoint.path;
            } else if (minStep == cunrrentPoint.step) {
                if (judge(minPath, cunrrentPoint.path)) {
                    minPath = cunrrentPoint.path;
                }
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
                map[x][y] = 1;
            }
        }
    }
    //console.log(minPath, minStep == 10000 ? '没有通路' : minStep);//循环结束输出最短步数及路径
    return;
}

var map;  //地图
var snake; //蛇
var food;  //食物
var timer; //定时器
var initSpeed = 200; //初始定时器时间间隔（毫秒）,间接代表蛇移动速度
var grade = 0;  //积分
var flag = 1;   //（可间接看做）关卡
var isBegin = false;
//地图类
function Map() {
    this.width = 800;
    this.height = 400;
    this.position = 'relative';
    this._map = null;
    this.map1 = null;
    this.initMapArr = []
    //生成地图
    this.show = function () {
        for (var i = 0; i < this.height / 40; i++) {//注意这里把食物的宽高写死了
            this.initMapArr.push([])
            for (var j = 0; j < this.width / 40; j++) {
                this.initMapArr[i].push(0)
            }
        }

        this._map = document.createElement('div');
        this.map1 = document.createElement('div');
        this.map1.style.width = 946 + 'px';
        this.map1.style.height = 501 + 'px';
        this.map1.style.backgroundImage = 'url(images/map.jpg)';
        this._map.style.position = 'absolute';
        this._map.style.width = this.width + 'px';
        this._map.style.height = this.height + 'px';
        this._map.style.top = '50px';
        this._map.style.left = '73px';
        this.map1.style.position = this.position;
        this.map1.style.margin = '0 auto';
        document.body.appendChild(this.map1);
        this.map1.appendChild(this._map);
    }
    //显示最高分
    this.highScore = function () {
        if (localStorage.score) {
            highScore.innerHTML = '最高分：' + localStorage.score;
        } else {
            localStorage.score = 0;
            highScore.innerHTML = '最高分：' + localStorage.score;
        }
    }
}
//食物类
function Food() {
    this.width = 40;
    this.height = 40;
    this.position = 'absolute';
    this.background = 'url(images/body2.png)';
    this.x = 0;
    this.y = 0;
    this._food;
    //生成食物
    this.show = function () {
        this._food = document.createElement('div');
        this._food.style.width = this.width + 'px';
        this._food.style.height = this.height + 'px';
        this._food.style.position = this.position;
        this._food.style.background = this.background;
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
        for (var j = 0; j < mapArr.length; j++) {
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
        this._food.style.left = this.x * this.width;
        this._food.style.top = this.y * this.height;
        map._map.appendChild(this._food);
        /* arrx = [];//蛇身所有点的x坐标
        arry = [];//蛇身所有点的y坐标
        for (var i = 0; i < snake.body.length; i++) {
            arrx.push(snake.body[i][0]);
        }
        while (true) {
            for (var i = 0; i < arrx.length; i++) {
                if (arrx[i] == this.x) {
                    arry.push(snake.body[i][1]);
                }
            }
            if (arry.indexOf(this.y) != -1) {
                this.x = Math.floor(Math.random() * map.width / this.width);
                this.y = Math.floor(Math.random() * map.height / this.width);
            } else {
                this._food.style.left = this.x * this.width;
                this._food.style.top = this.y * this.height;
                map._map.appendChild(this._food);
                break;
            }
        } */
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
        [4, 2, 'url(images/head-right.png)', null],//蛇头
        [3, 2, 'url(images/body1.png)', null],
        [2, 2, 'url(images/tail2-right.png)', null],
        [1, 2, 'url(images/tail-right.png)', null]
    );
    //生成蛇身
    this.show = function () {
        for (var i = 0; i < this.body.length; i++) {
            if (this.body[i][3] == null) {
                this.body[i][3] = document.createElement('div');
                this.body[i][3].style.width = this.width;
                this.body[i][3].style.height = this.height;
                this.body[i][3].style.position = this.position;
                this.body[this.body.length - 2][2] = 'url(images/tail2-right.png)';
                this.body[this.body.length - 3][2] = 'url(images/body1.png)';
                this.body[i][3].style.background = this.body[i][2];
                map._map.appendChild(this.body[i][3]);
            }
            this.body[i][3].style.left = this.body[i][0] * this.width + 'px';
            this.body[i][3].style.top = this.body[i][1] * this.height + 'px';
        }
        switch (this.direct) {
            case 'up':
                this.body[0][3].style.background = 'url(images/head-up.png)';
                this.body[1][3].style.background = 'url(images/body1.png)';
                break;
            case 'down':
                this.body[0][3].style.background = 'url(images/head-down.png)';
                this.body[1][3].style.background = 'url(images/body1.png)';
                break;
            case 'left':
                this.body[0][3].style.background = 'url(images/head-left.png)';
                this.body[1][3].style.background = 'url(images/body1.png)';
                break;
            case 'right':
                this.body[0][3].style.background = 'url(images/head-right.png)';
                this.body[1][3].style.background = 'url(images/body1.png)';
                break;
        }
        //重定尾巴2（这个尾巴2是吃掉食物时，还没push之前的尾巴2，在push之后这个‘尾巴2’就变成length-3了）的background(当吃了食物之后，蛇身增加了1个，尾巴2就变成倒数第三个了，不再是尾巴了)
        this.body[this.body.length - 3][3].style.background = 'url(images/body1.png)';
        //控制尾巴1行进中的朝向
        if (this.body[this.body.length - 1][1] < this.body[this.body.length - 2][1]) {
            this.body[this.body.length - 1][3].style.background = 'url(images/tail-down.png)';
        }
        if (this.body[this.body.length - 1][1] == this.body[this.body.length - 2][1] && this.body[this.body.length - 1][0] < this.body[this.body.length - 2][0]) {
            this.body[this.body.length - 1][3].style.background = 'url(images/tail-right.png)';
        }
        if (this.body[this.body.length - 1][1] > this.body[this.body.length - 2][1]) {
            this.body[this.body.length - 1][3].style.background = 'url(images/tail-up.png)';
        }
        if (this.body[this.body.length - 1][1] == this.body[this.body.length - 2][1] && this.body[this.body.length - 1][0] > this.body[this.body.length - 2][0]) {
            this.body[this.body.length - 1][3].style.background = 'url(images/tail-left.png)';
        }
        //控制尾巴2行进中的朝向
        if (this.body[this.body.length - 2][1] < this.body[this.body.length - 3][1]) {
            this.body[this.body.length - 2][3].style.background = 'url(images/tail2-down.png)';
        }
        if (this.body[this.body.length - 2][1] == this.body[this.body.length - 3][1] && this.body[this.body.length - 1][0] < this.body[this.body.length - 2][0]) {
            this.body[this.body.length - 2][3].style.background = 'url(images/tail2-right.png)';
        }
        if (this.body[this.body.length - 2][1] > this.body[this.body.length - 3][1]) {
            this.body[this.body.length - 2][3].style.background = 'url(images/tail2-up.png)';
        }
        if (this.body[this.body.length - 2][1] == this.body[this.body.length - 3][1] && this.body[this.body.length - 1][0] > this.body[this.body.length - 2][0]) {
            this.body[this.body.length - 2][3].style.background = 'url(images/tail2-left.png)';
        }
    }
    //控制蛇移动
    this.move = function () {
        this.virtualSnakeHasEat = false
        //外挂逻辑
        var mapArr1 = map.initMapArr.map(item => [...item])//复制数组
        //蛇尾那一格是可以走的，不能标为1
        for (var i = 0; i < this.body.length - 1; i++) {
            mapArr1[this.body[i][1]][this.body[i][0]] = 1
        }
        var tailIndex = this.body.length - 1
        //最短路径能吃食物。
        BFS(mapArr1, [this.body[0][1], this.body[0][0]], [food.y, food.x]);//map数组，起点，终点
        if (minStep < 10000) {//按照最短路径能吃到食物
            console.log('最短路径能吃到食物', minPath)
            //判断虚拟蛇按最短路径吃到食物后，蛇头和蛇尾能不能连通
            var cacheMinPath = minPath
            this.virtualBody = this.body.map(item => [...item])
            /* for (var i of minPath) {
                this.virtualMove(i)
            } */
            this.virtualMove(minPath[0])
            while (!this.virtualSnakeHasEat) {
                var mapArr5 = map.initMapArr.map(item => [...item])
                for (var i = 0; i < this.virtualBody.length - 1; i++) {
                    mapArr5[this.virtualBody[i][1]][this.virtualBody[i][0]] = 1
                }
                BFS(mapArr5, [this.virtualBody[0][1], this.virtualBody[0][0]], [food.y, food.x])
                console.log('虚拟蛇' + cacheMinPath[0] + ':~' + minPath[0])
                this.virtualMove(minPath[0])
            }
            var mapArr3 = map.initMapArr.map(item => [...item])
            //蛇尾那一格是可以走的，不能标为1
            for (var i = 0; i < this.virtualBody.length - 1; i++) {
                mapArr3[this.virtualBody[i][1]][this.virtualBody[i][0]] = 1
            }
            var virtualTailIndex = this.virtualBody.length - 1//注意这里不能用tailIndex，因为虚拟蛇吃完食物后是增加了1粒的
            BFS(mapArr3, [this.virtualBody[0][1], this.virtualBody[0][0]], [this.virtualBody[virtualTailIndex][1], this.virtualBody[virtualTailIndex][0]]);
            if (minStep < 10000) {//虚拟蛇吃完食物后蛇头和蛇尾能连通，就按照原来的minPath的第一步走，因为虚拟蛇污染了minPath，所以需要引入cacheMinPath
                console.log('虚拟蛇吃完食物后蛇头和蛇尾能连通')
                switch (cacheMinPath[0]) {
                    case 'U':
                        this.direct = 'up'
                        break;
                    case 'D':
                        this.direct = 'down'
                        break;
                    case 'L':
                        this.direct = 'left'
                        break;
                    case 'R':
                        this.direct = 'right'
                        break;
                }
            } else {//虚拟蛇走完后蛇头和蛇尾不能连通，就按照BFS去找蛇尾
                console.log('虚拟蛇吃完食物后蛇头和蛇尾不能连通')
                var mapArr4 = map.initMapArr.map(item => [...item])//复制数组
                //蛇尾那一格是可以走的，不能标为1
                for (var i = 0; i < this.body.length - 1; i++) {
                    mapArr4[this.body[i][1]][this.body[i][0]] = 1
                }
                BFS(mapArr4, [this.body[0][1], this.body[0][0]], [this.body[tailIndex][1], this.body[tailIndex][0]]);
                switch (minPath[0]) {
                    case 'U':
                        this.direct = 'up'
                        break;
                    case 'D':
                        this.direct = 'down'
                        break;
                    case 'L':
                        this.direct = 'left'
                        break;
                    case 'R':
                        this.direct = 'right'
                        break;
                }
            }
        } else {//最短路径不能吃到食物，就按照BFS去找蛇尾(或者走距离蛇尾最远的那个方向),如果蛇尾也找不到，就走距离蛇尾最远的那个方向(待定实现)
            console.log('最短路径不能吃到食物')
            var mapArr2 = map.initMapArr.map(item => [...item])//复制数组
            //蛇尾那一格是可以走的，不能标为1
            for (var i = 0; i < this.body.length - 1; i++) {
                mapArr2[this.body[i][1]][this.body[i][0]] = 1
            }
            BFS(mapArr2, [this.body[0][1], this.body[0][0]], [this.body[tailIndex][1], this.body[tailIndex][0]]);//map数组，起点，终点
            if (!minPath) console.log('最短路径不能吃到食物、蛇头也连不通')
            switch (minPath[0]) {
                case 'U':
                    this.direct = 'up'
                    break;
                case 'D':
                    this.direct = 'down'
                    break;
                case 'L':
                    this.direct = 'left'
                    break;
                case 'R':
                    this.direct = 'right'
                    break;
            }
        }

        //给蛇新的位置
        switch (this.direct) {
            case 'right':
                if (!(this.body[0][0] == food.x - 1 && this.body[0][1] == food.y)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][0] = this.body[0][0] + 1;
                    this.body[0][3].style.background = 'url(images/head-right.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
            case 'left':
                if (!(this.body[0][0] == food.x + 1 && this.body[0][1] == food.y)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][0] = this.body[0][0] - 1;
                    this.body[0][3].style.background = 'url(images/head-left.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
            case 'up':
                if (!(this.body[0][0] == food.x && this.body[0][1] == food.y + 1)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][1] = this.body[0][1] - 1;
                    this.body[0][3].style.background = 'url(images/head-up.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
            case 'down':
                if (!(this.body[0][0] == food.x && this.body[0][1] == food.y - 1)) {//即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
                    //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
                    var length = this.body.length - 1;
                    for (var i = length; i > 0; i--) {
                        this.body[i][0] = this.body[i - 1][0];
                        this.body[i][1] = this.body[i - 1][1];
                    }
                    this.body[0][1] = this.body[0][1] + 1;
                    this.body[0][3].style.background = 'url(images/head-down.png)';
                } else {
                    this.eatFoodHandle()
                }
                break;
        }
        this.condition();
        //this.show();  this.show()不能放在这里！放在这里的话，当游戏结束时，蛇身还会移动一步，会出现越界。
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
                    this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
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
                    this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
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
                    this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
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
                    this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
                    this.virtualSnakeHasEat = true
                }
                break;
        }
    }
    //定时器，开始游戏时，调用
    this.speed = function () {
        timer = setInterval(function () {
            this.move();
        }.bind(this), initSpeed);//或者:        	timer=setInterval(function(){this.move();}.bind(this),initSpeed);setInterval里面的this指window要bind                           
    }
    //条件处理
    this.condition = function () {
        //游戏结束的判断要放在吃食物的判断之前，目的是为了让show发生在push之前(这样可以解决吃掉食物时定时器时间间隔尾巴显示错误)，因为push是发生在吃食物的判断中的
        //判断是否撞到自身（这段代码应该放在判断是否撞墙前面，因为this.show()是在判断是否撞墙这个块里面的，假如撞到自身，return退出函数，不执行下面的块，也就不执行this.show()，所以不会出现游戏结束时还会移动一步的问题）
        for (var i = 1; i < this.body.length; i++) {
            if (this.body[0][0] == this.body[i][0] && this.body[0][1] == this.body[i][1]) {
                clearInterval(timer);
                gameOver.style.display = 'block';
                isBegin = false;
                score.innerHTML = grade;
                document.all.sound.src = 'music/die.mp3';
                //location.replace(location);刷新页面
                if (grade > localStorage.score) {
                    localStorage.score = grade;
                    map.highScore();
                }
            }
        }
        //解决撞到自身还继续移动的bug,因为下面的this.show()只写在了判断是否撞墙的else里面，没写在判断是否撞到自身的else里面。
        if (getComputedStyle(gameOver).display == 'block') { clearInterval(timer); return; }
        //判断是否撞墙
        if (this.body[0][0] < 0 || this.body[0][0] >= map.width / this.width || this.body[0][1] < 0 || this.body[0][1] >= map.height / this.height) {
            clearInterval(timer);
            gameOver.style.display = 'block';
            isBegin = false;
            score.innerHTML = grade;
            document.all.sound.src = 'music/die.mp3';
            //location.replace(location);刷新页面
            if (grade > localStorage.score) {
                localStorage.score = grade;
                map.highScore();
            }
            return;
        } else {
            this.show();//this.show()要放在游戏结束的判断里，当没结束时，就show，当结束，就不执行，不show。因此不会越界。
        }
    }
    this.eatFoodHandle = function () {
        //吃食物
        document.all.sound.src = 'music/eat.mp3';
        grade++;
        //蛇身的show是在push前面的，所以这里push了新蛇身后要到走下一步的时候才会show出来
        this.body.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
        //this.body.push([-20, -20, 'url(images/tail-right.png)', null]);//-20是特意把刚吃掉的食物的初始位置挪出游戏区域隐藏，定时器再次执行snake.move()时又会设置它的位置。此举就是为了消除吃掉食物时定时器时间间隙产生的食物
        map._map.removeChild(food._food);
        food.show();

        //计分器效果（解决了当两次吃食物的间隔很小时(小于计分器变化的时间间隔)出现的问题）（轮播也可以用这个方法）
        if (getComputedStyle(scoreBox).top == '-28px') {
            scoreBox.style.transition = '0s';
            scoreBox.style.top = '0px';
            first.innerHTML = second.innerHTML;
        }
        setTimeout(function () {
            second.innerHTML = parseInt(second.innerHTML) + 1;
            scoreBox.style.transition = '1.2s';
            scoreBox.style.top = '-28px';
        })

        //速度提升处理，积分每曾2分，速度提升0.1
        /* if (grade % 5 == 0) {
            document.all.sound.src = 'music/pass.mp3';
            clearInterval(timer);
            initSpeed -= 20;
            flag++;
            timer = setInterval('snake.move()', initSpeed);
            //setTimeout(function(){alert('第'+flag+'关');},initSpeed);
            pass.innerHTML = flag;
            //模拟动画
            setTimeout(function () { pass.style.color = 'blue'; pass.style.transform = 'scale(1.2)'; }, 150);
            setTimeout(function () { pass.style.color = 'green'; pass.style.transform = 'scale(1.4)'; }, 300);
            setTimeout(function () { pass.style.color = 'yellow'; pass.style.transform = 'scale(1.6)'; }, 450);
            setTimeout(function () { pass.style.color = 'blue'; pass.style.transform = 'scale(1.4)'; }, 600);
            setTimeout(function () { pass.style.color = 'green'; pass.style.transform = 'scale(1.2)'; }, 750);
            setTimeout(function () { pass.style.color = '#DF130A'; pass.style.transform = 'scale(1)'; }, 900);
        } */

    }
}

document.onkeydown = function (event) {
    //按下回车键，开始/暂停游戏
    if (getComputedStyle(gameStart).display == 'none' && getComputedStyle(gameOver).display == 'none') {
        if (event.keyCode == 13) {
            if (isBegin == false) {
                if (snake.direct == null) {
                    snake.direct = 'right';
                    snake.speed();
                }
                if (timer == null) {
                    timer = setInterval('snake.move()', initSpeed);
                    document.title = '贪吃蛇';
                    paused.style.display = 'none';
                }
                isBegin = true;
            } else {
                clearInterval(timer);
                timer = null;
                isBegin = false;
                document.title = '贪吃蛇-暂停中···';
                paused.style.display = 'block';
            }
        }
    }
    //控制方向（通过判断第一个div和第二个div的left或top是不是相等来控制移动的方向）
    if (isBegin == true) {//非暂停的时候才执行下面的
        switch (event.keyCode) {
            case 38://上键
                snake.direct = snake.body[0][0] == snake.body[1][0] ? snake.direct : 'up';//避免反向移动，触发死亡bug
                if (snake.direct != 'down') {//加这个判断是为了防止按与运动方向相反的键时，由于下面snake.move()的作用，蛇还是会向此时运动的方向加速移动
                    snake.move();//长按加速
                    clearInterval(timer);//按方向键强行让蛇移动时，需要先清除定时器，再启动计时器，是为了避免定时器的移动和snake.move()的移动叠加。
                    //一定要把clearInterval(timer)放在snake.move()后面，假如放在前面，定时器就是‘清除 清除 启动 启动’(snake.move()里面是清除 启动)所以会产生定时器的叠加。
                    timer = setInterval('snake.move()', initSpeed);//清除了定时器之后再启动定时器。
                }
                break;
            case 40://下键
                snake.direct = snake.body[0][0] == snake.body[1][0] ? snake.direct : 'down';
                if (snake.direct != 'up') {
                    snake.move();
                    clearInterval(timer);
                    timer = setInterval('snake.move()', initSpeed);
                }
                break;
            case 39://右键
                snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'right';
                if (snake.direct != 'left') {
                    snake.move();
                    clearInterval(timer);
                    timer = setInterval('snake.move()', initSpeed);
                }
                break;
            case 37://左键
                snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'left';
                if (snake.direct != 'right') {
                    snake.move();
                    clearInterval(timer);
                    timer = setInterval('snake.move()', initSpeed);
                }
                break;
        }
    }
}
//自动加载游戏
window.onload = function () {
    map = new Map();
    map.show();
    map.highScore();
    snake = new Snake();
    snake.show();
    food = new Food();
    food.show(); //一定要把snake=new Snake()定义在food.show()的前面，前面要在food里面拿snake里面body的值，如果不定义在前面就拿不到。
    script.onclick = function () {
        initSpeed = 20
        fireKeyEvent(document.documentElement, 'keydown', 13);
        isBegin = true;
    }
}