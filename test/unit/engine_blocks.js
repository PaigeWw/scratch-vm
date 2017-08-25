const test = require('tap').test;
const Blocks = require('../../src/engine/blocks');

test('spec', t => {
    const b = new Blocks();

    t.type(Blocks, 'function');
    t.type(b, 'object');
    t.ok(b instanceof Blocks);

    t.type(b._blocks, 'object');
    t.type(b._scripts, 'object');
    t.ok(Array.isArray(b._scripts));

    t.type(b.createBlock, 'function');
    t.type(b.moveBlock, 'function');
    t.type(b.changeBlock, 'function');
    t.type(b.deleteBlock, 'function');
    t.type(b.getBlock, 'function');
    t.type(b.getScripts, 'function');
    t.type(b.getNextBlock, 'function');
    t.type(b.getBranch, 'function');
    t.type(b.getOpcode, 'function');


    t.end();
});

// Getter tests
test('getBlock', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    const block = b.getBlock('foo');
    t.type(block, 'object');
    const notBlock = b.getBlock('?');
    t.type(notBlock, 'undefined');
    t.end();
});

test('getScripts', t => {
    const b = new Blocks();
    let scripts = b.getScripts();
    t.type(scripts, 'object');
    t.equals(scripts.length, 0);
    // Create two top-level blocks and one not.
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.createBlock({
        id: 'foo2',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.createBlock({
        id: 'foo3',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });

    scripts = b.getScripts();
    t.type(scripts, 'object');
    t.equals(scripts.length, 2);
    t.ok(scripts.indexOf('foo') > -1);
    t.ok(scripts.indexOf('foo2') > -1);
    t.equals(scripts.indexOf('foo3'), -1);
    t.end();

});

test('getNextBlock', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });

    let next = b.getNextBlock('foo');
    t.equals(next, null);

    // Add a block with "foo" as its next.
    b.createBlock({
        id: 'foo2',
        opcode: 'TEST_BLOCK',
        next: 'foo',
        fields: {},
        inputs: {},
        topLevel: true
    });

    next = b.getNextBlock('foo2');
    t.equals(next, 'foo');

    // Block that doesn't exist.
    const noBlock = b.getNextBlock('?');
    t.equals(noBlock, null);

    t.end();
});

test('getBranch', t => {
    const b = new Blocks();
    // Single branch
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {
            SUBSTACK: {
                name: 'SUBSTACK',
                block: 'foo2',
                shadow: null
            }
        },
        topLevel: true
    });
    b.createBlock({
        id: 'foo2',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });

    const branch = b.getBranch('foo');
    t.equals(branch, 'foo2');

    const notBranch = b.getBranch('?');
    t.equals(notBranch, null);

    t.end();
});

test('getBranch2', t => {
    const b = new Blocks();
    // Second branch
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {
            SUBSTACK: {
                name: 'SUBSTACK',
                block: 'foo2',
                shadow: null
            },
            SUBSTACK2: {
                name: 'SUBSTACK2',
                block: 'foo3',
                shadow: null
            }
        },
        topLevel: true
    });
    b.createBlock({
        id: 'foo2',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });
    b.createBlock({
        id: 'foo3',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });

    const branch1 = b.getBranch('foo', 1);
    const branch2 = b.getBranch('foo', 2);
    t.equals(branch1, 'foo2');
    t.equals(branch2, 'foo3');

    t.end();
});

test('getBranch with none', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    const noBranch = b.getBranch('foo');
    t.equals(noBranch, null);
    t.end();
});

test('getOpcode', t => {
    const b = new Blocks();
    const block = {
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    };
    b.createBlock(block);
    const opcode = b.getOpcode(block);
    t.equals(opcode, 'TEST_BLOCK');
    const undefinedBlock = b.getBlock('?');
    const undefinedOpcode = b.getOpcode(undefinedBlock);
    t.equals(undefinedOpcode, null);
    t.end();
});

// Block events tests
test('create', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });

    t.type(b._blocks.foo, 'object');
    t.equal(b._blocks.foo.opcode, 'TEST_BLOCK');
    t.notEqual(b._scripts.indexOf('foo'), -1);
    t.end();
});

test('move', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.createBlock({
        id: 'bar',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });

    // Attach 'bar' to the end of 'foo'
    b.moveBlock({
        id: 'bar',
        newParent: 'foo'
    });
    t.equal(b._scripts.length, 1);
    t.equal(Object.keys(b._blocks).length, 2);
    t.equal(b._blocks.foo.next, 'bar');

    // Detach 'bar' from 'foo'
    b.moveBlock({
        id: 'bar',
        oldParent: 'foo'
    });
    t.equal(b._scripts.length, 2);
    t.equal(Object.keys(b._blocks).length, 2);
    t.equal(b._blocks.foo.next, null);

    t.end();
});

