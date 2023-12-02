package token

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

const minSecretKeyLen = 32

type JwtMaker struct {
	secret_key []byte
}

func NewJwtMaker(secret_key string) (Maker, error) {
	if len(secret_key) < minSecretKeyLen {
		return nil, errors.New("invalid secret key length")
	}
	return &JwtMaker{secret_key: []byte(secret_key)}, nil
}

func (j *JwtMaker) GenerateToken(account_id string, username string, duration time.Duration) (string, *Payload, error) {
	payload := NewPayload(account_id, username, duration)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)

	tokenString, err := token.SignedString(j.secret_key)
	if err != nil {
		return "", nil, err
	}

	return tokenString, payload, nil
}

func (j *JwtMaker) VerifyToken(tokenString string) (*Payload, error) {
	// Check if the signin method is not changed
	checkSign := func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)

		if !ok {
			return nil, ErrInvalidToken
		}
		return j.secret_key, nil
	}

	token, err := jwt.ParseWithClaims(tokenString, &Payload{}, checkSign)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	// err := jwt.SigningMethodNone.Verify(tokenString, nil, secret_key)
	// token, err := jwt.ParseWithClaims(tokenString, &Payload{}, keyFunc)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return nil, err
	// }

	// token, err := parseAndVerify(tokenString, string(j.secret_key))
	// if err != nil {
	// 	fmt.Println(err)
	// 	return nil, err
	// }

	// return &token.Claims, nil

	if claims, ok := token.Claims.(*Payload); ok && token.Valid {
		return claims, nil
	} else {
		fmt.Println(ok)
		fmt.Println(claims)
		return nil, ErrInvalidToken
	}
}

// JWT represents a decoded JWT token.
type JWT struct {
	Header Header  `json:"header"`
	Claims Payload `json:"payload"`
}

// Header represents the JWT header.
type Header struct {
	Algorithm string `json:"alg"`
	Type      string `json:"typ"`
}

func parseAndVerify(tokenString string, secret_key string) (JWT, error) {
	// Split the token into header, payload, and signature parts
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return JWT{}, fmt.Errorf("invalid token format")
	}

	// Decode and parse the header
	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return JWT{}, fmt.Errorf("failed to decode header: %v", err)
	}

	var header Header
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return JWT{}, fmt.Errorf("failed to unmarshal header: %v", err)
	}

	// Decode and parse the claims
	claimsBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return JWT{}, fmt.Errorf("failed to decode claims: %v", err)
	}

	var claims Payload
	if err := json.Unmarshal(claimsBytes, &claims); err != nil {
		return JWT{}, fmt.Errorf("failed to unmarshal claims: %v", err)
	}

	// Additional Verification Checks
	currentTime := time.Now()

	// Expiration Time Check
	if currentTime.After(claims.ExpiredAt) {
		return JWT{}, fmt.Errorf("token has expired")
	}

	// Issued At Check
	if claims.IssuedAt.After(currentTime) {
		return JWT{}, fmt.Errorf("token was issued in the future")
	}

	// Issuer Check
	issuer, _ := claims.GetIssuer()
	if issuer != "red-gate" {
		return JWT{}, fmt.Errorf("invalid issuer")
	}

	// Subject Check
	user, _ := claims.GetSubject()
	if user != claims.Username {
		return JWT{}, fmt.Errorf("invalid subject")
	}

	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return JWT{}, fmt.Errorf("failed to decode signature: %v", err)
	}

	// Verify the signature using HMAC with SHA-256
	hash := hmac.New(sha256.New, []byte(secret_key))
	hash.Write([]byte(parts[0] + "." + parts[1]))

	if !hmac.Equal(hash.Sum(nil), signature) {
		return JWT{}, fmt.Errorf("signature verification failed")
	}

	return JWT{Header: header, Claims: claims}, nil
}
