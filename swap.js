const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const { Market, OpenOrders } = require("@project-serum/serum");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const bs58 = require("bs58");

// Define constants
const SOLANA_CLUSTER = "https://api.mainnet-beta.solana.com";
const SOL_MINT_ADDRESS = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
const DOGWIFTHAT_MINT_ADDRESS = new PublicKey(
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"
);
const MARKET_ADDRESS = new PublicKey("<YOUR_SERUM_MARKET_ADDRESS>");
const PAYER_SECRET_KEY = "your-secret-key-in-base58";

// Create connection and load wallet
const connection = new Connection(SOLANA_CLUSTER, "confirmed");
const payer = Keypair.fromSecretKey(bs58.decode(PAYER_SECRET_KEY));

async function swapTokens() {
  // Load the market
  const market = await Market.load(
    connection,
    MARKET_ADDRESS,
    {},
    "your_serum_program_id"
  );

  // Create token instances
  const solToken = new Token(
    connection,
    SOL_MINT_ADDRESS,
    TOKEN_PROGRAM_ID,
    payer
  );
  const dogToken = new Token(
    connection,
    DOGWIFTHAT_MINT_ADDRESS,
    TOKEN_PROGRAM_ID,
    payer
  );

  // Get associated token accounts
  const solTokenAccount = await solToken.getOrCreateAssociatedAccountInfo(
    payer.publicKey
  );
  const dogTokenAccount = await dogToken.getOrCreateAssociatedAccountInfo(
    payer.publicKey
  );

  // Create a new transaction
  const transaction = new Transaction();

  // Add swap instructions
  const swapInstruction = await market.makePlaceOrderInstruction(connection, {
    owner: payer,
    payer: solTokenAccount.address,
    side: "sell", // or 'buy' depending on the direction
    price: 1.0, // the price to swap at
    size: 1.0, // the amount to swap
    orderType: "limit", // or 'ioc' for immediate or cancel
  });

  transaction.add(swapInstruction);

  // Sign and send transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    payer,
  ]);
  console.log("Transaction signature:", signature);
}

swapTokens().catch(console.error);
