var scale = 5;
var px0 = 10;
var py0 = 10;

var t, t0, tPrev, tStep;
var timer;
var tiles, sprites, scene, floorMaterials, sceneChars;
var fg, bg;

// Link variables
var hero;

var sceneAnimTiles, sceneAnimFrames;
var sceneWalls;

var INV_SQRT_2 = 1 / Math.sqrt(2);
var SHOW_COLLISION_BOXES = false;

// Keyboard input helper
var Key = {
    _pressed: {},
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFT_SHIFT: 16,

    getValue: function(keyCode) {
        var value = this._pressed[keyCode];
        if (!value) {
            return -1;
        }
        return value;
    },

    onKeydown: function(event) {
        if (!this._pressed[event.keyCode]) {
            this._pressed[event.keyCode] = t;
        }
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    }
};


$(document).ready(function() {
    bg = $("#canvas_bg")[0].getContext("2d");
    bg.webkitImageSmoothingEnabled = false;
    fg = $("#canvas_fg")[0].getContext("2d");
    fg.webkitImageSmoothingEnabled = false;
    
    imgpreload(["images/tiles.png", "images/sprites.png"], function(images) {

        floorMaterials = {
            "default": {
                "speed": 60
            },
            "grass": {
                "speed": 50
            }
        };

        tiles = {
            "--": { x: 1, y: 6, image: images[0] },
            "aa": { x: 9, y: 8, image: images[0] },
            "ab": { x: 9, y: 7, image: images[0] },
            "ac": { x: 8, y: 6, image: images[0] },
            "ad": { x: 9, y: 6, image: images[0] },
            "ae": { x: 8, y: 7, image: images[0] },

            "af": { x: 0, y: 5, image: images[0] },
            "ag": { x: 1, y: 5, image: images[0] },
            "ah": { x: 2, y: 5, image: images[0] },
            "ai": { x: 0, y: 6, image: images[0] },
            "aj": { x: 2, y: 6, image: images[0] },
            "ak": { x: 0, y: 7, image: images[0] },
            "al": { x: 1, y: 7, image: images[0] },
            "am": { x: 2, y: 7, image: images[0] },

            "an": { x: 4, y: 2, image: images[0] },
            "ao": { x: 5, y: 2, image: images[0] },
            
            // Flowers are animated
            "ap": { x: 16, y: 15, image: images[0],
                anim: {
                    x: [ 16, 17, 18, 19 ],
                    y: [ 15, 15, 15, 15 ],
                    speed: 3,
                    numFrames: 4
                }
            },
            
            "aq": { x: 4, y: 9, image: images[0] },
            "ar": { x: 13, y: 9, image: images[0], material: "grass" },

            "ba": { x: 12, y: 0, image: images[0] },
            "bb": { x: 6, y: 2, image: images[0] },
            "bc": { x: 14, y: 0, image: images[0] },
            "bd": { x: 12, y: 1, image: images[0] },
            "be": { x: 13, y: 1, image: images[0] },
            "bf": { x: 14, y: 1, image: images[0] },
            "bg": { x: 1, y: 2, image: images[0] },
            "bh": { x: 2, y: 2, image: images[0] },
            "bi": { x: 1, y: 2, image: images[0] }
        };

        sprites = {
            "link-walk-l-0": { x:   0, y: 0, w: 16, h: 16, image: images[1] },
            "link-walk-l-1": { x:  17, y: 0, w: 16, h: 16, image: images[1] },
            "link-walk-d-0": { x:  34, y: 0, w: 16, h: 16, image: images[1] },
            "link-walk-d-1": { x:  51, y: 0, w: 16, h: 16, image: images[1] },
            "link-walk-u-0": { x:  68, y: 0, w: 16, h: 16, image: images[1] },
            "link-walk-u-1": { x:  85, y: 0, w: 16, h: 16, image: images[1] },
            "link-walk-r-1": { x: 102, y: 0, w: 16, h: 16, image: images[1] },
            "link-walk-r-0": { x: 119, y: 0, w: 16, h: 16, image: images[1] },

            "link-push-l-0": { x:   0, y: 17, w: 16, h: 16, image: images[1] },
            "link-push-l-1": { x:  17, y: 17, w: 16, h: 16, image: images[1] },
            "link-push-d-0": { x:  34, y: 17, w: 16, h: 16, image: images[1] },
            "link-push-d-1": { x:  51, y: 17, w: 16, h: 16, image: images[1] },
            "link-push-u-0": { x:  68, y: 17, w: 16, h: 16, image: images[1] },
            "link-push-u-1": { x:  85, y: 17, w: 16, h: 16, image: images[1] },
            "link-push-r-1": { x: 102, y: 17, w: 16, h: 16, image: images[1] },
            "link-push-r-0": { x: 119, y: 17, w: 16, h: 16, image: images[1] },

            "link-grass-0": { x: 136, y: 9, w: 16, h: 7, image: images[1] },
            "link-grass-1": { x: 153, y: 9, w: 16, h: 7, image: images[1] },

            "joan-0": { x:   0, y: 34, w: 16, h: 16, image: images[1] },
            "joan-1": { x:  17, y: 34, w: 16, h: 16, image: images[1] },

            "hen-0": { x:  34, y: 34, w: 16, h: 16, image: images[1] },
            "hen-1": { x:  51, y: 34, w: 16, h: 16, image: images[1] }
        };

        // 10 tiles wide x 8 tiles high
        scene = [
            [ "aa", "af", "ag", "ag", "ag", "ag", "ag", "ap", "ag", "ag" ],
            [ "ab", "ak", "--", "ap", "--", "--", "al", "al", "--", "--" ],
            [ "aa", "ao", "an", "an", "an", "an", "an", "ao", "ai", "--" ],
            [ "ab", "an", "ar", "ba", "bb", "bc", "ar", "an", "ai", "ap" ],
            [ "aa", "af", "ar", "bd", "be", "bf", "ar", "--", "--", "--" ],
            [ "ab", "ak", "ar", "bg", "bh", "bi", "ar", "--", "--", "--" ],
            [ "ac", "ab", "ak", "am", "aq", "ak", "al", "al", "ap", "al" ],
            [ "ad", "ac", "ab", "ae", "ab", "ae", "ab", "ae", "ab", "ae" ]
        ];

        // Scene wall positions (in game px)
        sceneWalls = [
            { x: 0 * 16, y: 0 * 16, w: 1 * 16, h: 8 * 16 },
            { x: 1 * 16, y: 6 * 16, w: 1 * 16, h: 2 * 16 },
            { x: 2 * 16, y: 7 * 16, w: 8 * 16, h: 1 * 16 },
            { x: 1 * 16, y: 2 * 16, w: 1 * 16, h: 2 * 16 },
            { x: 2 * 16, y: 2 * 16, w: 5 * 16, h: 1 * 16 },  // long wall
            { x: 7 * 16, y: 2 * 16, w: 1 * 16, h: 2 * 16 },
            { x: 3 * 16, y: 3 * 16, w: 3 * 16, h: 2 * 16 },
            { x: 3 * 16, y: 5 * 16, w: 1 * 16, h: 1 * 16 },
            { x: 5 * 16, y: 5 * 16, w: 1 * 16, h: 1 * 16 }
        ];

        sceneChars = [
            // Old lady
            {
                x: 7 * 16 + 2,
                y: 5 * 16 + 2,
                w: 12,
                h: 14,
                xOffset: -2,
                yOffset: -2,
                animFrame: 0,
                sprite: "joan-0",
                anim: {
                    frames: [ "joan-0", "joan-1" ],
                    speed: 3.5,
                    numFrames: 2
                }
            },

            // Hen
            {
                x: 3 * 16 + 2,
                y: 0 * 16 + 2,
                w: 12,
                h: 14,
                xOffset: -2,
                yOffset: -2,
                animFrame: 0,
                sprite: "hen-0",
                anim: {
                    frames: [ "hen-0", "hen-1" ],
                    speed: 3.5,
                    numFrames: 2
                }
            }
        ];

        drawScene(bg, tiles, scene);

        hero = {
            w: 8,
            h: 10,
            xOffset: -4,
            yOffset: -6,
            animSpeed: 8,
            x: 20,
            y: 10,
            dir: "l",
            animFrame: 0,
            floorMaterial: "default",
            isTouchingWall: false
        };

        // Add keyup and keydown event listeners
        $(window).unbind("keyup").unbind("keydown");
        window.addEventListener("keyup", function(event) { Key.onKeyup(event); }, false);
        window.addEventListener("keydown", function(event) { Key.onKeydown(event); }, false);

        t0 = new Date().getTime();
        tPrev = t0;
        // Start the game steps.
        clearInterval(timer);
        timer = setInterval(gameStep, 1000 / 60);

    });

});