test('move into empty', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.createBlock({
        id: 'bar',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.moveBlock({
        id: 'bar',
        newInput: 'fooInput',
        newParent: 'foo'
    });
    t.equal(b._blocks.foo.inputs.fooInput.block, 'bar');
    t.end();
});

test('move no obscure shadow', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {
            fooInput: {
                name: 'fooInput',
                block: 'x',
                shadow: 'y'
            }
        },
        topLevel: true
    });
    b.createBlock({
        id: 'bar',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.moveBlock({
        id: 'bar',
        newInput: 'fooInput',
        newParent: 'foo'
    });
    t.equal(b._blocks.foo.inputs.fooInput.block, 'bar');
    t.equal(b._blocks.foo.inputs.fooInput.shadow, 'y');
    t.end();
});

test('change', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {
            someField: {
                name: 'someField',
                value: 'initial-value'
            }
        },
        inputs: {},
        topLevel: true
    });

    // Test that the field is updated
    t.equal(b._blocks.foo.fields.someField.value, 'initial-value');

    b.changeBlock({
        element: 'field',
        id: 'foo',
        name: 'someField',
        value: 'final-value'
    });

    t.equal(b._blocks.foo.fields.someField.value, 'final-value');

    // Invalid cases
    // No `element`
    b.changeBlock({
        id: 'foo',
        name: 'someField',
        value: 'invalid-value'
    });
    t.equal(b._blocks.foo.fields.someField.value, 'final-value');

    // No block ID
    b.changeBlock({
        element: 'field',
        name: 'someField',
        value: 'invalid-value'
    });
    t.equal(b._blocks.foo.fields.someField.value, 'final-value');

    // No such field
    b.changeBlock({
        element: 'field',
        id: 'foo',
        name: 'someWrongField',
        value: 'final-value'
    });
    t.equal(b._blocks.foo.fields.someField.value, 'final-value');

    t.end();
});

test('delete', t => {
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.deleteBlock({
        id: 'foo'
    });

    t.type(b._blocks.foo, 'undefined');
    t.equal(b._scripts.indexOf('foo'), -1);
    t.end();
});

test('delete chain', t => {
    // Create a chain of connected blocks and delete the top one.
    // All of them should be deleted.
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: 'foo2',
        fields: {},
        inputs: {},
        topLevel: true
    });
    b.createBlock({
        id: 'foo2',
        opcode: 'TEST_BLOCK',
        next: 'foo3',
        fields: {},
        inputs: {},
        topLevel: false
    });
    b.createBlock({
        id: 'foo3',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });
    b.deleteBlock({
        id: 'foo'
    });
    t.type(b._blocks.foo, 'undefined');
    t.type(b._blocks.foo2, 'undefined');
    t.type(b._blocks.foo3, 'undefined');
    t.equal(b._scripts.indexOf('foo'), -1);
    t.equal(Object.keys(b._blocks).length, 0);
    t.equal(b._scripts.length, 0);
    t.end();
});

test('delete inputs', t => {
    // Create a block with two inputs, one of which has its own input.
    // Delete the block - all of them should be deleted.
    const b = new Blocks();
    b.createBlock({
        id: 'foo',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {
            input1: {
                name: 'input1',
                block: 'foo2',
                shadow: 'foo2'
            },
            SUBSTACK: {
                name: 'SUBSTACK',
                block: 'foo3',
                shadow: null
            }
        },
        topLevel: true
    });
    b.createBlock({
        id: 'foo2',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });
    b.createBlock({
        id: 'foo5',
        opcode: 'TEST_OBSCURED_SHADOW',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });
    b.createBlock({
        id: 'foo3',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {
            subinput: {
                name: 'subinput',
                block: 'foo4',
                shadow: 'foo5'
            }
        },
        topLevel: false
    });
    b.createBlock({
        id: 'foo4',
        opcode: 'TEST_BLOCK',
        next: null,
        fields: {},
        inputs: {},
        topLevel: false
    });
    b.deleteBlock({
        id: 'foo'
    });
    t.type(b._blocks.foo, 'undefined');
    t.type(b._blocks.foo2, 'undefined');
    t.type(b._blocks.foo3, 'undefined');
    t.type(b._blocks.foo4, 'undefined');
    t.type(b._blocks.foo5, 'undefined');
    t.equal(b._scripts.indexOf('foo'), -1);
    t.equal(Object.keys(b._blocks).length, 0);
    t.equal(b._scripts.length, 0);
    t.end();
});
