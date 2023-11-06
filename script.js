const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
const particleSize = 42;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log(ctx);
ctx.fillStyle = 'blue';
ctx.strokeStyle = 'red';
ctx.lineWidth = 1;

class Vector{
    constructor(startingX, startingY, endX, endY){
        this.x = startingX;
        this.y = startingY;

        this.xComp = endX;
        this.yComp = endY;
    }
    draw(context){
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.xComp, this.y + this.yComp);
        context.stroke();
        context.closePath();
    }


}

class Particle{
    constructor(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;

        this.speedX = 10;
        this.speedY = 10; 

        this.collided = false;
    }
    draw(context){
        context.beginPath(this.x, this.y);
        context.arc(this.x, this.y, this.size, 0, 2*Math.PI);
        context.fill();
        context.closePath();
    }
    handleCollision(effect){
        effect.particles.forEach(particle => {
            if(particle != this && !growingAppart(this, particle) && !this.collided){

                if(distance(this.x - particle.x, this.y - particle.y) <= (this.size + particle.size)){
                    // INSERT PHYSICS CALCULATIONS TO HANDLE APPROPRIATELY
                    console.log("Collision!")

                    let prevSx = this.speedX;
                    let prevSy = this.speedY;
                   
                    
                    let [x, y] = unitVector((particle.x - this.x), (particle.y - this.y));

                    let [z, w] = [-y, x];
                    
                    let P2VelocityPerpendicular = [x, y].map(element => ((particle.speedX)*x + (particle.speedY)*y)*element);
                    let P2VelocityParallel = [z, w].map(element => ((particle.speedX)*z + (particle.speedY)*w)*element);

                    let P1VelocityPerpendicular = [x, y].map(element => ((this.speedX)*x + (this.speedY)*y)*element);
                    let P1VelocityParallel = [z, w].map(element => ((this.speedX)*z + (this.speedY)*w)*element);

                    let newP1Perp = P2VelocityPerpendicular;
                    let newP2Perp = P1VelocityPerpendicular;


                    this.speedX = P1VelocityParallel[0] + newP1Perp[0];
                    this.speedY = P1VelocityParallel[1] + newP1Perp[1];
                    
                    
                    particle.speedX = P2VelocityParallel[0] + newP2Perp[0];
                    particle.speedY = P2VelocityParallel[1] + newP2Perp[1];

                    
                    

                    particle.collided = true;

                }
            }
        });
    }
    update(effect){

        this.handleCollision(effect);
        
        if(this.speedX + this.x + this.size > window.innerWidth || this.speedX + this.x - this.size < 0){
            this.speedX *=-1;
        }
        
        if(this.speedY + this.y + this.size > window.innerHeight || this.speedY + this.y - this.size < 0){
            this.speedY *=-1;
        }
        
        this.x += this.speedX;
        this.y += this.speedY;
        

        this.collided = false;
    }
}

class Effect{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.particles = [];
        this.vectors = [];
    }
    render(context){
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update(this);
        });

        this.vectors.forEach(vector => {
            vector.draw(context);
        });
    }
}

const effect = new Effect(canvas.width, canvas.height, particleSize);

// CREATES A FEW PARTICLES
let p1 = new Particle((1/10)*canvas.width, canvas.height/4, particleSize);
effect.particles.push(p1);

let p2 = new Particle((1/10)*canvas.width, 3*canvas.height/4, particleSize);
effect.particles.push(p2);


for(let i = 1; i < 10; i++){
    let particle = new Particle((i/10)*canvas.width, canvas.height/2, particleSize);
    effect.particles.push(particle);
}

// CREATE A FEW VECTORS
/*
for(let i = 1; i < 10; i++){
    let vect = new Vector((i/10)*canvas.width, canvas.height/5, Math.random()*10, Math.random()*10);
    effect.vectors.push(vect);
}
*/

// DEBUGGING
console.log(effect);
effect.render(ctx);

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render(ctx);
    requestAnimationFrame(animate);
}

animate();

function unitVector(relativeX, relativeY){
    let magnitude = Math.sqrt((relativeX*relativeX) + (relativeY*relativeY));
    let x = (relativeX)/magnitude;
    let y = (relativeY)/magnitude;

    return [x, y];
}

function distance(relativeX, relativeY){
    return Math.sqrt((relativeX*relativeX)+(relativeY*relativeY));
}

function growingAppart(particle1, particle2){
    let d1 = distance(particle1.x - particle2.x, 
                      particle1.y - particle2.y);
    let d2 = distance((particle1.x + particle1.speedX) - (particle2.x + particle2.speedX), 
                      (particle1.y + particle1.speedY) - (particle2.y + particle2.speedY));
    return (d2 > d1);
}