function gameStep() {
    // Get game time and previous time step length.
    t = (new Date()).getTime() - t0;
    tStep = t - tPrev;

    if (tStep > 0) {
        updatePositions();
    }
    updateCanvas();

    tPrev = t;
}

function updatePositions() {
    var cs = getUserControlState();
    var speed = floorMaterials[hero.floorMaterial].speed;
    var straightDistance = speed * tStep / 1000;
    var diagonalDistance = straightDistance * INV_SQRT_2;
    // Set proposed movement dx, dy from control state
    var dx = 0;
    var dy = 0;
    if (cs.up == -1 && cs.down == -1 && cs.left == -1 && cs.right == -1) {
        // No movement
        hero.animFrame = 0.9;
    } else if (cs.up > 0 && cs.left > 0) {
        // Up left
        dx = -diagonalDistance;
        dy = diagonalDistance;
    } else if (cs.up > 0 && cs.right > 0) {
        // Up right
        dx = diagonalDistance;
        dy = diagonalDistance;
    } else if (cs.down > 0 && cs.left > 0) {
        // Down left
        dx = -diagonalDistance;
        dy = -diagonalDistance;
    } else if (cs.down > 0 && cs.right > 0) {
        // Down right
        dx = diagonalDistance;
        dy = -diagonalDistance;
    } else if (cs.up > 0) {
        // Up
        dy = straightDistance;
        hero.dir = "u";
    } else if (cs.down > 0) {
        // Down
        dy = -straightDistance;
        hero.dir = "d";
    } else if (cs.left > 0) {
        // Left
        dx = -straightDistance;
        hero.dir = "l";
    } else if (cs.right > 0) {
        // Right
        dx = straightDistance;
        hero.dir = "r";
    }
    var nx = hero.x + dx;
    var ny = hero.y - dy;

    var result;
    var i;
    
    // Scene wall collisions
    hero.isTouchingWall = false;
    for (i = 0; i < sceneWalls.length; i++) {
        result = testCollisionAndUpdatePosition(hero.x, hero.y, nx, ny, hero.w, hero.h, sceneWalls[i]);
        nx = result.nx;
        ny = result.ny;
        if (result.touching) {
            hero.isTouchingWall = true;
        }
    }

    // Scene character collisions
    for (i = 0; i < sceneChars.length; i++) {
        result = testCollisionAndUpdatePosition(hero.x, hero.y, nx, ny, hero.w, hero.h, sceneChars[i]);
        nx = result.nx;
        ny = result.ny;
    }

    // Update Link position
    hero.x = nx;
    hero.y = ny;

    // Animation frame
    if (dx !== 0 || dy !== 0) {
        hero.animFrame += hero.animSpeed * tStep / 1000;
        if (hero.animFrame >= 2) {
            hero.animFrame = 0;
        }
    }

    // Scene animation frames
    for (var tileKey in sceneAnimFrames) {
        tileAnim = tiles[tileKey].anim;
        sceneAnimFrames[tileKey] += tileAnim.speed * tStep / 1000;
        if (sceneAnimFrames[tileKey] >= tileAnim.numFrames + 0) {
            sceneAnimFrames[tileKey] = 0;
        }
    }

    // Scene character animation frames
    for (i = 0; i < sceneChars.length; i++) {
        sceneChar = sceneChars[i];
        sceneChar.animFrame += sceneChar.anim.speed * tStep / 1000;
        if (sceneChar.animFrame >= sceneChar.anim.numFrames) {
            sceneChar.animFrame = 0;
        }
    }

    // Scene tile floor material
    var stx = parseInt((hero.x + hero.w / 2) / 16, 10);
    var sty = parseInt((hero.y + hero.h / 2) / 16, 10);
    if (stx >= 0 && stx < 10 && sty >= 0 && sty < 8) {
        var tile = tiles[scene[sty][stx]];
        hero.floorMaterial = tile.material ? tile.material : "default";
    }

}

