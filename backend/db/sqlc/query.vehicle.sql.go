// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: query.vehicle.sql

package sqlc

import (
	"context"
	"database/sql"
)

const getPlateID = `-- name: GetPlateID :one
SELECT vd.v_id, a.is_subscribe
FROM vehicle_data AS vd
INNER JOIN account AS a ON vd.account_id = a.account_id
WHERE vd.account_id = $1
`

type GetPlateIDRow struct {
	VID         string       `json:"v_id"`
	IsSubscribe sql.NullBool `json:"is_subscribe"`
}

func (q *Queries) GetPlateID(ctx context.Context, accountID sql.NullString) (GetPlateIDRow, error) {
	row := q.db.QueryRowContext(ctx, getPlateID, accountID)
	var i GetPlateIDRow
	err := row.Scan(&i.VID, &i.IsSubscribe)
	return i, err
}

const getVehicleByID = `-- name: GetVehicleByID :one
SELECT v_id, account_id, plate_number FROM vehicle_data WHERE v_id = $1
`

func (q *Queries) GetVehicleByID(ctx context.Context, vID string) (VehicleDatum, error) {
	row := q.db.QueryRowContext(ctx, getVehicleByID, vID)
	var i VehicleDatum
	err := row.Scan(&i.VID, &i.AccountID, &i.PlateNumber)
	return i, err
}

const insertVehicle = `-- name: InsertVehicle :one
INSERT INTO vehicle_data (v_id, account_id, plate_number) VALUES ($1, $2, $3) RETURNING v_id, account_id, plate_number
`

type InsertVehicleParams struct {
	VID         string         `json:"v_id"`
	AccountID   sql.NullString `json:"account_id"`
	PlateNumber sql.NullString `json:"plate_number"`
}

func (q *Queries) InsertVehicle(ctx context.Context, arg InsertVehicleParams) (VehicleDatum, error) {
	row := q.db.QueryRowContext(ctx, insertVehicle, arg.VID, arg.AccountID, arg.PlateNumber)
	var i VehicleDatum
	err := row.Scan(&i.VID, &i.AccountID, &i.PlateNumber)
	return i, err
}

const verifyVehicle = `-- name: VerifyVehicle :one
SELECT vd.plate_number, vd.v_id, vd.account_id
FROM vehicle_data AS vd
INNER JOIN account AS a ON vd.account_id = a.account_id
WHERE vd.v_id = $1 AND a.is_subscribe = true
`

type VerifyVehicleRow struct {
	PlateNumber sql.NullString `json:"plate_number"`
	VID         string         `json:"v_id"`
	AccountID   sql.NullString `json:"account_id"`
}

func (q *Queries) VerifyVehicle(ctx context.Context, vID string) (VerifyVehicleRow, error) {
	row := q.db.QueryRowContext(ctx, verifyVehicle, vID)
	var i VerifyVehicleRow
	err := row.Scan(&i.PlateNumber, &i.VID, &i.AccountID)
	return i, err
}
