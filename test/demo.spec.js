"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const demo_1 = require("../src/demo");
describe("smock test", function () {
    context("create secret shares", function () {
        it("should run successfully", function () {
            const [, secret,] = (0, demo_1.createRandomWallet)();
            const [shares,] = (0, demo_1.createSecretShares)(secret, 3, 2);
            (0, chai_1.expect)(shares.length).to.equal(3);
        });
    });
    context("reconstruct secret key", function () {
        let secret;
        let shares;
        let prime;
        this.beforeEach(function () {
            [, secret,] = (0, demo_1.createRandomWallet)();
            [shares, prime] = (0, demo_1.createSecretShares)(secret, 3, 2);
        });
        it("secret key can be reconstructed from shares", function () {
            // case 1: use all of shares
            (0, chai_1.expect)((0, demo_1.reconstructSecret)(shares, prime)).to.deep.equal(secret);
            // case 2: use only 2 out of 3 shares
            (0, chai_1.expect)((0, demo_1.reconstructSecret)(shares.slice(0, 2), prime)).to.deep.equal(secret);
            (0, chai_1.expect)((0, demo_1.reconstructSecret)([shares[2], shares[0]], prime)).to.deep.equal(secret);
            (0, chai_1.expect)((0, demo_1.reconstructSecret)([shares[1], shares[2]], prime)).to.deep.equal(secret);
        });
        it("cannot reconstruct secret key if don't have enough shares", function () {
            (0, chai_1.expect)((0, demo_1.reconstructSecret)(shares.slice(0, 1), prime)).to.not.equal(secret);
            (0, chai_1.expect)((0, demo_1.reconstructSecret)(shares.slice(1, 2), prime)).to.not.equal(secret);
            (0, chai_1.expect)((0, demo_1.reconstructSecret)(shares.slice(2), prime)).to.not.equal(secret);
        });
        it("cannot reconstruct secret key if using wrong prime", function () {
            const randomPrime = (0, demo_1.generatePrime)(64);
            (0, chai_1.expect)((0, demo_1.reconstructSecret)(shares, randomPrime)).to.not.equal(secret);
        });
    });
});
