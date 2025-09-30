class Game {
    constructor(){
        this.name = name;
        this.$zone = $('.field');
        this.elements = [];

        this.width = Math.floor(this.$zone.width() / 64)
        this.height = Math.floor(this.$zone.height() / 64)
        
        this.field = [];

        this.player = this.generate(Player);
        this.fruits = [Ground, Stone, Heart]
        this.counterForTimer = 0;
        this.points = 0;
        this.hp = 3;
        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0,
        }
        this.ended = false;
        this.pause = false;
        this.keyEvents();
    }

    start(){
        console.log("Tckb ns yt ujvjctr")
        this.$zone.innerHTML = '';
        //this.generateField();
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++){
                this.generate(Stone, i, j)
            }
        }
        this.loop();
    }

    loop(){
        requestAnimationFrame(() => {
            if (!this.pause){
                this.counterForTimer++;
            if (this.counterForTimer % 60 === 0){
                this.timer();
                //this.randomFruitGenerate();
            }
            if (this.hp <= 0){
                this.end();
            }
            $('.pause').css('display', 'none').hide().fadeOut();
            this.updateElements();
            this.setParams();    
            } else if (this.pause) {
                $('.pause').css('display', 'flex').show().fadeIn();
                for (let i = 1; i < this.elements.length; i++) {
                    this.elements[i].$element.css("animation-play-state", "paused");
                }
            }
            if (!this.ended) {
                this.loop();
            }
        })
    }

    end() {
        this.ended = true;
        let time = this.time;
        if (time.s1 >= 1 || time.m2 >= 1 || time.m1 >= 1){
            $('#hudUsername').html(`Поздравляем, ${this.name}!`);
            //$('#endTime').html(`Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2}`);
            $('#collectedFruits').html(`Вы собрали ${this.points} фруктов`);
            $('#congratulation').html(`Вы выиграли!`);
        } else {
            $('#playerName').html(`Жаль, ${this.name}`);
            $('#endTime').html(`Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2}`)
            $('#collectedFruits').html(`Вы собрали ${this.points} фруктов`);
            $('#congratulation').html(`Вы проиграли!`);
        }
        go('screenLoss');
    }

    timer() {
        let time = this.time;
        time.s2++;
        if (time.s2 >= 10) {
            time.s2 = 0;
            time.s1++;
        }
        if (time.s1 >= 6) {
            time.s1 = 0;
            time.m2++;
        }
        if (time.m2 >= 10) {
            time.m2 = 0;
            time.m1++;
        }
        let str = `${time.m1}${time.m2}:${time.s1}${time.s2}`;
        $("#hudTime").html(str);
    }

    randomFruitGenerate(){
        let ranFruit = random(0, this.fruits.length-1);
        this.generate(this.fruits[ranFruit]);
    }

    setParams(){
        let params = ['name', 'points', 'hp'];
        let value = [this.name, this.points, this.hp];

        params.forEach((e, i) => {
            $(`#${e}`).html(value[i]);
        })
    }

    updateElements(){
        this.elements.forEach(e => {
            e.update();
            e.draw();
        })
    }
    
    generate(className, x, y) {
        console.log(x, y)
        let element = new className(this, x*64, y*64);
        this.elements.push(element);
        return element;
    }
    
    remove(el) {
        let idx = this.elements.indexOf(el);
        if (idx !== -1) {
            this.elements.splice(idx, 1);
            return true;
        }
        return false;
    }

    keyEvents() {
        addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                this.pause = !this.pause;
            }
        })
    }
}

class Drawable {
    constructor(game, x, y){
        this.game = game;
        this.x = x;
        this.y = y;
        this.h = 0;
        this.w = 0;
        this.offsets = {
            x: 0,
            y: 0
        }
    }

    createElement(){
        this.$element = $(`<div class="cell ${this.constructor.name.toLowerCase()}"></div>`);
        this.game.$zone.append(this.$element);
    }

    update(){
        this.x += this.offsets.x;
        this.y += this.offsets.y;
    }

    draw(){
        this.$element.css({
            left: this.x + "px",
            top: this.y + "px",
        })
    }
    
