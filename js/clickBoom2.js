// 第一个文件内容
const numberOfParticules = 20;

const minOrbitRadius = 50;
const maxOrbitRadius = 100;

const minCircleRadius = 10;
const maxCircleRadius = 20;

const minAnimeDuration = 900;
const maxAnimeDuration = 1500;

const minDiffuseRadius = 50;
const maxDiffuseRadius = 100;

let canvasEl = document.querySelector(".fireworks");
let ctx = canvasEl.getContext("2d");
let pointerX = 0;
let pointerY = 0;

let tap =
  "ontouchstart" in window || navigator.msMaxTouchPoints
    ? "touchstart"
    : "mousedown";

// sea blue
let colors = ["127, 180, 226", "157, 209, 243", "204, 229, 255"];

function setCanvasSize() {
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
  canvasEl.style.width = window.innerWidth + "px";
  canvasEl.style.height = window.innerHeight + "px";
}

function updateCoords(e) {
  pointerX = e.clientX || e.touches[0].clientX;
  pointerY = e.clientY || e.touches[0].clientY;
}

function setParticuleDirection(p) {
  let angle = (anime.random(0, 360) * Math.PI) / 180;
  let value = anime.random(minDiffuseRadius, maxDiffuseRadius);
  let radius = [-1, 1][anime.random(0, 1)] * value;
  return {
    x: p.x + radius * Math.cos(angle),
    y: p.y + radius * Math.sin(angle),
  };
}

function createParticule(x, y) {
  let p = {};
  p.x = x;
  p.y = y;
  p.color =
    "rgba(" +
    colors[anime.random(0, colors.length - 1)] +
    "," +
    anime.random(0.2, 0.8) +
    ")";
  p.radius = anime.random(minCircleRadius, maxCircleRadius);
  p.endPos = setParticuleDirection(p);
  p.draw = function () {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = p.color;
    ctx.fill();
  };
  return p;
}

function createCircle(x, y) {
  let p = {};
  p.x = x;
  p.y = y;
  p.color = "#000";
  p.radius = 0.1;
  p.alpha = 0.5;
  p.lineWidth = 6;
  p.draw = function () {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.lineWidth = p.lineWidth;
    ctx.strokeStyle = p.color;
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  return p;
}

function renderParticule(anim) {
  for (let i = 0; i < anim.animatables.length; i++) {
    anim.animatables[i].target.draw();
  }
}

function animateParticules(x, y) {
  let circle = createCircle(x, y);
  let particules = [];
  for (let i = 0; i < numberOfParticules; i++) {
    particules.push(createParticule(x, y));
  }
  anime
    .timeline()
    .add({
      targets: particules,
      x: function (p) {
        return p.endPos.x;
      },
      y: function (p) {
        return p.endPos.y;
      },
      radius: 0.1,
      duration: anime.random(minAnimeDuration, maxAnimeDuration),
      easing: "easeOutExpo",
      update: renderParticule,
    })
    .add({
      targets: circle,
      radius: anime.random(minOrbitRadius, maxOrbitRadius),
      lineWidth: 0,
      alpha: {
        value: 0,
        easing: "linear",
        duration: anime.random(600, 800),
      },
      duration: anime.random(1200, 1800),
      easing: "easeOutExpo",
      update: renderParticule,
      offset: 0,
    });
}

let render = anime({
  duration: Infinity,
  update: function () {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  },
});

document.addEventListener(
  tap,
  function (e) {
    render.play();
    updateCoords(e);
    animateParticules(pointerX, pointerY);
  },
  false
);

setCanvasSize();
window.addEventListener("resize", setCanvasSize, false);


// 第二个文件内容
class Circle {
  constructor({ origin, speed, color, angle, context }) {
    this.origin = origin;
    this.position = { ...this.origin };
    this.color = color;
    this.speed = speed;
    this.angle = angle;
    this.context = context;
    this.renderCount = 0;
  }

  draw() {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
    this.context.fill();
  }

  move() {
    this.position.x = Math.sin(this.angle) * this.speed + this.position.x;
    this.position.y =
      Math.cos(this.angle) * this.speed +
      this.position.y +
      this.renderCount * 0.3;
    this.renderCount++;
  }
}

class Boom {
  constructor({ origin, context, circleCount = 10, area }) {
    this.origin = origin;
    this.context = context;
    this.circleCount = circleCount;
    this.area = area;
    this.stop = false;
    this.circles = [];
  }

  randomArray(range) {
    const length = range.length;
    const randomIndex = Math.floor(length * Math.random());
    return range[randomIndex];
  }

  randomColor() {
    const range = ["8", "9", "A", "B", "C", "D", "E", "F"];
    return (
      "#" +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range)
    );
  }

  randomRange(start, end) {
    return (end - start) * Math.random() + start;
  }

  init() {
    for (let i = 0; i < this.circleCount; i++) {
      const circle = new Circle({
        context: this.context,
        origin: this.origin,
        color: this.randomColor(),
        angle: this.randomRange(Math.PI - 1, Math.PI + 1),
        speed: this.randomRange(1, 6),
      });
      this.circles.push(circle);
    }
  }

  move() {
    this.circles.forEach((circle, index) => {
      if (
        circle.position.x > this.area.width ||
        circle.position.y > this.area.height
      ) {
        return this.circles.splice(index, 1);
      }
      circle.move();
    });
    if (this.circles.length == 0) {
      this.stop = true;
    }
  }

  draw() {
    this.circles.forEach((circle) => circle.draw());
  }
}

