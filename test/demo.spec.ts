import { expect } from "chai";
import { SecretShare, createRandomWallet, createSecretShares, reconstructSecret, generatePrime } from "../src/demo";

describe("smock test", function () {
    context("create secret shares", function () {
        it("should run successfully", function () {
            const [, secret,] = createRandomWallet();
            const [shares,] = createSecretShares(secret, 3, 2);
            expect(shares.length).to.equal(3);
        });
    });
    context("reconstruct secret key", function () {
        let secret: string;
        let shares: SecretShare[];
        let prime: bigInt.BigInteger;

        this.beforeEach(function () {
            [, secret,] = createRandomWallet();
            [shares, prime] = createSecretShares(secret, 3, 2);
        });

        it("secret key can be reconstructed from shares", function () {
            // case 1: use all of shares
            expect(reconstructSecret(shares, prime)).to.deep.equal(secret);

            // case 2: use only 2 out of 3 shares
            expect(reconstructSecret(shares.slice(0, 2), prime)).to.deep.equal(secret);
            expect(reconstructSecret([shares[2], shares[0]], prime)).to.deep.equal(secret);
            expect(reconstructSecret([shares[1], shares[2]], prime)).to.deep.equal(secret);
        });
        it("cannot reconstruct secret key if don't have enough shares", function () {
            expect(reconstructSecret(shares.slice(0, 1), prime)).to.not.equal(secret);
            expect(reconstructSecret(shares.slice(1, 2), prime)).to.not.equal(secret);
            expect(reconstructSecret(shares.slice(2), prime)).to.not.equal(secret);
        });
        it("cannot reconstruct secret key if using wrong prime", function () {
            const randomPrime = generatePrime(64);
            expect(reconstructSecret(shares, randomPrime)).to.not.equal(secret);
        });
    });
});