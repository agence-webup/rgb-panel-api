module.exports = {
    type: "object",
    required: ['text'],
    properties: {
        text: {
            type: 'string',
            maxLength: 20
        }
    }
}