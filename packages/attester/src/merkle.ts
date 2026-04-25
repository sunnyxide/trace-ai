import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

import type { Hex32 } from './types';

export type { Hex32 };

export type BuildResult = {
  tree: StandardMerkleTree<[string]>;
  root: Hex32;
  /** Sorted (lexicographically ascending) leaf list as it was input to the tree. */
  sortedLeaves: Hex32[];
};

/**
 * Build an OpenZeppelin StandardMerkleTree over a set of bytes32 leaves.
 *
 * Leaves are sorted lexicographically before tree construction. This makes the
 * resulting root a deterministic function of the leaf SET (independent of input
 * order), which matches the L3 batcher's requirement: any two clients computing
 * the same root from the same set of canonical_hashes must agree.
 *
 * @throws if the leaves array is empty (a tree of zero leaves has no meaningful root).
 */
export function buildTree(leaves: Hex32[]): BuildResult {
  if (leaves.length === 0) {
    throw new Error('buildTree: at least one leaf is required');
  }
  // Validate format
  for (const l of leaves) {
    if (!/^0x[a-f0-9]{64}$/.test(l)) {
      throw new Error(`buildTree: invalid leaf format: ${l}`);
    }
  }
  const sortedLeaves = [...leaves].sort();
  const tree: StandardMerkleTree<[string]> = StandardMerkleTree.of(
    sortedLeaves.map((l): [string] => [l]),
    ['bytes32']
  );
  return { tree, root: tree.root as Hex32, sortedLeaves };
}

/**
 * Get a Merkle proof for a leaf in a previously built tree.
 *
 * @throws if the leaf is not in the tree.
 */
export function getProof(tree: StandardMerkleTree<[string]>, leaf: Hex32): Hex32[] {
  return tree.getProof([leaf]) as Hex32[];
}

/**
 * Verify a leaf membership in a tree given the root, leaf, and proof.
 *
 * Uses StandardMerkleTree.verify which is the same algorithm Solidity uses
 * (OpenZeppelin's MerkleProof.verify), so a proof generated here will
 * verify correctly on-chain via the same library.
 */
export function verifyProof(root: Hex32, leaf: Hex32, proof: Hex32[]): boolean {
  return StandardMerkleTree.verify(root, ['bytes32'], [leaf], proof);
}

/**
 * Serialize a tree to a JSON-compatible structure suitable for storage in
 * Postgres jsonb. Use `loadTree` to reconstruct a working tree.
 */
export function dumpTree(tree: StandardMerkleTree<[string]>): unknown {
  return tree.dump();
}

/**
 * Reconstitute a tree from its serialized form.
 */
export function loadTree(serialized: unknown): StandardMerkleTree<[string]> {
  // Type narrowed by the library at runtime
  return StandardMerkleTree.load(
    serialized as Parameters<typeof StandardMerkleTree.load>[0]
  ) as unknown as StandardMerkleTree<[string]>;
}
