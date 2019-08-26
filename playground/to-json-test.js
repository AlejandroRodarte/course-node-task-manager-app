const pet = {
    name: 'Hal'
};

// toJSON allows to get the current JSON object and define what can be stringified
pet.toJSON = function() {
    console.log(this);
    return {};
};

// Express stringifies JSON when sending as a response
console.log(JSON.stringify(pet));