const PlugTarget = require('./plug-target');
const RenderedTarget = require('./rendered-target');
// const Sprite = require('./Sprite');
const Blocks = require('../engine/blocks');

class SpritePlug {
    /**
     * Sprite to be used on the Scratch stage.
     * All clones of a sprite have shared blocks, shared costumes, shared variables.
     * @param {?Blocks} blocks Shared blocks object for all clones of sprite.
     * @param {Runtime} runtime Reference to the runtime.
     * @constructor
     */
    constructor (runtime) {
        this.runtime = runtime;

        this.name = '';

        this.costumes = [];
        /**
         * List of clones for this sprite, including the original.
         * @type {Array.<!RenderedTarget>}
         */
        this.clones = [];
    }

    /**
     * Create a clone of this sprite.
     * @returns {!RenderedTarget} Newly created clone.
     */
    createClone () {
        const newClone = new PlugTarget(this, this.runtime);
        newClone.isOriginal = true;
        this.clones.push(newClone);
        newClone.initDrawable();
        return newClone;
    }

    /**
     * Disconnect a clone from this sprite. The clone is unmodified.
     * In particular, the clone's dispose() method is not called.
     * @param {!RenderedTarget} clone - the clone to be removed.
     */
    removeClone (clone) {
        const cloneIndex = this.clones.indexOf(clone);
        if (cloneIndex >= 0) {
            this.clones.splice(cloneIndex, 1);
        }
    }
}

module.exports = SpritePlug;
