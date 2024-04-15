import bigInt from "big-integer";
import { randomBytes } from "crypto";
import { Wallet } from "ethers"

export function createRandomWallet(): [address: string, secret: string, mnemonic?: string] {
    // Create a random Ethereum wallet
    const wallet = Wallet.createRandom();

    // Extract wallet properties
    const address = wallet.address;
    const privateKeyWithPrefix = wallet.privateKey;
    const mnemonic = wallet.mnemonic?.phrase;

    // Remove '0x' prefix from the private key if present
    const privateKey = privateKeyWithPrefix.startsWith('0x') ? privateKeyWithPrefix.slice(2) : privateKeyWithPrefix;

    return [address, privateKey, mnemonic];
}

// Function to generate a random prime number of a given bit length
function generatePrime(bits: number): bigInt.BigInteger {
    let prime: bigInt.BigInteger;
    do {
        prime = bigInt(randomBytes(bits).toString('hex'), 16);
    } while (!prime.isPrime());
    return prime;
}

// Function to generate random coefficients for the polynomial
function generateCoefficients(secret: string, numShares: number, prime: bigInt.BigInteger): bigInt.BigInteger[] {
    const coefficients = [bigInt(secret, 16)];
    for (let i = 1; i < numShares; i++) {
        coefficients.push(bigInt.randBetween(1, prime));
    }
    return coefficients;
}

// Function to evaluate the polynomial at a given x
function evaluatePolynomial(coefficients: bigInt.BigInteger[], x: bigInt.BigInteger, prime: bigInt.BigInteger) {
    let result = bigInt(0);
    for (let i = 0; i < coefficients.length; i++) {
        result = result.add(coefficients[i].multiply(x.modPow(bigInt(i), prime)).mod(prime)).mod(prime);
    }
    return result;
}

export function createSecretShares(secretKey: string, numShares: number, threshold: number): SecretShare[] {
    const primeBits = 64;
    const prime = generatePrime(primeBits);
    const coefficients = generateCoefficients(secretKey, threshold, prime);
    const shares = Array<SecretShare>();

    for (let i = 1; i <= numShares; i++) {
        const x = bigInt(i);
        const y = evaluatePolynomial(coefficients, x, prime);
        shares.push(new SecretShare(x.toString(10), y.toString(16)));
    }
    return shares;
}

// Function to reconstruct the secret from a subset of shares
export function reconstructSecret(shares: SecretShare[], prime: bigInt.BigInteger) {
    let secret = bigInt(0);
    for (let i = 0; i < shares.length; i++) {
        let term = bigInt(shares[i].y, 16);
        for (let j = 0; j < shares.length; j++) {
            if (i !== j) {
                const xj = bigInt(shares[j].x, 10);
                const xi = bigInt(shares[i].x, 10);
                term = term.multiply(xj).multiply(xj.minus(xi).modInv(prime)).mod(prime);
            }
        }
        secret = secret.add(term).mod(prime);
    }
    return secret.toString(16);
}

export class SecretShare {
    constructor(readonly x: string, readonly y: string) { }
}
