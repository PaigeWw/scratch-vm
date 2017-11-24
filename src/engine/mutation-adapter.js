const html = require('htmlparser2');

/**
 * Convert a part of a mutation DOM to a mutation VM object, recursively.
 * @param {object} dom DOM object for mutation tag.
 * @return {object} Object representing useful parts of this mutation.
 */
const mutatorTagToObject = function (dom) {
    const obj = Object.create(null);
    obj.tagName = dom.name;
    obj.children = [];
    for (const prop in dom.attribs) {
        if (prop === 'xmlns') continue;
        obj[prop] = dom.attribs[prop];
    }
    for (let i = 0; i < dom.children.length; i++) {
        obj.children.push(
            mutatorTagToObject(dom.children[i])
        );
    }
    return obj;
};

/**
 * Adapter between mutator XML or DOM and block representation which can be
 * used by the Scratch runtime.
 * @param {(object|string)} mutation Mutation XML string or DOM.
 * @return {object} Object representing the mutation.
 */
const mutationAdpater = function (mutation) {
    // console.log(mutation);
    let mutationParsed;
    // Check if the mutation is already parsed; if not, parse it.
    if (typeof mutation === 'object') {
        mutationParsed = mutation;
    } else {
        mutationParsed = html.parseDOM(mutation)[0];
    }
    return mutatorTagToObject(mutationParsed);
};

module.exports = mutationAdpater;