function testCollisionAndUpdatePosition(x, y, nx, ny, w, h, wall) {
    var touching = false;
    if (testCollision(nx, ny, w, h, wall.x, wall.y, wall.w, wall.h)) {
        touching = true;
        var collisionX = testCollision(nx, y, w, h, wall.x, wall.y, wall.w, wall.h);
        var collisionY = testCollision(x, ny, w, h, wall.x, wall.y, wall.w, wall.h);
        if (collisionX) {
            // Collision in x-direction
            nx = (nx - x > 0) ? wall.x - w : wall.x + wall.w;
            // Overhang
        }
        if (collisionY) {
            // Collision in y-direction
            ny = (ny - y > 0) ? wall.y - h : wall.y + wall.h;
            // Overhang
        }
    }
    return {
        nx: nx,
        ny: ny,
        touching: touching
    };
}

// Returns true if the two objects are colliding
function testCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 <= x2 || x1 >= x2 + w2 || y1 >= y2 + h2 || y1 + h1 <= y2);
}

function updateCanvas() {
    var i;
    var sceneChar;
    var sprite;

    // Clear scene characters
    for (i = 0; i < sceneChars.length; i++) {
        sceneChar = sceneChars[i];
        if (sceneChar.prevSprite) {
            clearSprite(fg, sceneChar.prevSprite, sceneChar.prevX + sceneChar.xOffset, sceneChar.prevY + sceneChar.yOffset);
        }
    }

    // Clear Link
    if (hero.prevSprite) {
        clearSprite(fg, hero.prevSprite, hero.prevX + hero.xOffset, hero.prevY + hero.yOffset);
    }

    // Draw scene characters
    for (i = 0; i < sceneChars.length; i++) {
        sceneChar = sceneChars[i];
        var charAnimFrame = parseInt(sceneChar.animFrame, 10);
        sprite = sprites[sceneChar.anim.frames[charAnimFrame]];
        drawSprite(fg, sprite, sceneChar.x + sceneChar.xOffset, sceneChar.y + sceneChar.yOffset);
        sceneChar.prevSprite = sprite;
        sceneChar.prevX = sceneChar.x;
        sceneChar.prevY = sceneChar.y;
        if (SHOW_COLLISION_BOXES) {
            fg.fillStyle = "rgba(100, 50, 50, 0.5)";
            fg.fillRect(px0 + scale * sceneChar.x, py0 + scale * sceneChar.y, sceneChar.w * scale, sceneChar.h * scale);
        }
    }

    // Draw Link
    var animFrameStr = parseInt(hero.animFrame, 10).toString();
    var animName = hero.isTouchingWall ? "push" : "walk";
    sprite = sprites["link-" + animName + "-" + hero.dir + "-" + animFrameStr];
    drawSprite(fg, sprite, hero.x + hero.xOffset, hero.y + hero.yOffset);
    // Grass overlay
    if (hero.floorMaterial == "grass") {
        drawSprite(fg, sprites["link-grass-" + animFrameStr], hero.x - 4, hero.y + 3);
    }
    hero.prevSprite = sprite;
    hero.prevX = hero.x;
    hero.prevY = hero.y;
    if (SHOW_COLLISION_BOXES) {
        if (hero.isTouchingWall) {
            fg.fillStyle = "rgba(200, 0, 0, 0.5)";
        } else {
            fg.fillStyle = "rgba(0, 200, 0, 0.5)";
        }
        fg.fillRect(px0 + scale * hero.x, py0 + scale * hero.y, hero.w * scale, hero.h * scale);
    }


    // Update scene anim tile animation frames
    for (i = 0; i < sceneAnimTiles.length; i++) {
        // Draw the tile
        var key = sceneAnimTiles[i].key;
        drawTile(bg, {
            x: tiles[key].anim.x[parseInt(sceneAnimFrames[key], 10)],
            y: tiles[key].anim.y[parseInt(sceneAnimFrames[key], 10)],
            image: tiles[key].image
        }, sceneAnimTiles[i].x, sceneAnimTiles[i].y);
    }

}

