-- name: GenerateLogs :one
INSERT INTO logs (account_id, v_id, location, ip_address)
VALUES ($1, $2, $3, $4)
RETURNING *;
