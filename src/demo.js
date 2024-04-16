"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretShare = exports.reconstructSecret = exports.createSecretShares = exports.generatePrime = exports.createRandomWallet = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
const crypto_1 = require("crypto");
const ethers_1 = require("ethers");
function createRandomWallet() {
    var _a;
    // Create a random Ethereum wallet
    const wallet = ethers_1.Wallet.createRandom();
    // Extract wallet properties
    const address = wallet.address;
    const privateKeyWithPrefix = wallet.privateKey;
    const mnemonic = (_a = wallet.mnemonic) === null || _a === void 0 ? void 0 : _a.phrase;
    // Remove '0x' prefix from the private key if present
    const privateKey = privateKeyWithPrefix.startsWith('0x') ? privateKeyWithPrefix.slice(2) : privateKeyWithPrefix;
    return [address, privateKey, mnemonic];
}
exports.createRandomWallet = createRandomWallet;
// Function to generate a random prime number of a given bit length
function generatePrime(bits) {
    let prime;
    do {
        prime = (0, big_integer_1.default)((0, crypto_1.randomBytes)(bits).toString('hex'), 16);
    } while (!prime.isPrime());
    return prime;
}
exports.generatePrime = generatePrime;
// Function to generate random coefficients for the polynomial
function generateCoefficients(secret, numShares, prime) {
    const coefficients = [(0, big_integer_1.default)(secret, 16)];
    for (let i = 1; i < numShares; i++) {
        coefficients.push(big_integer_1.default.randBetween(1, prime));
    }
    return coefficients;
}
// Function to evaluate the polynomial at a given x
function evaluatePolynomial(coefficients, x, prime) {
    let result = (0, big_integer_1.default)(0);
    for (let i = 0; i < coefficients.length; i++) {
        result = result.add(coefficients[i].multiply(x.modPow((0, big_integer_1.default)(i), prime)).mod(prime)).mod(prime);
    }
    return result;
}
function createSecretShares(secretKey, numShares, threshold) {
    const primeBits = 64;
    const prime = generatePrime(primeBits);
    const coefficients = generateCoefficients(secretKey, threshold, prime);
    const shares = Array();
    for (let i = 1; i <= numShares; i++) {
        const x = (0, big_integer_1.default)(i);
        const y = evaluatePolynomial(coefficients, x, prime);
        shares.push(new SecretShare(x.toString(10), y.toString(16)));
    }
    return [shares, prime];
}
exports.createSecretShares = createSecretShares;
// Function to reconstruct the secret from a subset of shares
function reconstructSecret(shares, prime) {
    let secret = (0, big_integer_1.default)(0);
    for (let i = 0; i < shares.length; i++) {
        let term = (0, big_integer_1.default)(shares[i].y, 16);
        for (let j = 0; j < shares.length; j++) {
            if (i !== j) {
                const xj = (0, big_integer_1.default)(shares[j].x, 10);
                const xi = (0, big_integer_1.default)(shares[i].x, 10);
                term = term.multiply(xj).multiply(xj.minus(xi).modInv(prime)).mod(prime);
            }
        }
        secret = secret.add(term).mod(prime);
    }
    return secret.toString(16);
}
exports.reconstructSecret = reconstructSecret;
class SecretShare {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.SecretShare = SecretShare;