// Gets a control state from the keyboard.
function getUserControlState() {
    return {
        up: Key.getValue(Key.UP),
        down: Key.getValue(Key.DOWN),
        left: Key.getValue(Key.LEFT),
        right: Key.getValue(Key.RIGHT),
        action: Key.getValue(Key.LEFT_SHIFT)
    };
}

function drawTile(ctx, tile, x, y) {
    var sx = 1 + 17 * tile.x;
    var sy = 1 + 17 * tile.y;
    var dw = 16 * scale;
    ctx.drawImage(tile.image, sx, sy, 16, 16, px0 + dw * x, py0 + dw * y, dw, dw);
}

function pint(x) {
    return x;//parseInt(x);
}

function drawSprite(ctx, sprite, x, y) {
    ctx.drawImage(sprite.image, sprite.x, sprite.y, sprite.w, sprite.h, px0 + pint(x) * scale, py0 + pint(y) * scale, scale * sprite.w, scale * sprite.h);
}

function clearSprite(ctx, sprite, x, y) {
    ctx.clearRect(px0 + (pint(x) - 5) * scale, py0 + (pint(y) - 5) * scale, scale * (sprite.w + 10), scale * (sprite.h + 10));
}

function drawScene(ctx, tiles, scene) {
    var i;
    // Set up sceneAnimTiles
    sceneAnimTiles = [];
    sceneAnimFrames = {};
    // Draw tiles
    for (i = 0; i < 8; i++) {
        for (var j = 0; j < 10; j++) {
            tile = tiles[scene[i][j]];
            drawTile(ctx, tile, j, i);
            if (tile.anim) {
                sceneAnimTiles.push({
                    x: j,
                    y: i,
                    key: scene[i][j]
                });
                sceneAnimFrames[scene[i][j]] = 0;
            }
        }
    }
    if (SHOW_COLLISION_BOXES) {
        // Draw walls
        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        for (i = 0; i < sceneWalls.length; i++) {
            var left = px0 + sceneWalls[i].x * scale;
            var top = py0 + sceneWalls[i].y * scale;
            var w = sceneWalls[i].w * scale;
            var h = sceneWalls[i].h * scale;
            ctx.fillRect(left, top, w, h);
        }
    }
}

function imgpreload(imgs, callback) {
    "use strict";
    var loaded = 0;
    var images = [];
    imgs = Object.prototype.toString.apply(imgs) === '[object Array]' ? imgs : [imgs];
    var inc = function() {
        loaded += 1;
        if (loaded === imgs.length && callback) {
            callback(images);
        }
    };
    for (var i = 0; i < imgs.length; i++) {
        images[i] = new Image();
        images[i].onabort = inc;
        images[i].onerror = inc;
        images[i].onload = inc;
        images[i].src = imgs[i];
    }
}

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