    isCollision(element) {
        let a = {
            x1: this.x,
            x2: this.x + this.w,
            y1: this.y,
            y2: this.y + this.h,
        }
        
        let b = {
            x1: element.x,
            x2: element.x + element.w,
            y1: element.y,
            y2: element.y + element.h,
        }
        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
    }
    
    removeElement() {
        this.$element.remove();
    }
}

class Player extends Drawable {
    constructor(game) {
        super(game);
        this.w = 244;
        this.h = 109;
        this.x = this.game.$zone.width() / 2 - this.w / 2;
        this.y = this.game.$zone.height() - this.h;
        this.speedPerFrame = 20;
        this.skillTimer = 0;
        this.couldTimer = 0;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
        }; // Вообще говоря, вводить как бы виртуальные флаги для клавиш - хорошая идея. Надо это запомнить
        this.createElement();
        this.bindKeyEvents();
    }

    bindKeyEvents(){
        document.addEventListener("keydown", ev => this.changeKeyStatus(ev.code, true));
        document.addEventListener("keyup", ev => this.changeKeyStatus(ev.code, false));
    }

    changeKeyStatus(code, value){
        if(code in this.keys){
            this.keys[code] = value;
        }
    }

    applySkill() {
        for (let i = 1; i < this.game.elements.length; i++) {
            if (this.game.elements[i].x < this.x + (this.w / 2)){
                this.game.elements[i].x += 15;
            } else if (this.game.elements[i].x > this.x + (this.w /2)){
                this.game.elements[i].x -= 15;
            }
        }
    }

    update(){
        if (this.keys.ArrowLeft && this.x > 0) {
            this.offsets.x = -this.speedPerFrame;
        } else if (this.keys.ArrowRight && this.x < this.game.$zone.width() - this.w){
            this.offsets.x = this.speedPerFrame;
        } else {
            this.offsets.x = 0;
        }
        if (this.keys.Space && this.couldTimer === 0){
            this.skillTimer++;
            $('#skill').html(`осталось ${Math.ceil((240 - this.skillTimer) / 60)}`);
            this.applySkill();
        }
        if (this.skillTimer > 240 || (!this.keys.Space && this.skillTimer > 1)){
            this.couldTimer++;
            $('#skill').html(`в откате ещё ${Math.ceil((300 - this.couldTimer) / 60)}`);
            this.keys.Space = false;
        }
        if (this.couldTimer > 300){
            this.couldTimer = 0;
            this.skillTimer = 0;
            $('#skill').html('Готово');
        }
        super.update();
    }
}

class Fruits extends Drawable{
    constructor(game) {
        super(game);
        this.createElement();
    }

    update(){
        if (!this.game.pause) {
            this.$element.css("animation-play-state", "running");
        }
        if (this.isCollision(this.game.player) && this.offsets.y > 0){
            this.takePoint(this.game.element);
        }
        if (this.y > this.game.$zone.height()) {
            this.takeDamage(this.game.element);
        }
        super.update();
    }

    takePoint() {
        if (this.game.remove(this)) {
            this.removeElement();
            this.game.points++;
        }
    }

    takeDamage() {
        if (this.game.remove(this)){
            this.removeElement();
            this.game.hp--;
        }
    }
}

class Stone extends Fruits {
    constructor(game) {
        super(game);
    }
}

class Ground extends Fruits {
    constructor(game) {
        super(game);
    }
}

class Heart extends Fruits {
    constructor(game) {
        super(game);
    }
}


let random = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


window.onload = () => {
    checkStorage();
    nav();
    startLoop();
    go("screenWelcome")



    setInterval(() => {
        if (panel === "game") {
            game.game = new Game();
            game.game.start();
            panel = "game process";
        }
    }, 500)
}

/*
window.addEventListener('load', () => {
    checkStorage();
    nav();
    startLoop();
    go("screenWelcome")
    const form = document.getElementById('welcomeForm');
    
    game = new Game();
    game.start();

    /*
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Форма отправлена!');
    });
});*/