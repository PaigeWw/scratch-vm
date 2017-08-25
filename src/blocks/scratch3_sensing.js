const Cast = require('../util/cast');

class Scratch3SensingBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            sensing_touchingobject: this.touchingObject,
            sensing_touchingcolor: this.touchingColor,
            sensing_coloristouchingcolor: this.colorTouchingColor,
            sensing_distanceto: this.distanceTo,
            sensing_timer: this.getTimer,
            sensing_resettimer: this.resetTimer,
            sensing_of: this.getAttributeOf,
            sensing_mousex: this.getMouseX,
            sensing_mousey: this.getMouseY,
            sensing_mousedown: this.getMouseDown,
            sensing_keypressed: this.getKeyPressed,
            sensing_current: this.current,
            sensing_dayssince2000: this.daysSince2000,
            sensing_loudness: this.getLoudness
        };
    }

    touchingObject (args, util) {
        const requestedObject = args.TOUCHINGOBJECTMENU;
        if (requestedObject === '_mouse_') {
            const mouseX = util.ioQuery('mouse', 'getX');
            const mouseY = util.ioQuery('mouse', 'getY');
            return util.target.isTouchingPoint(mouseX, mouseY);
        } else if (requestedObject === '_edge_') {
            return util.target.isTouchingEdge();
        }
        return util.target.isTouchingSprite(requestedObject);

    }

    touchingColor (args, util) {
        const color = Cast.toRgbColorList(args.COLOR);
        return util.target.isTouchingColor(color);
    }

    colorTouchingColor (args, util) {
        const maskColor = Cast.toRgbColorList(args.COLOR);
        const targetColor = Cast.toRgbColorList(args.COLOR2);
        return util.target.colorIsTouchingColor(targetColor, maskColor);
    }

    distanceTo (args, util) {
        if (util.target.isStage) return 10000;

        let targetX = 0;
        let targetY = 0;
        if (args.DISTANCETOMENU === '_mouse_') {
            targetX = util.ioQuery('mouse', 'getX');
            targetY = util.ioQuery('mouse', 'getY');
        } else {
            const distTarget = this.runtime.getSpriteTargetByName(
                args.DISTANCETOMENU
            );
            if (!distTarget) return 10000;
            targetX = distTarget.x;
            targetY = distTarget.y;
        }

        const dx = util.target.x - targetX;
        const dy = util.target.y - targetY;
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    getTimer (args, util) {
        return util.ioQuery('clock', 'projectTimer');
    }

    resetTimer (args, util) {
        util.ioQuery('clock', 'resetProjectTimer');
    }

    getMouseX (args, util) {
        return util.ioQuery('mouse', 'getX');
    }

    getMouseY (args, util) {
        return util.ioQuery('mouse', 'getY');
    }

    getMouseDown (args, util) {
        return util.ioQuery('mouse', 'getIsDown');
    }

    current (args) {
        const menuOption = Cast.toString(args.CURRENTMENU).toLowerCase();
        const date = new Date();
        switch (menuOption) {
        case 'year': return date.getFullYear();
        case 'month': return date.getMonth() + 1; // getMonth is zero-based
        case 'date': return date.getDate();
        case 'dayofweek': return date.getDay() + 1; // getDay is zero-based, Sun=0
        case 'hour': return date.getHours();
        case 'minute': return date.getMinutes();
        case 'second': return date.getSeconds();
        }
        return 0;
    }

    getKeyPressed (args, util) {
        return util.ioQuery('keyboard', 'getKeyIsDown', [args.KEY_OPTION]);
    }

    daysSince2000 () {
        const msPerDay = 24 * 60 * 60 * 1000;
        const start = new Date(2000, 0, 1); // Months are 0-indexed.
        const today = new Date();
        const dstAdjust = today.getTimezoneOffset() - start.getTimezoneOffset();
        let mSecsSinceStart = today.valueOf() - start.valueOf();
        mSecsSinceStart += ((today.getTimezoneOffset() - dstAdjust) * 60 * 1000);
        return mSecsSinceStart / msPerDay;
    }

    getLoudness () {
        if (typeof this.runtime.audioEngine === 'undefined') return -1;
        return this.runtime.audioEngine.getLoudness();
    }

    getAttributeOf (args) {
        let attrTarget;

        if (args.OBJECT === '_stage_') {
            attrTarget = this.runtime.getTargetForStage();
        } else {
            attrTarget = this.runtime.getSpriteTargetByName(args.OBJECT);
        }

        // Generic attributes
        if (attrTarget.isStage) {
            switch (args.PROPERTY) {
            // Scratch 1.4 support
            case 'background #': return attrTarget.currentCostume + 1;

            case 'backdrop #': return attrTarget.currentCostume + 1;
            case 'backdrop name':
                return attrTarget.sprite.costumes[attrTarget.currentCostume].name;
            case 'volume': return; // @todo: Keep this in mind for sound blocks!
            }
        } else {
            switch (args.PROPERTY) {
            case 'x position': return attrTarget.x;
            case 'y position': return attrTarget.y;
            case 'direction': return attrTarget.direction;
            case 'costume #': return attrTarget.currentCostume + 1;
            case 'costume name':
                return attrTarget.sprite.costumes[attrTarget.currentCostume].name;
            case 'size': return attrTarget.size;
            case 'volume': return; // @todo: above, keep in mind for sound blocks..
            }
        }

        // Variables
        const varName = args.PROPERTY;
        if (attrTarget.variables.hasOwnProperty(varName)) {
            return attrTarget.variables[varName].value;
        }

        // Otherwise, 0
        return 0;
    }
}

module.exports = Scratch3SensingBlocks;
