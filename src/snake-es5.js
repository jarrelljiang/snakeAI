"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

//模拟的键盘事件会产生长按效果，哪怕只执行一次,所以用外挂的时候应该把长按加速功能注释掉
function fireKeyEvent(el, evtType, keyCode) {
  var doc = el.ownerDocument,
      win = doc.defaultView || doc.parentWindow,
      evtObj;

  if (doc.createEvent) {
    if (win.KeyEvent) {
      evtObj = doc.createEvent('KeyEvents');
      evtObj.initKeyEvent(evtType, true, true, win, false, false, false, false, keyCode, 0);
    } else {
      evtObj = doc.createEvent('UIEvents');
      Object.defineProperty(evtObj, 'keyCode', {
        get: function get() {
          return this.keyCodeVal;
        }
      });
      Object.defineProperty(evtObj, 'which', {
        get: function get() {
          return this.keyCodeVal;
        }
      });
      evtObj.initUIEvent(evtType, true, true, win, 1);
      evtObj.keyCodeVal = keyCode;

      if (evtObj.keyCode !== keyCode) {
        console.log("keyCode " + evtObj.keyCode + " 和 (" + evtObj.which + ") 不匹配");
      }
    }

    el.dispatchEvent(evtObj);
  } else if (doc.createEventObject) {
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
} //BFS算法


var one = [[0, 1], [0, -1], [-1, 0], [1, 0]]; //右左上下移动坐标的变化
//这个顺序决定有多条最短路线时走哪条

var nextpath = ["R", "L", "U", "D"]; //右左上下移动的表示
//点类记录当前坐标，步数，路径,step表示从出发到当前点经过几步,path表示从出发到当前点经过路径

function Point(x, y, step, path) {
  this.x = x;
  this.y = y;
  this.step = step;
  this.path = path;
} //判断点是否出界或被访问过


function check(map, cunrrentPoint) {
  var n = map.length - 1;
  var m = map[0].length - 1;
  if (cunrrentPoint.x < 0 || cunrrentPoint.x > n || cunrrentPoint.y < 0 || cunrrentPoint.y > m || map[cunrrentPoint.x][cunrrentPoint.y] == 1) return false;
  return true;
} //BFS搜索最短路径


var minPath = []; //最短路径

var minStep = 10000; //最小步数

var bfsMax = '';
var bfsNextFarDiret = []; //参数isMovetoTail名字没取好，这个参数只是用来标注走最远路线的

function BFS(map, startArr, endArr, farDiret, isMovetoTail, isMovetoFood) {
  minPath = []; //最短路径

  minStep = 10000; //最小步数

  var list = [];
  list.push(new Point(startArr[0], startArr[1], 0, '')); //向队列中加入第一个点

  while (list.length != 0) {
    //cunrrentPoint的坐标是终点的个数只可能是一个，因为遍历是有先后顺序的，先遍历到终点的点就已经把坐标给占了，标为1了，后面的不能访问
    //console.log(cunrrentPoint.x,cunrrentPoint,y)打印出来所有的坐标中只有一个等于终点坐标，所以judge函数其实没用，不会执行
    var cunrrentPoint = list[0]; //当队列中有点时，取出点比较是否为终点

    list.shift(); //删除该点

    if (cunrrentPoint.x == endArr[0] && cunrrentPoint.y == endArr[1]) {
      if (minStep > cunrrentPoint.step) {
        minStep = cunrrentPoint.step;
        minPath.push(cunrrentPoint.path);
      } else if (minStep == cunrrentPoint.step) {
        minPath.push(cunrrentPoint.path);
      }

      continue;
    } //如果不是终点，依次尝试访问右左上下，并加入队列继续循环


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
  } //console.log(minPath, minStep == 10000 ? '没有通路' : minStep);//循环结束输出最短步数及路径

  /* if (isMovetoTail && minPath[0] && minPath[0].length >= bfsMax.length) {
      //发现长度相等的路线时，直接push进去，发现长度更长的路线路线时，把整个数组清空，再把这条长路线push进去
      if (minPath[0].length > bfsMax.length && bfsNextFarDiret.length > 0) {
          bfsNextFarDiret = []
      }
      bfsMax = minPath[0]
      bfsNextFarDiret.push(farDiret)
  } */


  if (isMovetoTail && minPath[0]) {
    bfsNextFarDiret.push(farDiret + minPath[0]);
  } //如果蛇头周围4个方向格子中正好有1个是食物位置，就把这个方向算进去

  /* 
      注意还需要加一个限制参数isMovetoFood：参数isMovetoTail名字没取好，这个参数只是用来标注走最远路线的，而追尾巴时和大后期吃食物
      都是要走最远路线的，如果不再加个限制来区分，那么追尾巴时的处理函数里面的虚拟蛇也可能会触发走下面的if，
      从而导致蛇头不能走正确的方向追蛇尾，而去走它旁边的食物的方向。
   */


  if (isMovetoFood && snake.virtualSnakeHasEat) {
    //console.log('最远距离吃食物，且食物刚好在旁边')
    bfsNextFarDiret.push(farDiret);
    snake.virtualSnakeHasEat = false; //这行一定不能漏，要不然循环到下一个方向时会受影响
  }

  return;
} //DFS搜索最长路径


var total = 0;
var max = [];
var next = [[0, 1], [1, 0], [0, -1], [-1, 0]]; //右下左上

var d = ['R', 'D', 'L', 'U'];

function DFS(map, startArr, endArr, diret) {
  total++;
  var t = []; //下一步的坐标

  if (startArr[0] == endArr[0] && startArr[1] == endArr[1]) {
    //是否到达终点
    if (max.length == 0 || diret.length >= max[0].length) {
      if (max.length == 0 || diret.length > max[0].length) {
        max = [];
        max.push(diret);
      } else if (diret.length == max[0].length && diret[0] != max[0][0]) {
        if (max[1]) {
          diret[0] != max[1][0] && max.push(diret);
        } else {
          max.push(diret);
        }
      }
    }

    return;
  } //枚举4个方向的走法


  for (var k = 0; k < 4; k++) {
    if (total > 200000) break;
    t[0] = startArr[0] + next[k][0];
    t[1] = startArr[1] + next[k][1];

    if (t[0] < 0 || t[0] > map.length - 1 || t[0] < 0 || t[1] > map[0].length - 1) {
      //越界
      continue;
    }

    if (map[t[0]][t[1]] == 0) {
      map[t[0]][t[1]] = 1; //标记走过

      DFS(map, [t[0], t[1]], endArr, diret + d[k]);
      map[t[0]][t[1]] = 0; //一个方向尝试结束后取消标记
    }
  }

  return;
}

var map; //地图

var snake; //蛇

var food; //食物

var timer; //定时器

var initSpeed = 30; //初始定时器时间间隔（毫秒）,间接代表蛇移动速度

var grade = 0; //积分

var flag = 1; //（可间接看做）关卡

var isBegin = false; //地图类

function Map() {
  this.width = 800;
  this.height = 400;
  this.position = 'relative';
  this._map = null;
  this.map1 = null;
  this.initMapArr = []; //生成地图

  this.show = function () {
    for (var i = 0; i < this.height / 40; i++) {
      //注意这里把食物的宽高写死了
      this.initMapArr.push([]);

      for (var j = 0; j < this.width / 40; j++) {
        this.initMapArr[i].push(0);
      }
    }

    this._map = document.createElement('div');
    this._map.id = "bodyMap";
    this.map1 = document.createElement('div');
    this.map1.style.width = 946 + 'px';
    this.map1.style.height = 501 + 'px';
    this.map1.style.backgroundImage = 'url(images/map.png)';
    this._map.style.position = 'absolute';
    this._map.style.width = this.width + 'px';
    this._map.style.height = this.height + 'px';
    this._map.style.top = '50px';
    this._map.style.left = '73px';
    this.map1.style.position = this.position;
    this.map1.style.margin = '0 auto';
    document.body.appendChild(this.map1);
    this.map1.style.opacity = 0;
    this.map1.style.transition = '2s';
    this.map1.appendChild(this._map);
  };
} //食物类


function Food() {
  this.width = 40;
  this.height = 40;
  this.position = 'absolute';
  this.background = 'url(images/body2.png)';
  this.x = 0;
  this.y = 0;
  this._food; //生成食物

  this.show = function () {
    this._food = document.createElement('div');
    this._food.style.width = this.width + 'px';
    this._food.style.height = this.height + 'px';
    this._food.style.position = this.position;
    this._food.style.background = this.background;
    this._food.style.backgroundSize = '100%';
    this.x = Math.floor(Math.random() * map.width / this.width);
    this.y = Math.floor(Math.random() * map.height / this.width); //新生成的食物不能出现在蛇身(可以利用后面不能撞到蛇身的方法，更简单)(这种方法到后期蛇占据地图很多的时候不行，概率会很低，性能差)
    //新方法，在地图中排除掉蛇占据的坐标，然后在其中随机生成食物

    var mapArr = [];

    for (var i = 0; i < map.height / food.height; i++) {
      for (var j = 0; j < map.width / food.width; j++) {
        mapArr.push([j, i]);
      }
    }

    var allow = true;
    var availableArr = [];

    for (var j = 0; j < mapArr.length; j++) {
      //把地图的每一个格子一个个拿去给蛇身的每个格子比
      allow = true;

      for (var i = 0; i < snake.body.length; i++) {
        if (snake.body[i][0] == mapArr[j][0] && snake.body[i][1] == mapArr[j][1]) {
          allow = false;
          break;
        }
      }

      if (allow) availableArr.push(mapArr[j]);
    }

    var randomIndex = Math.floor(Math.random() * availableArr.length);
    this.x = availableArr[randomIndex][0];
    this.y = availableArr[randomIndex][1];
    this._food.style.left = this.x * this.width;
    this._food.style.top = this.y * this.height;

    map._map.appendChild(this._food); //console.log(this.x, this.y)

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

  };
} //蛇类


function Snake() {
  this.width = 40;
  this.height = 40;
  this.position = 'absolute';
  this.direct = null; //移动方向

  this.virtualBody = [];
  this.virtualSnakeHasEat = false; //初始蛇身
  //这里的null是蛇身的dom元素，先用null表示，后面会创建实际的dom元素插入视图

  this.body = new Array([4, 2, 'url(images/head-right.png)', null], //蛇头
  [3, 2, 'url(images/body1.png)', null], [2, 2, 'url(images/tail2-right.png)', null], [1, 2, 'url(images/tail-right.png)', null]); //生成蛇身

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
          this.body[i][3].style.backgroundSize = '88% 100%';
          this.body[i][3].style.backgroundPosition = 'center';
        } else if (segx > nseg[0]) {
          // Right
          this.body[i][3].style.background = 'url(images/head-right.png)';
          this.body[i][3].style.backgroundSize = '100% 88%';
          this.body[i][3].style.backgroundPosition = 'center';
        } else if (segy > nseg[1]) {
          // Down
          this.body[i][3].style.background = 'url(images/head-down.png)';
          this.body[i][3].style.backgroundSize = '88% 100%';
          this.body[i][3].style.backgroundPosition = 'center';
        } else if (segx < nseg[0]) {
          // Left
          this.body[i][3].style.background = 'url(images/head-left.png)';
          this.body[i][3].style.backgroundSize = '100% 88%';
          this.body[i][3].style.backgroundPosition = 'center';
        }
      } else if (i == this.body.length - 1) {
        // last Tail; Determine the correct image
        var pseg = this.body[i - 1]; // Prev segment

        if (pseg[1] < segy) {
          // Up
          this.body[i][3].style.background = 'url(images/tail-up.png)';
          this.body[i][3].style.backgroundSize = '88% 100%';
          this.body[i][3].style.backgroundPosition = 'center';
        } else if (pseg[0] > segx) {
          // Right
          this.body[i][3].style.background = 'url(images/tail-right.png)';
          this.body[i][3].style.backgroundSize = '100% 88%';
          this.body[i][3].style.backgroundPosition = 'center';
        } else if (pseg[1] > segy) {
          // Down
          this.body[i][3].style.background = 'url(images/tail-down.png)';
          this.body[i][3].style.backgroundSize = '88% 100%';
          this.body[i][3].style.backgroundPosition = 'center';
        } else if (pseg[0] < segx) {
          // Left
          this.body[i][3].style.background = 'url(images/tail-left.png)';
          this.body[i][3].style.backgroundSize = '100% 88%';
          this.body[i][3].style.backgroundPosition = 'center';
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
        } // 设置6种不同的格子间隙效果


        var pseg = this.body[i - 1]; // Previous segment

        var nseg = this.body[i + 1]; // Next segment

        if (pseg[0] < segx && nseg[1] > segy || nseg[0] < segx && pseg[1] > segy) {
          // Angle Left-Down
          this.body[i][3].style.backgroundSize = '100%';
          this.body[i][3].style.backgroundPosition = '-2.5px 2.5px';
          this.body[i][3].style.borderRadius = '0 30px 0 5px';
        } else if (pseg[1] < segy && nseg[0] < segx || nseg[1] < segy && pseg[0] < segx) {
          // Angle Up-Left
          this.body[i][3].style.backgroundSize = '100%';
          this.body[i][3].style.backgroundPosition = '-2.5px -2.5px';
          this.body[i][3].style.borderRadius = '5px 0 30px 0';
        } else if (pseg[0] > segx && nseg[1] < segy || nseg[0] > segx && pseg[1] < segy) {
          // Angle Right-Up
          this.body[i][3].style.backgroundSize = '100%';
          this.body[i][3].style.backgroundPosition = '2.5px -2.5px';
          this.body[i][3].style.borderRadius = '0 5px 0 30px';
        } else if (pseg[1] > segy && nseg[0] > segx || nseg[1] > segy && pseg[0] > segx) {
          // Angle Down-Right
          this.body[i][3].style.backgroundSize = '100%';
          this.body[i][3].style.backgroundPosition = '2.5px 2.5px';
          this.body[i][3].style.borderRadius = '30px 0 5px 0';
        } else if (pseg[0] < segx && nseg[0] > segx || nseg[0] < segx && pseg[0] > segx) {
          // Horizontal Left-Right
          this.body[i][3].style.backgroundSize = '100% 88%';
          this.body[i][3].style.backgroundPosition = 'center';
          this.body[i][3].style.borderRadius = 0;
        } else if (pseg[1] < segy && nseg[1] > segy || nseg[1] < segy && pseg[1] > segy) {
          // Vertical Up-Down
          this.body[i][3].style.backgroundSize = '88% 100%';
          this.body[i][3].style.backgroundPosition = 'center';
          this.body[i][3].style.borderRadius = 0;
        }
      }
    }
  }; //控制蛇移动


  this.move = function () {
    /* ！！！！！！！！！！！在每次移动之前一定要设置this.virtualSnakeHasEat为false
      因为不仅仅下面找食物会改变this.virtualSnakeHasEat的值，而且后面movetoTail也会
      改变this.virtualSnakeHasEat的值，下个回合再走到这里时，一定要把this.virtualSnakeHasEat
      还原，这样才不会影响下面寻找食物的BFS的判断
     */
    this.virtualSnakeHasEat = false;

    if (this.body.length > 119) {
      if (this.body.length > 169) {
        this.dfsLongestToTail();
      } else if (Math.abs(this.body[0][0] - food.x) == 1 && this.body[0][1] == food.y || Math.abs(this.body[0][1] - food.y) == 1 && this.body[0][0] == food.x) {
        this.shortestMovetoFood(); //this.farthestMovetoFood()
      } else {
        this.moveToTail();
      }
    } else {
      //蛇身小于130的时候走最短距离吃食物
      if (Math.random() < 0.11) {
        //概率小于0.1，走最大距离，大于0.1走最小距离吃
        this.farthestMovetoFood();
      } else {
        this.shortestMovetoFood();
      }
    } //!!!console.log('最终方向', this.direct)
    //给蛇新的位置


    switch (this.direct) {
      case 'R':
        if (!(this.body[0][0] == food.x - 1 && this.body[0][1] == food.y)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.body.length - 1;

          for (var i = length; i > 0; i--) {
            this.body[i][0] = this.body[i - 1][0];
            this.body[i][1] = this.body[i - 1][1];
          }

          this.body[0][0] = this.body[0][0] + 1;
          this.body[0][3].style.background = 'url(images/head-right.png)';
        } else {
          this.eatFoodHandle();
        }

        break;

      case 'L':
        if (!(this.body[0][0] == food.x + 1 && this.body[0][1] == food.y)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.body.length - 1;

          for (var i = length; i > 0; i--) {
            this.body[i][0] = this.body[i - 1][0];
            this.body[i][1] = this.body[i - 1][1];
          }

          this.body[0][0] = this.body[0][0] - 1;
          this.body[0][3].style.background = 'url(images/head-left.png)';
        } else {
          this.eatFoodHandle();
        }

        break;

      case 'U':
        if (!(this.body[0][0] == food.x && this.body[0][1] == food.y + 1)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.body.length - 1;

          for (var i = length; i > 0; i--) {
            this.body[i][0] = this.body[i - 1][0];
            this.body[i][1] = this.body[i - 1][1];
          }

          this.body[0][1] = this.body[0][1] - 1;
          this.body[0][3].style.background = 'url(images/head-up.png)';
        } else {
          this.eatFoodHandle();
        }

        break;

      case 'D':
        if (!(this.body[0][0] == food.x && this.body[0][1] == food.y - 1)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.body.length - 1;

          for (var i = length; i > 0; i--) {
            this.body[i][0] = this.body[i - 1][0];
            this.body[i][1] = this.body[i - 1][1];
          }

          this.body[0][1] = this.body[0][1] + 1;
          this.body[0][3].style.background = 'url(images/head-down.png)';
        } else {
          this.eatFoodHandle();
        }

        break;
    }

    this.condition();
  };

  this.shortestMovetoFood = function (isBFS) {
    this.virtualSnakeHasEat = false; //外挂逻辑

    var mapArr1 = map.initMapArr.map(function (item) {
      return _toConsumableArray(item);
    }); //复制数组
    //蛇尾那一格是可以走的，不能标为1

    for (var i = 0; i < this.body.length - 1; i++) {
      mapArr1[this.body[i][1]][this.body[i][0]] = 1;
    } //先判断按最短路径能不能吃到食物。


    BFS(mapArr1, [this.body[0][1], this.body[0][0]], [food.y, food.x]); //map数组，起点，终点

    if (minStep < 10000) {
      //按照最短路径能吃到食物
      //console.log('最短路径能吃到食物', minPath)
      //判断虚拟蛇按最短路径吃到食物后，蛇头和蛇尾能不能连通
      var cacheMinPath = _toConsumableArray(minPath);

      this.virtualEatFood(minPath[0][0]);

      if (minStep < 10000) {
        //虚拟蛇吃完食物后蛇头和蛇尾能连通，就按照原来的minPath的第一步走，因为虚拟蛇污染了minPath，所以需要引入cacheMinPath
        //console.log('虚拟蛇走cacheMinPath[0]吃完食物后蛇头和蛇尾能连通')
        if (this.movetoFoodWillLonely(cacheMinPath)) {
          if (isBFS) {
            this.dfsLongestToTail();
          } else {
            this.moveToTail();
          }
        } else {
          //!!!console.log('虚拟蛇走最短路径' + cacheMinPath[0] + '吃完食物后蛇头和蛇尾能连通')
          this.direct = cacheMinPath[0][0];
        }
      } else {
        /* 虚拟蛇走完后蛇头和蛇尾不能连通，分2种情况：1.假如cacheMinPath[1]存在，先向着cacheMinPath[1]走，
        还是先让虚拟蛇去探路，假如cacheMinPath[1]走完后蛇头和蛇尾还是不能连通，就按照BFS去找蛇尾，假如cacheMinPath[1]
        走完后蛇头和蛇尾能连通，就按照原来的cacheMinPath[1]走 */
        //console.log('虚拟蛇走cacheMinPath[0]吃完食物后蛇头和蛇尾不能连通')
        if (cacheMinPath[1]) {
          //假如cacheMinPath[1]存在，先向着cacheMinPath[1]走
          //console.log('cacheMinPath[1]存在')
          this.virtualEatFood(cacheMinPath[1][0], true);

          if (minStep < 10000) {
            //虚拟蛇先向着cacheMinPath[1]走吃完食物后蛇头和蛇尾能连通，就按照原来的cacheMinPath[1]走
            //!!!console.log('虚拟蛇走最短路径' + cacheMinPath[1] + '吃完食物后蛇头和蛇尾能连通')
            this.direct = cacheMinPath[1][0];
          } else {
            //虚拟蛇先向着cacheMinPath[1]走吃完食物后蛇头和蛇尾不能连通，就按照BFS去找蛇尾
            //console.log('虚拟蛇走cacheMinPath[1]吃完食物后蛇头和蛇尾不能连通')
            if (isBFS) {
              this.dfsLongestToTail();
            } else {
              this.moveToTail();
            }
          }
        } else {
          //cacheMinPath[1]不存在，直接按照最远路径去找蛇尾吧
          //console.log('cacheMinPath[1]不存在')
          if (isBFS) {
            this.dfsLongestToTail();
          } else {
            this.moveToTail();
          }
        }
      }
    } else {
      //最短路径不能吃到食物，就按照最远路径去找蛇尾
      //console.log('最短路径不能吃到食物')
      if (isBFS) {
        this.dfsLongestToTail();
      } else {
        this.moveToTail();
      }

      if (!minPath) console.log('最短路径不能吃到食物、蛇头也连不通');
    }
  };

  this.farthestMovetoFood = function () {
    //1.首先从蛇头周围4个格子方向选出不是蛇身和越界的，让虚拟蛇走一步到那个格子
    //2.以虚拟蛇能走的所有格子为起点，找出到食物最小距离最大的格子方向，且必须按最小距离吃完食物后蛇头蛇尾能连通才有效
    //console.log('最远吃食物')
    bfsMax = '';
    bfsNextFarDiret = [];

    for (var i = 0; i < 4; i++) {
      var nextX = this.body[0][1] + one[i][0];
      var nextY = this.body[0][0] + one[i][1];
      var mapArr = map.initMapArr.map(function (item) {
        return _toConsumableArray(item);
      });

      for (var m = 0; m < this.body.length - 1; m++) {
        mapArr[this.body[m][1]][this.body[m][0]] = 1;
      }

      if (check(mapArr, {
        x: nextX,
        y: nextY
      })) {
        this.virtualBody = this.body.map(function (item) {
          return _toConsumableArray(item);
        });
        /* !!!!!!!!!!!!!!!!!!!!!!!!!
        这里蛇头周围4个方向中假如食物刚好在其中的1格，虚拟蛇吃到食物后需要把this.virtualSnakeHasEat设为false，
        可以就在BFS的那个判断里面设置，要不然循环到下一个方向时，virtualSnakeHasEat还为true，
        就会把下一个方向直接push进去了。
         */

        this.virtualMove(nextpath[i]);
        var mapArr = map.initMapArr.map(function (item) {
          return _toConsumableArray(item);
        }); //蛇尾那一格是可以走的，不能标为1

        for (var j = 0; j < this.virtualBody.length - 1; j++) {
          //内外层循环不能都用变量i，要用i、j。被坑了次
          mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1;
        }

        BFS(mapArr, [nextX, nextY], [food.y, food.x], nextpath[i], true, true);
      }
    } //到这里，就拿到了距食物最远的方向，是一个数组，里面有可能存在2个值。然后分别判断虚拟蛇沿这2个方向吃完后蛇头蛇尾能不能连通


    this.virtualSnakeHasEat = false;

    if (bfsNextFarDiret.length > 0) {
      //按照最远路径能吃到食物
      bfsNextFarDiret.sort(function (a, b) {
        return b.length - a.length;
      }); //console.log('最远路径能吃到食物', bfsNextFarDiret)
      //判断虚拟蛇按最远路径吃到食物后，蛇头和蛇尾能不能连通

      var cacheBfsNextFarDiret = _toConsumableArray(bfsNextFarDiret);

      this.virtualEatFood(bfsNextFarDiret[0][0], false);

      if (minStep < 10000
      /* && !this.movetoFoodWillLonely(cacheBfsNextFarDiret, true) */
      ) {
          //虚拟蛇吃完食物后蛇头和蛇尾能连通，就按照原来的minPath的第一步走，因为虚拟蛇污染了minPath，所以需要引入cacheBfsNextFarDiret
          //!!!console.log('虚拟蛇走最远路径' + cacheBfsNextFarDiret[0] + '吃完食物后蛇头和蛇尾能连通')
          this.direct = cacheBfsNextFarDiret[0][0];
        } else {
        /* 虚拟蛇走完后蛇头和蛇尾不能连通，分2种情况：1.假如cacheBfsNextFarDiret[1]存在，先向着cacheBfsNextFarDiret[1]走，
        还是先让虚拟蛇去探路，假如cacheBfsNextFarDiret[1]走完后蛇头和蛇尾还是不能连通，就按照BFS去找蛇尾，假如cacheBfsNextFarDiret[1]
        走完后蛇头和蛇尾能连通，就按照原来的cacheBfsNextFarDiret[1]走 */
        //console.log('虚拟蛇走cacheBfsNextFarDiret[0]吃完食物后蛇头和蛇尾不能连通')
        if (cacheBfsNextFarDiret[1]) {
          //假如cacheBfsNextFarDiret[1]存在，先向着cacheBfsNextFarDiret[1]走
          //console.log('cacheBfsNextFarDiret[1]存在')
          this.virtualEatFood(cacheBfsNextFarDiret[1][0], true);

          if (minStep < 10000) {
            //虚拟蛇先向着cacheMinPath[1]走吃完食物后蛇头和蛇尾能连通，就按照原来的cacheMinPath[1]走
            //!!!console.log('虚拟蛇走最远路径' + cacheBfsNextFarDiret[1] + '吃完食物后蛇头和蛇尾能连通')
            this.direct = cacheBfsNextFarDiret[1][0];
          } else {
            //虚拟蛇先向着cacheBfsNextFarDiret[1]走吃完食物后蛇头和蛇尾不能连通，就按照BFS去找蛇尾
            //console.log('虚拟蛇走cacheMinPath[1]吃完食物后蛇头和蛇尾不能连通')
            this.moveToTail(); //this.shortestMovetoFood();
          }
        } else {
          //cacheMinPath[1]不存在，直接按照BFS去找蛇尾吧
          //console.log('cacheMinPath[1]不存在')
          this.moveToTail(); //this.shortestMovetoFood();
        }
      }
    } else {
      //最远路径不能吃到食物，就按照最短路径去吃食物
      //console.log('最远路径不能吃到食物')
      this.moveToTail(); //this.shortestMovetoFood();

      if (!minPath) console.log('最短路径不能吃到食物、蛇头也连不通');
    }
  };

  this.virtualMove = function (virtualDirect) {
    switch (virtualDirect) {
      case 'R':
        if (!(this.virtualBody[0][0] == food.x - 1 && this.virtualBody[0][1] == food.y)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.virtualBody.length - 1;

          for (var i = length; i > 0; i--) {
            this.virtualBody[i][0] = this.virtualBody[i - 1][0];
            this.virtualBody[i][1] = this.virtualBody[i - 1][1];
          }

          this.virtualBody[0][0] = this.virtualBody[0][0] + 1;
        } else {
          this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
          this.virtualSnakeHasEat = true;
        }

        break;

      case 'L':
        if (!(this.virtualBody[0][0] == food.x + 1 && this.virtualBody[0][1] == food.y)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.virtualBody.length - 1;

          for (var i = length; i > 0; i--) {
            this.virtualBody[i][0] = this.virtualBody[i - 1][0];
            this.virtualBody[i][1] = this.virtualBody[i - 1][1];
          }

          this.virtualBody[0][0] = this.virtualBody[0][0] - 1;
        } else {
          this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
          this.virtualSnakeHasEat = true;
        }

        break;

      case 'U':
        if (!(this.virtualBody[0][0] == food.x && this.virtualBody[0][1] == food.y + 1)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.virtualBody.length - 1;

          for (var i = length; i > 0; i--) {
            this.virtualBody[i][0] = this.virtualBody[i - 1][0];
            this.virtualBody[i][1] = this.virtualBody[i - 1][1];
          }

          this.virtualBody[0][1] = this.virtualBody[0][1] - 1;
        } else {
          this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
          this.virtualSnakeHasEat = true;
        }

        break;

      case 'D':
        if (!(this.virtualBody[0][0] == food.x && this.virtualBody[0][1] == food.y - 1)) {
          //即将要吃食物，就不改变蛇的坐标，同时把新食物的位置当做蛇头
          //蛇移动重绘(是根据蛇在这瞬间的方向来重绘的)
          var length = this.virtualBody.length - 1;

          for (var i = length; i > 0; i--) {
            this.virtualBody[i][0] = this.virtualBody[i - 1][0];
            this.virtualBody[i][1] = this.virtualBody[i - 1][1];
          }

          this.virtualBody[0][1] = this.virtualBody[0][1] + 1;
        } else {
          this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
          this.virtualSnakeHasEat = true;
        }

        break;
    }
  };

  this.moveToTail = function () {
    bfsMax = '';
    bfsNextFarDiret = []; //console.log('最远追蛇尾')

    for (var i = 0; i < 4; i++) {
      var nextX = this.body[0][1] + one[i][0];
      var nextY = this.body[0][0] + one[i][1];
      var mapArr = map.initMapArr.map(function (item) {
        return _toConsumableArray(item);
      });

      for (var m = 0; m < this.body.length - 1; m++) {
        mapArr[this.body[m][1]][this.body[m][0]] = 1;
      }

      if (check(mapArr, {
        x: nextX,
        y: nextY
      })) {
        this.virtualBody = this.body.map(function (item) {
          return _toConsumableArray(item);
        });
        this.virtualMove(nextpath[i]);
        var mapArr = map.initMapArr.map(function (item) {
          return _toConsumableArray(item);
        }); //蛇尾那一格是可以走的，不能标为1

        for (var j = 0; j < this.virtualBody.length - 1; j++) {
          //内外层循环不能都用变量i，要用i、j。被坑了次
          mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1;
        }

        var virtualTailIndex = this.virtualBody.length - 1; //注意这里不能用tailIndex，因为虚拟蛇吃完食物后是增加了1粒的

        BFS(mapArr, [nextX, nextY], [this.virtualBody[virtualTailIndex][1], this.virtualBody[virtualTailIndex][0]], nextpath[i], true);
      }
    }

    bfsNextFarDiret.sort(function (a, b) {
      return b.length - a.length;
    }); //!!!console.log('最远追蛇尾', bfsNextFarDiret)

    this.virtualBody = this.body.map(function (item) {
      return _toConsumableArray(item);
    });
    this.virtualMove(bfsNextFarDiret[0][0]);
    var mapArr = map.initMapArr.map(function (item) {
      return _toConsumableArray(item);
    });

    for (var j = 0; j < this.virtualBody.length; j++) {
      mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1;
    } //判断各个方向会不会产生空格


    if (bfsNextFarDiret.length > 1) {
      var breakOuter = false;

      for (var i = 0; i < 4; i++) {
        breakOuter = false;
        var currentPoint = [this.virtualBody[0][0] + one[i][0], this.virtualBody[0][1] + one[i][1]];

        if (check(mapArr, {
          x: currentPoint[1],
          y: currentPoint[0]
        })) {
          for (var n = 0; n < 4; n++) {
            var nextX = currentPoint[1] + one[n][0];
            var nextY = currentPoint[0] + one[n][1];

            if (checkLonely(mapArr, {
              x: nextX,
              y: nextY
            })) {
              breakOuter = true;
              break;
            }
          }

          if (breakOuter) continue; //!!!console.log('追蛇尾', bfsNextFarDiret[0][0], '会产生空格')

          this.direct = bfsNextFarDiret[1][0];
          return;
        }
      }

      if (Math.abs(this.body[0][0] - food.x) == 1 && Math.abs(this.body[0][1] - food.y) == 1) {
        if (this.movetoFoodWillLonely(bfsNextFarDiret, true)) {
          this.direct = bfsNextFarDiret[1][0];
        } else {
          this.direct = bfsNextFarDiret[0][0];
        }
      } else {
        this.direct = bfsNextFarDiret[0][0];
      }

      return;
    } else {
      this.direct = bfsNextFarDiret[0][0];
    }
  };

  this.dfsLongestToTail = function () {
    next = [[1, 0], [0, 1], [0, -1], [-1, 0]];
    d = ["D", "R", "L", "U"];
    var mapArr = map.initMapArr.map(function (item) {
      return _toConsumableArray(item);
    }); //复制数组
    //蛇尾那一格是可以走的，不能标为1

    for (var i = 0; i < this.body.length - 1; i++) {
      mapArr[this.body[i][1]][this.body[i][0]] = 1;
    } //if (this.body.length > 130) {
    //！！！注意每次执行DFS前都要把total和max置为0！！！因为这两变量是全局变量，前一次执行DFS后会污染这两个变量


    total = 0;
    max = '';
    /* 
    我设置的total最大只能为十万，也就是说在十万次执行后还没找到max，那max就是空，实际上哪怕终点就在起点旁边，
    DFS还是有可能在十万次内找不到max。DFS按照我设置的策略会优先向右边找，如果终点在起点左边，就有可能在十万次内找不到，
    这时候应该走BFS
     */

    var tailIndex = this.body.length - 1;
    DFS(mapArr, [this.body[0][1], this.body[0][0]], [this.body[tailIndex][1], this.body[tailIndex][0]], ''); //!!!console.log('dfs最长路径追蛇尾-', max)

    if (max[1]) {
      this.virtualBody = this.body.map(function (item) {
        return _toConsumableArray(item);
      });
      this.virtualMove(max[1][0]);

      if (this.virtualSnakeHasEat) {
        this.direct = max[1][0];
        this.virtualSnakeHasEat = false;
      } else {
        this.direct = max[0][0];
      }
    } else {
      this.direct = max[0][0];
    }
  };

  this.virtualEatFood = function (nextDiret) {
    var is1ok = false;

    function goDiret(index) {
      this.virtualBody = this.body.map(function (item) {
        return _toConsumableArray(item);
      });
      /* for (var i of minPath) {
              this.virtualMove(i)
          } */

      this.virtualMove(nextDiret);

      while (!this.virtualSnakeHasEat) {
        var mapArr = map.initMapArr.map(function (item) {
          return _toConsumableArray(item);
        });

        for (var i = 0; i < this.virtualBody.length - 1; i++) {
          mapArr[this.virtualBody[i][1]][this.virtualBody[i][0]] = 1;
        }

        BFS(mapArr, [this.virtualBody[0][1], this.virtualBody[0][0]], [food.y, food.x]);
        /* 
            因为虚拟蛇每走一步都是重新搜索路线的，此virtualEatFood方法中只是虚拟蛇走第一步时用的cacheDiret[1][0],
            也就是minPath[1][0]，但是下面一行走第二步时还是用的minPath[0][0]，然后等虚拟蛇走完吃到食物有可能会报告
            这条路也不通。
         */

        if (minPath[1]) {
          this.virtualMove(minPath[index][0]);
        } else {
          this.virtualMove(minPath[0][0]);
        }
      }

      this.virtualSnakeHasEat = false;
      var mapArr = map.initMapArr.map(function (item) {
        return _toConsumableArray(item);
      }); //蛇尾那一格是可以走的，不能标为1

      for (var i = 0; i < this.virtualBody.length - 1; i++) {
        mapArr[this.virtualBody[i][1]][this.virtualBody[i][0]] = 1;
      }

      var virtualTailIndex = this.virtualBody.length - 1; //注意这里不能用tailIndex，因为虚拟蛇吃完食物后是增加了1粒的

      BFS(mapArr, [this.virtualBody[0][1], this.virtualBody[0][0]], [this.virtualBody[virtualTailIndex][1], this.virtualBody[virtualTailIndex][0]]);

      if (minStep < 10000) {
        is1ok = true;
      }
    } //虚拟蛇优先走第2条最短路，如果第二条最短路走完蛇头蛇尾能连通，就不需要走第1条最短路了


    goDiret.call(this, 1);

    if (!is1ok) {
      goDiret.call(this, 0);
    }
  };

  this.movetoFoodWillLonely = function (diretArr, two) {
    this.virtualBody = this.body.map(function (item) {
      return _toConsumableArray(item);
    });
    this.virtualMove(diretArr[0][0]);

    if (two && (Math.abs(this.virtualBody[0][0] - food.x) == 1 && this.virtualBody[0][1] == food.y || Math.abs(this.virtualBody[0][1] - food.y) == 1 && this.virtualBody[0][0] == food.x)) {
      this.virtualBody.unshift([food.x, food.y, 'url(images/head-right.png)', null]);
    }

    var mapArr = map.initMapArr.map(function (item) {
      return _toConsumableArray(item);
    });

    for (var j = 0; j < this.virtualBody.length; j++) {
      mapArr[this.virtualBody[j][1]][this.virtualBody[j][0]] = 1;
    }

    var breakOuter = false;

    for (var i = 0; i < 4; i++) {
      breakOuter = false;
      var currentPoint = [this.virtualBody[0][0] + one[i][0], this.virtualBody[0][1] + one[i][1]];

      if (check(mapArr, {
        x: currentPoint[1],
        y: currentPoint[0]
      })) {
        for (var n = 0; n < 4; n++) {
          var nextX = currentPoint[1] + one[n][0];
          var nextY = currentPoint[0] + one[n][1];

          if (checkLonely(mapArr, {
            x: nextX,
            y: nextY
          })) {
            breakOuter = true;
            break;
          }
        }

        if (breakOuter) continue; //!!!console.log('吃食物会产生空格', diretArr[0][0])
        //!!!if (two) console.log('追蛇尾食物在对角线会产生空格')

        return true;
      }
    }

    return false;
  }; //定时器，开始游戏时，调用


  this.speed = function () {
    timer = setInterval(function () {
      this.move();
    }.bind(this), initSpeed); //或者:          timer=setInterval(function(){this.move();}.bind(this),initSpeed);setInterval里面的this指window要bind                           
  }; //条件处理


  this.condition = function () {
    //游戏结束的判断要放在吃食物的判断之前，目的是为了让show发生在push之前(这样可以解决吃掉食物时定时器时间间隔尾巴显示错误)，因为push是发生在吃食物的判断中的
    //判断是否撞到自身（这段代码应该放在判断是否撞墙前面，因为this.show()是在判断是否撞墙这个块里面的，假如撞到自身，return退出函数，不执行下面的块，也就不执行this.show()，所以不会出现游戏结束时还会移动一步的问题）
    for (var i = 1; i < this.body.length; i++) {
      if (this.body[0][0] == this.body[i][0] && this.body[0][1] == this.body[i][1]) {
        clearInterval(timer);
        gameOver.style.display = 'block';
        isBegin = false;
        score.innerHTML = grade;
        document.all.sound.src = 'music/die.mp3'; //location.replace(location);刷新页面
      }
    } //解决撞到自身还继续移动的bug,因为下面的this.show()只写在了判断是否撞墙的else里面，没写在判断是否撞到自身的else里面。


    if (getComputedStyle(gameOver).display == 'block') {
      clearInterval(timer);
      return;
    } //判断是否撞墙


    if (this.body[0][0] < 0 || this.body[0][0] >= map.width / this.width || this.body[0][1] < 0 || this.body[0][1] >= map.height / this.height) {
      clearInterval(timer);
      gameOver.style.display = 'block';
      isBegin = false;
      score.innerHTML = grade;
      document.all.sound.src = 'music/die.mp3';
      return;
    } else {
      this.show(); //this.show()要放在游戏结束的判断里，当没结束时，就show，当结束，就不执行，不show。因此不会越界。
    }
  };

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
    } //吃食物


    document.all.sound.src = 'music/eat.mp3';
    grade++;
    this.body.unshift([food.x, food.y, 'url(images/head-right.png)', null]);

    map._map.removeChild(food._food);

    if (this.body.length != 200) {
      food.show();
    } else {
      document.all.sound.src = 'music/pass.mp3';
      script.style.transform = 'rotateY(360deg)';
      script.innerHTML = '已通关!!!';
      script.disabled = true;
      script.style.cursor = 'default';
      clearInterval(timer);
      var shade = document.createElement('div');
      shade.style.width = '40px';
      shade.style.height = '40px';
      shade.style.borderRadius = '10px';
      shade.style.position = 'absolute';
      shade.style.background = 'rgba(255,255,255,0.7)';

      map._map.appendChild(shade);

      var arr = this.body.map(function (item) {
        return _toConsumableArray(item);
      }).reverse();

      var _loop = function _loop(i) {
        setTimeout(function () {
          shade.style.top = arr[i][1] * 40 + 'px';
          shade.style.left = arr[i][0] * 40 + 'px';
        }, (i + 1) * 15);
      };

      for (var i = 0; i < arr.length; i++) {
        _loop(i);
      }

      setTimeout(function () {
        map._map.removeChild(shade);
      }, (arr.length + 1) * 15);
    } //计分器效果（解决了当两次吃食物的间隔很小时(小于计分器变化的时间间隔)出现的问题）（轮播也可以用这个方法）


    if (getComputedStyle(scoreBox).top == '-28px') {
      scoreBox.style.transition = '0s';
      scoreBox.style.top = '0px';
      first.innerHTML = second.innerHTML;
    }

    setTimeout(function () {
      second.innerHTML = parseInt(second.innerHTML) + 1;
      scoreBox.style.transition = '1.2s';
      scoreBox.style.top = '-28px';
    });
  };
}

