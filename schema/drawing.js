module.exports = {
    type: 'object',
    required: ['drawing'],
    properties: {
        drawing: {
            type: 'array',
            items: {
                type: 'object',
                required: ['x', 'y', 'r', 'g', 'b'],
                properties: {
                    x: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 63
                    },
                    y: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 31
                    },
                    r: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 255
                    },
                    g: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 255
                    },
                    b: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 255
                    }
                }
            }
        }
    }
}