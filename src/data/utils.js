const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

const generateRandomBoolean = () => {
    return Math.random() >= 0.5;
}

const utils = {
    randomNumber: generateRandomNumber,
    randomBoolean: generateRandomBoolean
}

export default utils;