document.onkeydown = function (event) {
  //按下回车键，开始/暂停游戏
  if (getComputedStyle(gameStart).display == 'none' && getComputedStyle(gameOver).display == 'none') {
    if (event.keyCode == 13) {
      if (snake.body.length == 200) location.reload()
      if (isBegin == false) {
        if (snake.direct == null) {
          snake.direct = 'R';
          snake.speed();
          script.innerHTML = '点击暂停';
          script.className = '';
        }

        if (timer == null) {
          timer = setInterval(function () {
            snake.move();
          }, initSpeed);
          document.title = '贪吃蛇';
          script.innerHTML = '点击暂停';
          script.className = '';
          paused.style.display = 'none';
        }

        isBegin = true;
      } else {
        clearInterval(timer);
        timer = null;
        isBegin = false;
        document.title = '贪吃蛇-暂停中···';
        script.innerHTML = '启动AI';
        script.className = 'light';
        paused.style.display = 'block';
      }
    }
  } //控制方向（通过判断第一个div和第二个div的left或top是不是相等来控制移动的方向）


  if (isBegin == true) {
    //非暂停的时候才执行下面的
    switch (event.keyCode) {
      case 38:
        //上键
        snake.direct = snake.body[0][0] == snake.body[1][0] ? snake.direct : 'U'; //避免反向移动，触发死亡bug

        if (snake.direct != 'D') {
          //加这个判断是为了防止按与运动方向相反的键时，由于下面snake.move()的作用，蛇还是会向此时运动的方向加速移动
          snake.move(); //长按加速

          clearInterval(timer); //按方向键强行让蛇移动时，需要先清除定时器，再启动计时器，是为了避免定时器的移动和snake.move()的移动叠加。
          //一定要把clearInterval(timer)放在snake.move()后面，假如放在前面，定时器就是‘清除 清除 启动 启动’(snake.move()里面是清除 启动)所以会产生定时器的叠加。

          timer = setInterval(function () {
            snake.move();
          }, initSpeed); //清除了定时器之后再启动定时器。
        }

        break;

      case 40:
        //下键
        snake.direct = snake.body[0][0] == snake.body[1][0] ? snake.direct : 'D';

        if (snake.direct != 'U') {
          snake.move();
          clearInterval(timer);
          timer = setInterval(function () {
            snake.move();
          }, initSpeed);
        }

        break;

      case 39:
        //右键
        snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'R';

        if (snake.direct != 'L') {
          snake.move();
          clearInterval(timer);
          timer = setInterval(function () {
            snake.move();
          }, initSpeed);
        }

        break;

      case 37:
        //左键
        snake.direct = snake.body[0][1] == snake.body[1][1] ? snake.direct : 'L';

        if (snake.direct != 'R') {
          snake.move();
          clearInterval(timer);
          timer = setInterval(function () {
            snake.move();
          }, initSpeed);
        }

        break;
    }
  }
}; //自动加载游戏