class CursorSpecialEffects {
  constructor() {
    this.computerCanvas = document.createElement("canvas");
    this.renderCanvas = document.createElement("canvas");

    this.computerContext = this.computerCanvas.getContext("2d");
    this.renderContext = this.renderCanvas.getContext("2d");

    this.globalWidth = window.innerWidth;
    this.globalHeight = window.innerHeight;

    this.booms = [];
    this.running = false;
  }

  handleMouseDown(e) {
    const boom = new Boom({
      origin: { x: e.clientX, y: e.clientY },
      context: this.computerContext,
      area: {
        width: this.globalWidth,
        height: this.globalHeight,
      },
    });
    boom.init();
    this.booms.push(boom);
    this.running || this.run();
  }

  handlePageHide() {
    this.booms = [];
    this.running = false;
  }

  init() {
    const style = this.renderCanvas.style;
    style.position = "fixed";
    style.top = style.left = 0;
    style.zIndex = "99999";
    style.pointerEvents = "none";

    style.width =
      this.renderCanvas.width =
      this.computerCanvas.width =
      this.globalWidth;
    style.height =
      this.renderCanvas.height =
      this.computerCanvas.height =
      this.globalHeight;

    document.body.append(this.renderCanvas);

    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("pagehide", this.handlePageHide.bind(this));
  }

  run() {
    this.running = true;
    if (this.booms.length == 0) {
      return (this.running = false);
    }

    requestAnimationFrame(this.run.bind(this));

    this.computerContext.clearRect(0, 0, this.globalWidth, this.globalHeight);
    this.renderContext.clearRect(0, 0, this.globalWidth, this.globalHeight);

    this.booms.forEach((boom, index) => {
      if (boom.stop) {
        return this.booms.splice(index, 1);
      }
      boom.move();
      boom.draw();
    });
    this.renderContext.drawImage(
      this.computerCanvas,
      0,
      0,
      this.globalWidth,
      this.globalHeight
    );
  }
}

const cursorSpecialEffects = new CursorSpecialEffects();
cursorSpecialEffects.init();


class Boom {
  class Circle {
  constructor({ origin, speed, color, angle, context }) {
    this.origin = origin;
    this.position = { ...this.origin };
    this.color = color;
    this.speed = speed;
    this.angle = angle;
    this.context = context;
    this.renderCount = 0;
  }

  draw() {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
    this.context.fill();
  }

  move() {
    this.position.x = Math.sin(this.angle) * this.speed + this.position.x;
    this.position.y =
      Math.cos(this.angle) * this.speed +
      this.position.y +
      this.renderCount * 0.3;
    this.renderCount++;
  }
}

class Boom {
  constructor({ origin, context, circleCount = 10, area }) {
    this.origin = origin;
    this.context = context;
    this.circleCount = circleCount;
    this.area = area;
    this.stop = false;
    this.circles = [];
  }

  randomArray(range) {
    const length = range.length;
    const randomIndex = Math.floor(length * Math.random());
    return range[randomIndex];
  }

  randomColor() {
    const range = ["8", "9", "A", "B", "C", "D", "E", "F"];
    return (
      "#" +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range)
    );
  }

