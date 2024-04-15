"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demo_1 = require("../src/demo");
describe("smock test", function () {
    it("should run succesfully", function () {
        const [address, secret, mnemonic] = (0, demo_1.createRandomWallet)();
        console.log("address", address);
        console.log("secret", secret);
        console.log("mnemonic", mnemonic);
    });
});
