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
    //生成地图
    this.show = function () {
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
    this.width = 20;
    this.height = 20;
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
        //新生成的食物不能出现在蛇身(可以利用后面不能撞到蛇身的方法，更简单)
        arrx = [];
        arry = [];
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
        }
    }
}
//蛇类
function Snake() {
    this.width = 20;
    this.height = 20;
    this.position = 'absolute';
    this.direct = null;//移动方向
    //初始蛇身
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
        for (var i = 0; i < this.body.length; i++) {
            var segment = this.body[i];
            var segx = segment[0];
            var segy = segment[1];

            if (i == 0) {
                // Head; Determine the correct image
                var nseg = this.body[i + 1]; // Next segment
                if (segy < nseg[1]) {
                    // Up
                    this.body[i][3].style.background = 'url(images/head-up.png)';
                    this.body[i][3].style.backgroundSize = '88% 100%'
                    this.body[i][3].style.backgroundPosition = 'center'
                } else if (segx > nseg[0]) {
                    // Right
                    this.body[i][3].style.background = 'url(images/head-right.png)';
                    this.body[i][3].style.backgroundSize = '100% 88%'
                    this.body[i][3].style.backgroundPosition = 'center'
                } else if (segy > nseg[1]) {
                    // Down
                    this.body[i][3].style.background = 'url(images/head-down.png)';
                    this.body[i][3].style.backgroundSize = '88% 100%'
                    this.body[i][3].style.backgroundPosition = 'center'
                } else if (segx < nseg[0]) {
                    // Left
                    this.body[i][3].style.background = 'url(images/head-left.png)';
                    this.body[i][3].style.backgroundSize = '100% 88%'
                    this.body[i][3].style.backgroundPosition = 'center'
                }
            } else if (i == this.body.length - 1) {
                // last Tail; Determine the correct image
                var pseg = this.body[i - 1]; // Prev segment
                if (pseg[1] < segy) {
                    // Up
                    this.body[i][3].style.background = 'url(images/tail-up.png)';
                    this.body[i][3].style.backgroundSize = '88% 100%'
                    this.body[i][3].style.backgroundPosition = 'center'
                } else if (pseg[0] > segx) {
                    // Right
                    this.body[i][3].style.background = 'url(images/tail-right.png)';
                    this.body[i][3].style.backgroundSize = '100% 88%'
                    this.body[i][3].style.backgroundPosition = 'center'
                } else if (pseg[1] > segy) {
                    // Down
                    this.body[i][3].style.background = 'url(images/tail-down.png)';
                    this.body[i][3].style.backgroundSize = '88% 100%'
                    this.body[i][3].style.backgroundPosition = 'center'
                } else if (pseg[0] < segx) {
                    // Left
                    this.body[i][3].style.background = 'url(images/tail-left.png)';
                    this.body[i][3].style.backgroundSize = '100% 88%'
                    this.body[i][3].style.backgroundPosition = 'center'
                }
            } else {
                if (i == this.body.length - 2) {
                    // second Tail; Determine the correct image
                    var pseg = this.body[i - 1]; // Prev segment
                    if (pseg[1] < segy) {
                        // Up
                        this.body[i][3].style.background = 'url(images/tail2-up.png)';
                    } else if (pseg[0] > segx) {
                        // Right
                        this.body[i][3].style.background = 'url(images/tail2-right.png)';
                    } else if (pseg[1] > segy) {
                        // Down
                        this.body[i][3].style.background = 'url(images/tail2-down.png)';
                    } else if (pseg[0] < segx) {
                        // Left
                        this.body[i][3].style.background = 'url(images/tail2-left.png)';
                    }
                } else {
                    this.body[i][3].style.background = 'url(images/body1.png)';
                }
                // 设置6种不同的格子间隙效果
                var pseg = this.body[i - 1]; // Previous segment
                var nseg = this.body[i + 1]; // Next segment
                if (pseg[0] < segx && nseg[1] > segy || nseg[0] < segx && pseg[1] > segy) {
                    // Angle Left-Down
                    this.body[i][3].style.backgroundSize = '100%'
                    this.body[i][3].style.backgroundPosition = '-2.5px 2.5px'
                    this.body[i][3].style.borderRadius = '0 30px 0 5px'
                } else if (pseg[1] < segy && nseg[0] < segx || nseg[1] < segy && pseg[0] < segx) {
                    // Angle Up-Left
                    this.body[i][3].style.backgroundSize = '100%'
                    this.body[i][3].style.backgroundPosition = '-2.5px -2.5px'
                    this.body[i][3].style.borderRadius = '5px 0 30px 0'
                } else if (pseg[0] > segx && nseg[1] < segy || nseg[0] > segx && pseg[1] < segy) {
                    // Angle Right-Up
                    this.body[i][3].style.backgroundSize = '100%'
                    this.body[i][3].style.backgroundPosition = '2.5px -2.5px'
                    this.body[i][3].style.borderRadius = '0 5px 0 30px'
                } else if (pseg[1] > segy && nseg[0] > segx || nseg[1] > segy && pseg[0] > segx) {
                    // Angle Down-Right
                    this.body[i][3].style.backgroundSize = '100%'
                    this.body[i][3].style.backgroundPosition = '2.5px 2.5px'
                    this.body[i][3].style.borderRadius = '30px 0 5px 0'
                } else if (pseg[0] < segx && nseg[0] > segx || nseg[0] < segx && pseg[0] > segx) {
                    // Horizontal Left-Right
                    this.body[i][3].style.backgroundSize = '100% 88%'
                    this.body[i][3].style.backgroundPosition = 'center'
                    this.body[i][3].style.borderRadius = 0
                } else if (pseg[1] < segy && nseg[1] > segy || nseg[1] < segy && pseg[1] > segy) {
                    // Vertical Up-Down
                    this.body[i][3].style.backgroundSize = '88% 100%'
                    this.body[i][3].style.backgroundPosition = 'center'
                    this.body[i][3].style.borderRadius = 0
                }
            }
        }
    }
    //控制蛇移动
    this.move = function () {
        var length = this.body.length - 1;
        for (var i = length; i > 0; i--) {
            this.body[i][0] = this.body[i - 1][0];
            this.body[i][1] = this.body[i - 1][1];
        }

        switch (this.direct) {
            case 'right':
                this.body[0][0] = this.body[0][0] + 1;
                this.body[0][3].style.background = 'url(images/head-right.png)';
                break;
            case 'left':
                this.body[0][0] = this.body[0][0] - 1;
                this.body[0][3].style.background = 'url(images/head-left.png)';
                break;
            case 'up':
                this.body[0][1] = this.body[0][1] - 1;
                this.body[0][3].style.background = 'url(images/head-up.png)';
                break;
            case 'down':
                this.body[0][1] = this.body[0][1] + 1;
                this.body[0][3].style.background = 'url(images/head-down.png)';
                break;
        }
        this.condition();
        //this.show();  this.show()不能放在这里！放在这里的话，当游戏结束时，蛇身还会移动一步，会出现越界。
    }
    //定时器，开始游戏时，调用
    this.speed = function () {
        timer = setInterval('snake.move()', initSpeed);//或者:         timer=setInterval(function(){this.move();}.bind(this),initSpeed);setInterval里面的this指window要bind                           
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
        if (getComputedStyle(gameOver).display == 'block') { clearInterval(timer); return; }//解决撞到自身还继续移动的bug
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
        //吃食物
        if (this.body[0][0] == food.x && this.body[0][1] == food.y) {
            document.all.sound.src = 'music/eat.mp3';
            grade++;
            this.body.push([-20, -20, 'url(images/tail-right.png)', null]);//-20是特意把刚吃掉的食物的初始位置挪出游戏区域隐藏，定时器再次执行snake.move()时又会设置它的位置。此举就是为了消除吃掉食物时定时器时间间隙产生的食物
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
            if (grade % 5 == 0) {
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
            }
        }

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
}