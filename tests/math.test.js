const { calculateTip, celsiusToFahrenheit, fahrenheitToCelsius } = require('../src/math');

// test to check calculateTip() works
test('Should return the total with the tip included.', () => {

    // call the function and store its return value
    const total = calculateTip(10, 0.3);

    expect(total).toBe(13);

    // compare with the real, theoretical result
    // if they don't match, throw an Error so the test fails
    // if (total !== 13) {
    //     throw new Error(`Wrong result. Expected tip: 13. Returned tip: ${total}`);
    // }

});

// test the case where we use the default tip percentage
test('Should calculate total with default tip.', () => {
    const total = calculateTip(10);
    expect(total).toBe(12.50);
});

// test if the fahrenheitToCelsius conversion works
test('Should convert 32 F to 0 C', () => {
    const celsius = fahrenheitToCelsius(32);
    expect(celsius).toBe(0);
});

// test if the celsiusToFahrenheit conversion works
test('Should convert 0 C to 32 F', () => {
    const farenheit = celsiusToFahrenheit(0);
    expect(farenheit).toBe(32);
});