window.onload = function () {
  var snow = new Snow();

  start.onclick = function () {
    footer.style.right = 0;
    gameStart.style.opacity = 0;
    message.style.opacity = 1;
    h2.style.opacity = 1;
    buttonDiv.style.opacity = 1;
    img.style.opacity = 1;
    map.map1.style.opacity = 1;
    setTimeout(function () {
      gameStart.style.display = 'none';
    }, 2000);
  };

  start.onmouseover = function () {
    this.src = 'images/start-hover.png';
  };

  start.onmouseout = function () {
    this.src = 'images/start.png';
  };

  setTimeout(function () {
    start.style.display = 'block';
    start.style.opacity = 1;
    start.style.transform = 'scale(1)';
  }, 2300);
  setTimeout(function () {
    tan.style.left = '300px';
    tan.style.transform = 'rotate(3600deg)';
  }, 50);
  setTimeout(function () {
    chi.style.top = '6px';
    chi.style.transform = 'rotate(1080deg)';
  }, 50);
  setTimeout(function () {
    she.style.right = '345px';
    she.style.transform = 'rotate(3600deg)';
  }, 50);
  bubbly({
    colorStart: "#fff4e6",
    colorStop: "#ffe9e4",
    blur: 1,
    compose: "source-over",
    bubbleFunc: function bubbleFunc() {
      return "hsla(".concat(Math.random() * 50, ", 100%, 50%, .3)");
    }
  });
  map = new Map();
  map.show();
  snake = new Snake();
  snake.show();
  food = new Food();
  food.show(); //一定要把snake=new Snake()定义在food.show()的前面，前面要在food里面拿snake里面body的值，如果不定义在前面就拿不到。

  script.onclick = function () {
    initSpeed = 20;
    fireKeyEvent(document.documentElement, 'keydown', 13);
  };
};