const log = require('../util/log');
const MathUtil = require('../util/math-util');
const RenderedTarget = require('./rendered-target');

/**
 * Rendered target: instance of a sprite (clone), or the stage.
 * @param {!Sprite} sprite Reference to the parent sprite.
 * @param {Runtime} runtime Reference to the runtime.
 * @constructor
 */
class PlugTarget extends RenderedTarget {
    constructor (sprite, runtime) {
        super(sprite, runtime);
        this.isplug = true;
        this.isOriginal = false;
    }

    /**
     * Create a drawable with the this.renderer.
     */
    initDrawable () {
        if (this.renderer) {
            this.drawableID = this.renderer.getEditTargetCenterPointDrawableId();
        }
    }

    stopDrag () {
        this.dragging = false;
        this.runtime._editingTarget.setRotationCenter(this.x,this.y);
        this.runtime._editingTarget.setPosition(this.x,this.y);
        console.log(this.x,this.y);
    }

    /**
     * Serialize sprite info, used when emitting events about the sprite
     * @returns {object} Sprite data as a simple object
     */
    toJSON () {

    }

}

module.exports = PlugTarget;
