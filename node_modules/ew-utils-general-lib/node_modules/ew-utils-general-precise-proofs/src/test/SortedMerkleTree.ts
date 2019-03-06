// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import { assert } from 'chai'
import 'mocha'
import { PreciseProofs } from '..';

describe('#####A', () => {
    const maxObjectSize = 65

    const createTestJson = (length: number): any => {
        const theObject = {}
        for (let i = 0; i < length; i++) {
            theObject[i] = 'value ' + i
        }
        return theObject
    }


    for(let i = 1; i < maxObjectSize; i++) {
        it(`Should verify proof for all keys object with size ${i} `, () => {
            const testJson = createTestJson(i)
            const leafs = PreciseProofs.createLeafs(testJson)
            const merkleTree = PreciseProofs.createMerkleTree(leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash))
            const proofs = Object.keys(testJson).map(key =>
                PreciseProofs.createProof(key, leafs, true, merkleTree)
            )
            const schema = leafs.map((leaf: PreciseProofs.Leaf) => leaf.key)
            const extendedTreeHash = PreciseProofs.createExtendedTreeRootHash(merkleTree[merkleTree.length - 1][0], schema)

            proofs.forEach((proof: PreciseProofs.Proof) => {

                PreciseProofs.verifyProof(extendedTreeHash, proof, schema)
                assert.isTrue(PreciseProofs.verifyProof(extendedTreeHash, proof, schema), `Proof could not be verified for key ${proof.key}`)
            })
        }).timeout(10000)





    }



})
