#!/usr/bin/env bash
# trace.ai — 60-second judge verification. NO API KEY REQUIRED.
# Proves a real AI decision is anchored on Base Sepolia, two independent ways.
set -euo pipefail

BASE="https://trace-ai-inky.vercel.app"
DID="be68c7fd-6af4-45be-a201-d0e52336c546"   # live, on-chain-anchored fraud-hold decision
TX="0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a"

echo "============================================================"
echo " 1) APP VERIFIER  (public endpoint, no auth)"
echo "============================================================"
curl -s "$BASE/api/v1/verify?decision_id=$DID"
echo
echo
echo "    Expect: \"verified\":true and checks schema/canonicalHash/"
echo "    merkleProof/onChainRoot/notary = pass."
echo
echo "============================================================"
echo " 2) INDEPENDENT ON-CHAIN PROOF  (Base Sepolia RPC, NOT the app)"
echo "============================================================"
curl -s https://sepolia.base.org \
  -H 'content-type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionReceipt\",\"params\":[\"$TX\"]}"
echo
echo
echo "    Expect: status 0x1 (success); \"to\" = the canonical EAS contract"
echo "    0x4200...0021; one Attested log. The anchor really is on-chain."
echo
echo "Open in a browser:  $BASE/verify?id=$DID"