  randomRange(start, end) {
    return (end - start) * Math.random() + start;
  }

  init() {
    for (let i = 0; i < this.circleCount; i++) {
      const circle = new Circle({
        context: this.context,
        origin: this.origin,
        color: this.randomColor(),
        angle: this.randomRange(Math.PI - 1, Math.PI + 1),
        speed: this.randomRange(1, 6),
      });
      this.circles.push(circle);
    }
  }

  move() {
    this.circles.forEach((circle, index) => {
      if (
        circle.position.x > this.area.width ||
        circle.position.y > this.area.height
      ) {
        return this.circles.splice(index, 1);
      }
      circle.move();
    });
    if (this.circles.length == 0) {
      this.stop = true;
    }
  }

  draw() {
    this.circles.forEach((circle) => circle.draw());
  }
}

class CursorSpecialEffects {
  constructor() {
    this.computerCanvas = document.createElement("canvas");
    this.renderCanvas = document.createElement("canvas");

    this.computerContext = this.computerCanvas.getContext("2d");
    this.renderContext = this.renderCanvas.getContext("2d");

    this.globalWidth = window.innerWidth;
    this.globalHeight = window.innerHeight;

    this.booms = [];
    this.running = false;
  }

  handleMouseDown(e) {
    const boom = new Boom({
      origin: { x: e.clientX, y: e.clientY },
      context: this.computerContext,
      area: {
        width: this.globalWidth,
        height: this.globalHeight,
      },
    });
    boom.init();
    this.booms.push(boom);
    this.running || this.run();
  }

  handlePageHide() {
    this.booms = [];
    this.running = false;
  }

  init() {
    const style = this.renderCanvas.style;
    style.position = "fixed";
    style.top = style.left = 0;
    style.zIndex = "99999";
    style.pointerEvents = "none";

    style.width =
      this.renderCanvas.width =
      this.computerCanvas.width =
      this.globalWidth;
    style.height =
      this.renderCanvas.height =
      this.computerCanvas.height =
      this.globalHeight;

    document.body.append(this.renderCanvas);

    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("pagehide", this.handlePageHide.bind(this));
  }

  run() {
    this.running = true;
    if (this.booms.length == 0) {
      return (this.running = false);
    }

    requestAnimationFrame(this.run.bind(this));

    this.computerContext.clearRect(0, 0, this.globalWidth, this.globalHeight);
    this.renderContext.clearRect(0, 0, this.globalWidth, this.globalHeight);

    this.booms.forEach((boom, index) => {
      if (boom.stop) {
        return this.booms.splice(index, 1);
      }
      boom.move();
      boom.draw();
    });
    this.renderContext.drawImage(
      this.computerCanvas,
      0,
      0,
      this.globalWidth,
      this.globalHeight
    );
  }
}

const cursorSpecialEffects = new CursorSpecialEffects();
cursorSpecialEffects.init();
  }

class CursorSpecialEffects {
  class Circle {
  constructor({ origin, speed, color, angle, context }) {
    this.origin = origin;
    this.position = { ...this.origin };
    this.color = color;
    this.speed = speed;
    this.angle = angle;
    this.context = context;
    this.renderCount = 0;
  }

  draw() {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
    this.context.fill();
  }

  move() {
    this.position.x = Math.sin(this.angle) * this.speed + this.position.x;
    this.position.y =
      Math.cos(this.angle) * this.speed +
      this.position.y +
      this.renderCount * 0.3;
    this.renderCount++;
  }
}

class Boom {
  constructor({ origin, context, circleCount = 10, area }) {
    this.origin = origin;
    this.context = context;
    this.circleCount = circleCount;
    this.area = area;
    this.stop = false;
    this.circles = [];
  }

  randomArray(range) {
    const length = range.length;
    const randomIndex = Math.floor(length * Math.random());
    return range[randomIndex];
  }

  randomColor() {
    const range = ["8", "9", "A", "B", "C", "D", "E", "F"];
    return (
      "#" +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range)
    );
  }

  randomRange(start, end) {
    return (end - start) * Math.random() + start;
  }

  init() {
    for (let i = 0; i < this.circleCount; i++) {
      const circle = new Circle({
        context: this.context,
        origin: this.origin,
        color: this.randomColor(),
        angle: this.randomRange(Math.PI - 1, Math.PI + 1),
        speed: this.randomRange(1, 6),
      });
      this.circles.push(circle);
    }
  }

