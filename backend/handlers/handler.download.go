package handlers

import (
	"errors"
	"log"
	"net/http"
	"path/filepath"

	"redgate.com/b/db/sqlc"
)

func NewDownloadHandler(l *log.Logger, q *sqlc.Queries, u *AuthedUser) *DownloadHandler {
	var c uint = 0
	return &DownloadHandler{&Handler{l, q, &c, u}}
}

func (download_handler *DownloadHandler) DownloadHandler(w http.ResponseWriter, r *http.Request) {
	hp := HandlerParam{w, r, http.MethodGet, download_handler.download}
	download_handler.h.handleRequest(hp, download_handler.h.u)
}

func (dh *DownloadHandler) download(w http.ResponseWriter, r *http.Request) error {
	// Define specific file download
	files := "red-gate-manual.pdf"

	filePath := filepath.Join(files)
	if filePath == "" {
		http.Error(w, "Failed to download the file", http.StatusInternalServerError)
		return errors.New("DownloadFailed")
	}

	// Serve the file
	http.ServeFile(w, r, filePath)
	return nil
}
