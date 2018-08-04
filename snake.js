var allowPress = true;
var cacheDiret = '';//AI将要撞到蛇身时的需要按下的方向
//模拟的键盘事件会产生长按效果，哪怕只执行一次,所以用外挂的时候应该把长按加速功能注释掉
function fireKeyEvent(el, evtType, keyCode) {
    if (keyCode != 13) {
        //allowPress = false;
    }
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
    //这里的null是蛇身的dom元素，先有null表示，后面会创建实际的dom元素插入视图
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
        //外挂逻辑
        //如果cacheDiret存在，先执行一次cacheDiret对应的操作，然后清空cacheDiret
        switch (cacheDiret) {
            case 'left':
                fireKeyEvent(document.documentElement, 'keydown', 37);//左
                cacheDiret = '';
                break;
            case 'right':
                fireKeyEvent(document.documentElement, 'keydown', 39);//右
                cacheDiret = '';
                break;
            case 'up':
                fireKeyEvent(document.documentElement, 'keydown', 38);//上
                cacheDiret = '';
                break;
            case 'down':
                fireKeyEvent(document.documentElement, 'keydown', 40);//下
                cacheDiret = '';
                break;
        }
        //蛇在每次移动之前，做一次判断：如果蛇头的x和食物的x相等，就要按上或者下
        if (this.body[0][0] == food.x) {
            if (this.body[0][1] > food.y) {
                if (allowPress) {
                    fireKeyEvent(document.documentElement, 'keydown', 38);//上
                }
            }
            if (this.body[0][1] < food.y) {
                if (allowPress) {
                    fireKeyEvent(document.documentElement, 'keydown', 40);//下
                }
            }
        }
        //蛇在每次移动之前，做一次判断：如果蛇头的y和食物的y相等，就要按左或者右
        if (this.body[0][1] == food.y) {
            if (this.body[0][0] > food.x) {
                if (allowPress) {
                    fireKeyEvent(document.documentElement, 'keydown', 37);//左
                }
            }
            if (this.body[0][0] < food.x) {
                if (allowPress) {
                    fireKeyEvent(document.documentElement, 'keydown', 39);//右
                }
            }
        }
        //蛇在每次重绘前，都需要先判断！！！......看看怎样判断蛇接下来的一步移动不能撞到自身？？？
        //蛇水平向右移动下一帧即将撞到蛇身
        this.rightWillFail()
        //蛇水平向左移动下一帧即将撞到蛇身
        this.leftWillFail()
        //蛇竖直向上移动下一帧即将撞到蛇身
        this.upWillFail()
        //蛇竖直向下移动下一帧即将撞到蛇身
        this.downWillFail()

        //蛇在每次重绘前,判断即将会不会撞墙，及时改变方向
        //蛇水平向右移动下一帧即将撞墙
        this.rightWillWall()
        //蛇水平向左移动下一帧即将撞墙
        this.leftWillWall()
        //蛇竖直向上移动下一帧即将撞墙
        this.upWillWall()
        //蛇竖直向下移动下一帧即将撞墙
        this.downWillWall()

        //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
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
        timer = setInterval(function () {
            /* 
                游戏开始初始化，定时器启动时，判断第一个食物是在蛇头的右边还是左边，因为初始时蛇默认向右走，
                如果第一个食物在蛇头的右边，这里就不用处理，如果第一个食物在蛇头左边，就需要按上或者下了。
             */
            //如果蛇头的x比食物的x大，就按上或者下
            if (this.body[0][0] > food.x) {
                if (this.body[0][1] > food.y) {
                    if (allowPress) {
                        fireKeyEvent(document.documentElement, 'keydown', 38);//上
                    }
                }
                if (this.body[0][1] < food.y) {
                    if (allowPress) {
                        fireKeyEvent(document.documentElement, 'keydown', 40);//下
                    }
                }
            }

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
        //吃食物
        if (this.body[0][0] == food.x && this.body[0][1] == food.y) {
            document.all.sound.src = 'music/eat.mp3';
            grade++;
            //蛇身的show是在push前面的，所以这里push了新蛇身后要到走下一步的时候才会show出来
            this.body.push([this.body[this.body.length - 1][0], this.body[this.body.length - 1][1], 'url(images/tail-right.png)', null]);
            //this.body.push([-20, -20, 'url(images/tail-right.png)', null]);//-20是特意把刚吃掉的食物的初始位置挪出游戏区域隐藏，定时器再次执行snake.move()时又会设置它的位置。此举就是为了消除吃掉食物时定时器时间间隙产生的食物
            map._map.removeChild(food._food);
            food.show();

            //外挂逻辑
            //竖直吃食物
            if (this.direct == 'up' || this.direct == 'down') {
                if (this.upWillFail(null, 'eatWillFailed') || this.downWillFail(null, 'eatWillFailed')) return;
                if (this.body[0][0] < food.x) {
                    fireKeyEvent(document.documentElement, 'keydown', 39);//右键
                } else if (this.body[0][0] > food.x) {
                    fireKeyEvent(document.documentElement, 'keydown', 37);//左键
                } else {
                    /* 
                    如果竖直吃完食物后，生成的新食物跟蛇头在同一竖直线上（蛇头的x和食物的x相等），
                    且食物出现在蛇头方向的反方向，就需要按左或者右了，
                    但是又有三种情况要考虑：
                        1.蛇头正好贴着地图的左边，这时候就不能按左，只能按右了；
                        2.蛇头正好贴着地图的右边，这时候就不能按右，只能按左了；
                        3.蛇头不贴边，这时候左右都可以按，就随机按一个吧。
                     */
                    //判断食物出现的位置是不是正好在蛇前进方向的反方向
                    if ((this.body[0][1] < food.y && this.direct == 'up') || (this.body[0][1] > food.y && this.direct == 'down')) {
                        if (this.body[0][0] == 0) {//蛇头正好贴着地图的左边，按右
                            fireKeyEvent(document.documentElement, 'keydown', 39);//右键
                        } else if (this.body[0][0] == map.width / this.width) {//蛇头正好贴着地图的右边,按左
                            fireKeyEvent(document.documentElement, 'keydown', 37);//左键
                        } else {//蛇头不贴边，随机按左或者右
                            if (Math.random >= 0.5) {
                                fireKeyEvent(document.documentElement, 'keydown', 37);//左键
                            } else {
                                fireKeyEvent(document.documentElement, 'keydown', 39);//右键
                            }
                        }
                        //还需要再按一次上或者下，来触发蛇头和新食物的y相等
                        //但是这一次按上下和上面按左右是同时无间隔进行的，有禁止反向移动的限制，所以这一次按上下不生效，需要延迟按
                        if (this.body[0][1] < food.y) {
                            setTimeout(function () {
                                fireKeyEvent(document.documentElement, 'keydown', 40);//右键
                            }, initSpeed)
                        } else if (this.body[0][1] > food.y) {
                            setTimeout(function () {
                                fireKeyEvent(document.documentElement, 'keydown', 38);//右键
                            }, initSpeed)
                        }
                    }
                }
            } else {//水平吃食物
                if (this.leftWillFail(null, 'eatWillFailed') || this.rightWillFail(null, 'eatWillFailed')) return;
                if (this.body[0][1] < food.y) {
                    fireKeyEvent(document.documentElement, 'keydown', 40);//下键
                } else if (this.body[0][1] > food.y) {
                    fireKeyEvent(document.documentElement, 'keydown', 38);//上键
                } else {
                    /* 
                    如果水平吃完食物后，生成的新食物跟蛇头在同一水平线上（蛇头的y和食物的y相等），
                    且食物出现在蛇头方向的反方向，就需要按上或者下了，
                    但是又有三种情况要考虑：
                        1.蛇头正好贴着地图的上边，这时候就不能按上，只能按下了；
                        2.蛇头正好贴着地图的下边，这时候就不能按下，只能按上了；
                        3.蛇头不贴边，这时候上下都可以按，就随机按一个吧。
                     */
                    //判断食物出现的位置是不是正好在蛇前进方向的反方向
                    if ((this.body[0][0] < food.x && this.direct == 'left') || (this.body[0][0] > food.x && this.direct == 'right')) {
                        if (this.body[0][1] == 0) {//蛇头正好贴着地图的上边，按下
                            fireKeyEvent(document.documentElement, 'keydown', 40);//下键
                        } else if (this.body[0][1] == map.height / this.height - 1) {//蛇头正好贴着地图的下边,按上
                            fireKeyEvent(document.documentElement, 'keydown', 38);//上键
                        } else {//蛇头不贴边，随机按上或者下
                            if (Math.random >= 0.5) {
                                fireKeyEvent(document.documentElement, 'keydown', 38);//上键

                            } else {
                                fireKeyEvent(document.documentElement, 'keydown', 40);//下键
                            }
                        }
                        //还需要再按一次左或者右，来触发蛇头和新食物的x相等
                        //但是这一次按左右和上面按上下是同时无间隔进行的，有禁止反向移动的限制，所以这一次按左右不生效，需要延迟按
                        if (this.body[0][0] < food.x) {
                            setTimeout(function () {
                                fireKeyEvent(document.documentElement, 'keydown', 39);//右键
                            }, initSpeed)

                        } else if (this.body[0][0] > food.x) {
                            setTimeout(function () {
                                fireKeyEvent(document.documentElement, 'keydown', 37);//左键
                            }, initSpeed)
                        }
                    }

                }
            }

            allowPress = true;

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

    this.rightWillFail = function (failed, eatWillFail) {
        //蛇水平向右移动下一帧即将撞到蛇身
        if (this.direct == 'right') {
            for (var i = 1; i < this.body.length - 1; i++) {
                //平向右移动下一帧即将撞到蛇身
                if (this.body[0][0] == this.body[i][0] - 1 && this.body[0][1] == this.body[i][1]) {
                    if (failed) return true
                    console.log("蛇水平向右移动下一帧即将撞到蛇身")
                    this.xClose()
                    if (eatWillFail) return true
                }
            }
        }
    }
    this.leftWillFail = function (failed, eatWillFail) {
        //蛇水平向左移动下一帧即将撞到蛇身
        if (this.direct == 'left') {
            for (var i = 1; i < this.body.length - 1; i++) {
                //平向左移动下一帧即将撞到蛇身
                if (this.body[0][0] == this.body[i][0] + 1 && this.body[0][1] == this.body[i][1]) {
                    if (failed) return true;
                    console.log("蛇水平向左移动下一帧即将撞到蛇身")
                    //此时需要按上或者下（但有可能其中一个方向是死路）
                    this.xClose()
                    if (eatWillFail) return true
                }
            }
        }
    }
    this.upWillFail = function (failed, eatWillFail) {
        //蛇竖直向上移动下一帧即将撞到蛇身
        if (this.direct == 'up') {
            for (var i = 1; i < this.body.length - 1; i++) {
                //竖直向上移动下一帧即将撞到蛇身
                if (this.body[0][0] == this.body[i][0] && this.body[0][1] == this.body[i][1] + 1) {
                    if (failed) return true
                    console.log("蛇竖直向上移动下一帧即将撞到蛇身")
                    this.yClose()
                    if (eatWillFail) return true
                }
            }
        }
    }
    this.downWillFail = function (failed, eatWillFail) {
        //蛇竖直向下移动下一帧即将撞到蛇身
        if (this.direct == 'down') {
            for (var i = 1; i < this.body.length - 1; i++) {
                //竖直向下移动下一帧即将撞到蛇身
                if (this.body[0][0] == this.body[i][0] && this.body[0][1] == this.body[i][1] - 1) {
                    if (failed) return true
                    console.log("蛇竖直向下移动下一帧即将撞到蛇身")
                    this.yClose()
                    if (eatWillFail) return true
                }
            }
        }
    }

    this.rightWillWall = function () {
        //蛇水平向右移动下一帧即将撞墙
        if (this.direct == 'right' && this.body[0][0] == map.width / this.width - 1) {
            console.log('蛇水平向右移动下一帧即将撞墙')
            //此时需要按上或者下（但可能其中一个方向是死路）
            if (this.body[this.body.length - 1][1] > this.body[0][1]) {//蛇尾的y大于蛇头的y，按下
                console.log("蛇水平向右移动下一帧即将撞墙---按下")
                console.log(this.body[this.body.length - 1][1], this.body[0][1])
                //这类地方全都手动改变direct而不是用模拟事件，因为同时执行两次模拟事件时会有冲突。其实可以删掉模拟事件，都用手动
                this.direct = 'down';
                if (!this.downWillFail('fail')) {
                    this.direct = 'down';
                } else {
                    this.direct = 'up';
                }
            } else if (this.body[this.body.length - 1][1] < this.body[0][1]) {//蛇尾的y小于蛇头的y，按上
                console.log("蛇水平向右移动下一帧即将撞墙---按上")
                console.log(this.body[this.body.length - 1][1], this.body[0][1])
                this.direct = 'up';
                if (!this.upWillFail('fail')) {
                    this.direct = 'up';
                } else {
                    this.direct = 'down';
                }
            } else {
                /* 
                //向右即将撞墙时，假如蛇尾的y和蛇头的y相等，此时蛇头可能正好贴墙，按上或者下可能会撞墙，
                单独拿出来判断，如果蛇头的y过地图的一半了，就按上，否则按下。下面的场景同理。
                 */
                if (this.body[0][1] >= map.height / this.height / 2) {
                    this.direct = 'up';
                    if (!this.upWillFail('fail')) {
                        this.direct = 'up';
                    } else {
                        this.direct = 'down';
                    }
                } else {
                    this.direct = 'down';
                    if (!this.downWillFail('fail')) {
                        this.direct = 'down';
                    } else {
                        this.direct = 'up';
                    }
                }
            }
        }
    }
    this.leftWillWall = function () {
        //蛇水平向左移动下一帧即将撞墙
        if (this.direct == 'left' && this.body[0][0] == 0) {
            console.log('蛇水平向左移动下一帧即将撞墙')
            //此时需要按上或者下（但可能其中一个方向是死路）
            if (this.body[this.body.length - 1][1] > this.body[0][1]) {//蛇尾的y大于蛇头的y，按下
                console.log("蛇水平向左移动下一帧即将撞墙---按下")
                console.log(this.body[this.body.length - 1][1], this.body[0][1])
                //这类地方全都手动改变direct而不是用模拟事件，因为同时执行两次模拟事件时会有冲突。其实可以删掉模拟事件，都用手动
                this.direct = 'down';
                if (!this.downWillFail('fail')) {
                    this.direct = 'down';//左
                } else {
                    this.direct = 'up';
                }
            } else if (this.body[this.body.length - 1][1] < this.body[0][1]) {//蛇尾的y小于蛇头的y，按上
                console.log("蛇水平向左移动下一帧即将撞墙---按上")
                console.log(this.body[this.body.length - 1][1], this.body[0][1])
                this.direct = 'up';
                if (!this.upWillFail('fail')) {
                    this.direct = 'up';
                } else {
                    this.direct = 'down';
                }
            } else {
                if (this.body[0][1] >= map.height / this.height / 2) {
                    this.direct = 'up';
                    if (!this.upWillFail('fail')) {
                        this.direct = 'up';
                    } else {
                        this.direct = 'down';
                    }
                } else {
                    this.direct = 'down';
                    if (!this.downWillFail('fail')) {
                        this.direct = 'down';
                    } else {
                        this.direct = 'up';
                    }
                }
            }
        }
    }
    this.upWillWall = function () {
        //蛇竖直向上移动下一帧即将撞墙
        if (this.direct == 'up' && this.body[0][1] == 0) {
            console.log('蛇竖直向上移动下一帧即将撞墙')
            //此时需要按左或者右（但可能其中一个方向是死路）
            if (this.body[this.body.length - 1][0] > this.body[0][0]) {//蛇尾的x大于蛇头的x，按右
                console.log("蛇竖直向上移动下一帧即将撞墙---按右")
                console.log(this.body[this.body.length - 1][0], this.body[0][0])
                this.direct = 'right';
                if (!this.rightWillFail('fail')) {
                    this.direct = 'right';
                } else {
                    this.direct = 'left';
                }
            } else if (this.body[this.body.length - 1][0] < this.body[0][0]) {//蛇尾的x小于蛇头的x，按左
                console.log("蛇竖直向上移动下一帧即将撞墙---按左")
                console.log(this.body[this.body.length - 1][0], this.body[0][0])
                this.direct = 'left';
                if (!this.leftWillFail('fail')) {
                    this.direct = 'left';//左
                } else {
                    this.direct = 'right';
                }
            } else {
                if (this.body[0][0] >= map.width / this.width / 2) {
                    this.direct = 'left';
                    if (!this.leftWillFail('fail')) {
                        this.direct = 'left';//左
                    } else {
                        this.direct = 'right';
                    }
                } else {
                    this.direct = 'right';
                    if (!this.rightWillFail('fail')) {
                        this.direct = 'right';
                    } else {
                        this.direct = 'left';
                    }
                }
            }
        }
    }
    this.downWillWall = function () {
        //蛇竖直向下移动下一帧即将撞墙
        if (this.direct == 'down' && this.body[0][1] == map.height / this.height - 1) {
            console.log('蛇竖直向下移动下一帧即将撞墙')
            //此时需要按左或者右（但可能其中一个方向是死路）
            if (this.body[this.body.length - 1][0] > this.body[0][0]) {//蛇尾的x大于蛇头的x，按右
                console.log("蛇竖直向下移动下一帧即将撞墙---按右")
                this.direct = 'right';
                if (!this.rightWillFail('fail')) {
                    this.direct = 'right';//左
                } else {
                    this.direct = 'left';
                }
            } else if (this.body[this.body.length - 1][0] < this.body[0][0]) {//蛇尾的x小于蛇头的x，按左
                console.log("蛇竖直向下移动下一帧即将撞墙---按左")
                this.direct = 'left';
                if (!this.leftWillFail('fail')) {
                    this.direct = 'left';//左
                } else {
                    this.direct = 'right';
                }
            } else {
                if (this.body[0][0] >= map.width / this.width / 2) {
                    this.direct = 'left';
                    if (!this.leftWillFail('fail')) {
                        this.direct = 'left';//左
                    } else {
                        this.direct = 'right';
                    }
                } else {
                    this.direct = 'right';
                    if (!this.rightWillFail('fail')) {
                        this.direct = 'right';//左
                    } else {
                        this.direct = 'left';
                    }
                }
            }
        }
    }

    //水平方向运动时形成闭环
    this.xClose = function () {
        for (var i = 1; i < this.body.length - 1; i++) {
            if (this.body[0][0] == this.body[i][0]) {
                if (this.body[0][1] > this.body[i][1]) {
                    console.log('水平方向即将撞到蛇身-闭环在上方-按下')
                    this.direct = 'down'
                } else {
                    console.log('水平方向即将撞到蛇身-闭环在下方-按上')
                    this.direct = 'up'
                }
                break;
            }
        }
    }
    //竖直方向运动时形成闭环
    this.yClose = function () {
        for (var i = 1; i < this.body.length - 1; i++) {
            if (this.body[0][1] == this.body[i][1]) {
                if (this.body[0][0] > this.body[i][0]) {
                    console.log('竖直方向即将撞到蛇身-闭环在左方-按右')
                    this.direct = 'right'
                } else {
                    console.log('竖直方向即将撞到蛇身-闭环在右方-按左')
                    this.direct = 'left'
                }
                break;
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
                    //snake.move();//长按加速
                    clearInterval(timer);//按方向键强行让蛇移动时，需要先清除定时器，再启动计时器，是为了避免定时器的移动和snake.move()的移动叠加。
                    //一定要把clearInterval(timer)放在snake.move()后面，假如放在前面，定时器就是‘清除 清除 启动 启动’(snake.move()里面是清除 启动)所以会产生定时器的叠加。
                    timer = setInterval('snake.move()', initSpeed);//清除了定时器之后再启动定时器。
                }
                break;
            case 40://下键
                snake.direct = snake.body[0][0] == snake.body[1][0] ? snake.direct : 'down';
                if (snake.direct != 'up') {
                    //snake.move();
                    clearInterval(timer);
                    timer = setInterval('snake.move()', initSpeed);
                }
                break;
            case 39://右键
                snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'right';
                if (snake.direct != 'left') {
                    //snake.move();
                    clearInterval(timer);
                    timer = setInterval('snake.move()', initSpeed);
                }
                break;
            case 37://左键
                snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'left';
                if (snake.direct != 'right') {
                    //snake.move();
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
        initSpeed = 15
        fireKeyEvent(document.documentElement, 'keydown', 13);
    }
}