  move() {
    this.circles.forEach((circle, index) => {
      if (
        circle.position.x > this.area.width ||
        circle.position.y > this.area.height
      ) {
        return this.circles.splice(index, 1);
      }
      circle.move();
    });
    if (this.circles.length == 0) {
      this.stop = true;
    }
  }

  draw() {
    this.circles.forEach((circle) => circle.draw());
  }
}

class CursorSpecialEffects {
  constructor() {
    this.computerCanvas = document.createElement("canvas");
    this.renderCanvas = document.createElement("canvas");

    this.computerContext = this.computerCanvas.getContext("2d");
    this.renderContext = this.renderCanvas.getContext("2d");

    this.globalWidth = window.innerWidth;
    this.globalHeight = window.innerHeight;

    this.booms = [];
    this.running = false;
  }

  handleMouseDown(e) {
    const boom = new Boom({
      origin: { x: e.clientX, y: e.clientY },
      context: this.computerContext,
      area: {
        width: this.globalWidth,
        height: this.globalHeight,
      },
    });
    boom.init();
    this.booms.push(boom);
    this.running || this.run();
  }

  handlePageHide() {
    this.booms = [];
    this.running = false;
  }

  init() {
    const style = this.renderCanvas.style;
    style.position = "fixed";
    style.top = style.left = 0;
    style.zIndex = "99999";
    style.pointerEvents = "none";

    style.width =
      this.renderCanvas.width =
      this.computerCanvas.width =
      this.globalWidth;
    style.height =
      this.renderCanvas.height =
      this.computerCanvas.height =
      this.globalHeight;

    document.body.append(this.renderCanvas);

    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("pagehide", this.handlePageHide.bind(this));
  }

  run() {
    this.running = true;
    if (this.booms.length == 0) {
      return (this.running = false);
    }

    requestAnimationFrame(this.run.bind(this));

    this.computerContext.clearRect(0, 0, this.globalWidth, this.globalHeight);
    this.renderContext.clearRect(0, 0, this.globalWidth, this.globalHeight);

    this.booms.forEach((boom, index) => {
      if (boom.stop) {
        return this.booms.splice(index, 1);
      }
      boom.move();
      boom.draw();
    });
    this.renderContext.drawImage(
      this.computerCanvas,
      0,
      0,
      this.globalWidth,
      this.globalHeight
    );
  }
}

const cursorSpecialEffects = new CursorSpecialEffects();
cursorSpecialEffects.init();
  }

const cursorSpecialEffects = new CursorSpecialEffects();
cursorSpecialEffects.init();

// 第三个文件内容
!function (e, t, a) { function n() { c(".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: fixed;}.heart:after{top: -5px;}.heart:before{left: -5px;}"), o(), r() } function r() { for (var e = 0; e < d.length; e++)d[e].alpha <= 0 ? (t.body.removeChild(d[e].el), d.splice(e, 1)) : (d[e].y--, d[e].scale += .004, d[e].alpha -= .013, d[e].el.style.cssText = "left:" + d[e].x + "px;top:" + d[e].y + "px;opacity:" + d[e].alpha + ";transform:scale(" + d[e].scale + "," + d[e].scale + ") rotate(45deg);background:" + d[e].color + ";z-index:99999"); requestAnimationFrame(r) } function o() { var t = "function" == typeof e.onclick && e.onclick; e.onclick = function (e) { t && t(), i(e) } } function i(e) { var a = t.createElement("div"); a.className = "heart", d.push({ el: a, x: e.clientX - 5, y: e.clientY - 5, scale: 1, alpha: 1, color: s() }), t.body.appendChild(a) } function c(e) { var a = t.createElement("style"); a.type = "text/css"; try { a.appendChild(t.createTextNode(e)) } catch (t) { a.styleSheet.cssText = e } t.getElementsByTagName("head")[0].appendChild(a) } function s() { return "rgb(" + ~~(255 * Math.random()) + "," + ~~(255 * Math.random()) + "," + ~~(255 * Math.random()) + ")" } var d = []; e.requestAnimationFrame = function () { return e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame || e.oRequestAnimationFrame || e.msRequestAnimationFrame || function (e) { setTimeout(e, 1e3 / 60) } }(), n() }(window, document);
