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

import {PreciseProofs} from './'
import { printMerkleTree } from './debug';


const test = {
    operationalSince: 0,
    capacityWh: 10,
    country: "Germany",
    region: "Saxony",
    active: true,
    nestedObject: {
        id: 1
    },
    zip: "09648",
    city: "Mittweida",
    street: "Main Street",
    houseNumber: "101",
    gpsLatitude: "0",
    gpsLongitude: "0"

}



console.log('\n\n### Object ###\n')

console.log(test)

console.log('\n\n### Leafs ###\n')
const leafs = PreciseProofs.createLeafs(test)

console.log(leafs)

const merkleTree = PreciseProofs.createMerkleTree(leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash))
console.log('\n\n### Merkle Tree ###\n')

console.log(merkleTree)
printMerkleTree(merkleTree, leafs, leafs.map((leaf: PreciseProofs.Leaf) => leaf.key))

const rootHash = merkleTree[merkleTree.length - 1][0]

const theProof = PreciseProofs.createProof('street', leafs, false)
console.log('\n\n### Proof ###\n')
console.log(theProof)
console.log(PreciseProofs.verifyProof(rootHash, theProof))

console.log('\n\n### Invalid Proof ###\n')
theProof.value = 'blaa'
console.log(theProof)
console.log(PreciseProofs.verifyProof(rootHash, theProof))

const extendedProof = PreciseProofs.createProof('city', leafs, true)
console.log('\n\n### Extended Proof ###\n')
console.log(extendedProof)
const schema = leafs.map((leaf: PreciseProofs.Leaf) => leaf.key)
const extendedTreeHash = PreciseProofs.createExtendedTreeRootHash(rootHash, schema)
console.log(PreciseProofs.verifyProof(extendedTreeHash, extendedProof, schema))

console.log('\n\n### Identical key attack ###\n')

const leafs2 = PreciseProofs.createLeafs(test)
leafs2[0] = {
    key: 'country',
    value: 'gb',
    hash: PreciseProofs.hash('country' + 'gb' + '1234567'),
    salt: '1234567'
}

const merkleTree2 = PreciseProofs.createMerkleTree(leafs2.map((leaf: PreciseProofs.Leaf) => leaf.hash))
printMerkleTree(merkleTree2, leafs2, leafs2.map((leaf: PreciseProofs.Leaf) => leaf.key))
