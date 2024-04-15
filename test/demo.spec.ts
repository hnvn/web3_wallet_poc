import { assert } from "chai";
import { createRandomWallet } from "../src/demo";

describe("smock test", function () {
    it("should run succesfully", function () {
        const [address, secret, mnemonic] = createRandomWallet();
        console.log("address", address);
        console.log("secret", secret);
        console.log("mnemonic", mnemonic);
    });
});