const calculateTip = (total, tipPercent = 0.25) => total * (1 + tipPercent);

module.exports = {
    calculateTip
};