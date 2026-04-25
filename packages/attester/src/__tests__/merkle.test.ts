import { describe, it, expect } from 'vitest';
import { buildTree, getProof, verifyProof, dumpTree, loadTree, type Hex32 } from '../merkle';

const hex32 = (byte: string): Hex32 => `0x${byte.repeat(32)}` as Hex32;

describe('buildTree', () => {
  it('throws on empty input', () => {
    expect(() => buildTree([])).toThrow(/at least one leaf/);
  });

  it('throws on invalid leaf format', () => {
    expect(() => buildTree(['0xZZ' as Hex32])).toThrow(/invalid leaf format/);
  });

  it('produces identical root regardless of input order (sorted internally)', () => {
    const a = buildTree([hex32('11'), hex32('22'), hex32('33')]);
    const b = buildTree([hex32('33'), hex32('11'), hex32('22')]);
    expect(a.root).toEqual(b.root);
  });

  it('exposes sortedLeaves in lexicographic ascending order', () => {
    const r = buildTree([hex32('cc'), hex32('aa'), hex32('bb')]);
    expect(r.sortedLeaves).toEqual([hex32('aa'), hex32('bb'), hex32('cc')]);
  });

  it('builds a single-leaf tree whose root equals the leaf hash convention', () => {
    const r = buildTree([hex32('aa')]);
    expect(r.root).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('builds and verifies proofs for every leaf in an 8-leaf tree', () => {
    const leaves: Hex32[] = Array.from({ length: 8 }, (_, i) =>
      hex32(i.toString(16).padStart(2, '0'))
    );
    const { tree, root } = buildTree(leaves);
    for (const leaf of leaves) {
      const proof = getProof(tree, leaf);
      expect(proof.length).toBeGreaterThan(0);
      expect(verifyProof(root, leaf, proof)).toBe(true);
    }
  });

  it('rejects a forged leaf not in the tree', () => {
    const { tree, root } = buildTree([hex32('11'), hex32('22')]);
    const realProof = getProof(tree, hex32('11'));
    expect(verifyProof(root, hex32('99'), realProof)).toBe(false);
  });

  it('rejects a tampered proof', () => {
    const leaves = [hex32('11'), hex32('22'), hex32('33'), hex32('44')];
    const { tree, root } = buildTree(leaves);
    const proof = getProof(tree, hex32('11'));
    const tampered = [...proof];
    // Flip last byte of first proof element
    if (tampered.length > 0) {
      tampered[0] = (tampered[0].slice(0, -2) + 'ff') as Hex32;
    }
    expect(verifyProof(root, hex32('11'), tampered)).toBe(false);
  });
});

describe('dumpTree / loadTree round-trip', () => {
  it('dumped tree reloads and verifies the same proofs', () => {
    const leaves = [hex32('11'), hex32('22'), hex32('33')];
    const { tree, root } = buildTree(leaves);
    const dumped = dumpTree(tree);

    // Round-trip via JSON to simulate Postgres jsonb storage
    const restored = loadTree(JSON.parse(JSON.stringify(dumped)));
    const proof = restored.getProof([hex32('22')]);
    expect(verifyProof(root, hex32('22'), proof as Hex32[])).toBe(true);
  });
});
