(function init() {
    const cnv = document.getElementById("canvas");
    cnv.width = window.innerWidth;
    cnv.height = window.innerHeight;
    const ctx = cnv.getContext("2d");
    const Art = {
        circle(x, y, radius, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        },
        line(points, width, color) {
            let index = 1;
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (index in points)
                ctx.lineTo(points[index].x, points[index].y);
            ctx.stroke();
        },
        rectangle(x, y, w, h, color, middle) {
            ctx.fillStyle = color;
            if (middle)
                ctx.fillRect(x - w / 2, y - h / 2, w, h);
            else
                ctx.fillRect(x, y, w - x, h - y);
        },
        write(text, x, y, color, align) {
            switch (align) {
                case -1:
                    ctx.textAlign = "right";
                    break;
                case 1:
                    ctx.textAlign = "left";
                    break;
                default:
                    ctx.textAlign = "center";
            }
            ctx.fillStyle = color;
            ctx.font = "30px Comic Sans MS";
            ctx.fillText(text, x, y);
        }
    };

    class Circle {
        constructor(mass, radius, xPosition, yPosition, force, angle, color) {
            this.mass = mass;
            this.radius = radius;
            this.color = color;
            this.position = {x: xPosition, y: yPosition};
            this.velocity = {force: force, angle: angle};
        }
        update() {
            this.draw();
            this.collisionDetection();
            this.move();
            this.border();
        }
        move() {
            this.position.x += Math.cos(this.velocity.angle) * this.velocity.force;
            this.position.y -= Math.sin(this.velocity.angle) * this.velocity.force;
        }
        border() {
            if ((this.position.x < this.radius) || (this.position.x > cnv.width - this.radius)) {
                if (this.position.x < this.radius)
                    this.position.x = this.radius;
                else
                    this.position.x = cnv.width - this.radius;

                if (Math.sin(this.velocity.angle) > 0)
                    this.velocity.angle = Math.PI - this.velocity.angle;
                else
                    this.velocity.angle = 3 * Math.PI - this.velocity.angle;
            }
            if ((this.position.y < this.radius) || (this.position.y > cnv.height - this.radius)) {
                if (this.position.y < this.radius)
                    this.position.y = this.radius;
                else
                    this.position.y = cnv.height - this.radius;

                this.velocity.angle = 2 * Math.PI - this.velocity.angle;
            }
        }
        collisionDetection() {
            for (index in circles)
                if ((this != circles[index]) && (this.radius + circles[index].radius > getDistance(this.position, circles[index].position)))
                    this.collision(circles[index]);
        }
        collision(other) {
            let collisionAngle = getAngle(this.position.x - other.position.x, this.position.y - other.position.y);
            let collisionArrange = this.radius + other.radius - getDistance(this.position, other.position);
            this.position.x -= Math.cos(collisionAngle) * collisionArrange / 2;
            this.position.y += Math.sin(collisionAngle) * collisionArrange / 2;
            other.position.x += Math.cos(collisionAngle) * collisionArrange / 2;
            other.position.y -= Math.sin(collisionAngle) * collisionArrange / 2;
            let thisNewAngle = this.velocity.angle - collisionAngle;
            let otherNewAngle = other.velocity.angle - collisionAngle;
            let sumOfMasses = this.mass + other.mass;
            let thisxy = {
                x: ((this.mass - other.mass) * Math.cos(thisNewAngle) * this.velocity.force +
                2 * other.mass * Math.cos(otherNewAngle) * other.velocity.force) / sumOfMasses,
                y: Math.sin(thisNewAngle) * this.velocity.force
            };
            let otherxy = {
                x: ((other.mass - this.mass) * Math.cos(otherNewAngle) * other.velocity.force +
                2 * this.mass * Math.cos(thisNewAngle) * this.velocity.force) / sumOfMasses, 
                y: Math.sin(otherNewAngle) * other.velocity.force
            };
            this.velocity.force = Math.sqrt(thisxy.x * thisxy.x + thisxy.y * thisxy.y);
            other.velocity.force = Math.sqrt(otherxy.x * otherxy.x + otherxy.y * otherxy.y);
            this.velocity.angle = getAngle(-thisxy.x, thisxy.y) + collisionAngle;
            other.velocity.angle = getAngle(-otherxy.x, otherxy.y) + collisionAngle;
        }
        draw() {
            Art.circle(this.position.x, this.position.y, this.radius, this.color);
            Art.write((this.mass).toFixed(2), this.position.x, this.position.y, "white");
            Art.write((this.velocity.force).toFixed(2), this.position.x, this.position.y + 30, "black");
        }
    }

    let circles = [];
    let howManyCircles = 50;
    for (let index = 0; index < howManyCircles; index++) {
        let red = Math.round(Math.random() * 223 + 32);
        let green = Math.round(Math.random() * 223 + 32);
        let blue = Math.round(Math.random() * 223 + 32);
        let color = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
        let mass = Math.random() * 3 + 2;
        circles.push(new Circle(
            mass,
            mass * 10,
            Math.random() * cnv.width,
            Math.random() * cnv.height,
            Math.random() * 20,
            Math.random() * Math.PI * 2,
            color
            ));
    }

    (function main() {
        Art.rectangle(0, 0, cnv.width, cnv.height, "gray");
        for (index in circles)
            circles[index].update();
        requestAnimationFrame(main);
    }());
}());

function getDistance(position1, position2) {
    let aSide = position1.x - position2.x;
    let bSide = position1.y - position2.y;
    return Math.sqrt(aSide * aSide + bSide * bSide);
}
function getAngle(x, y) {
    return Math.PI - Math.atan2(y, x);
}
