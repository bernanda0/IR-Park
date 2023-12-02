-- name: AddWallet :one
INSERT INTO wallet (wallet_id, account_id, balance)
VALUES (DEFAULT, $1, 0)
RETURNING wallet_id, account_id, balance;

-- name: TopUp :one
UPDATE wallet
SET balance = balance + $2
WHERE wallet_id = $1
RETURNING wallet_id, account_id, balance;

-- name: GetWalletID :one
SELECT wallet_id FROM wallet
WHERE account_id = $1;

-- name: GetBalance :one
SELECT balance FROM wallet
WHERE account_id = $1;